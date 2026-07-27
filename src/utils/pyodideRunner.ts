import { ExecutionResult } from '../types';

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    pyodideInstance?: any;
  }
}

let pyodidePromise: Promise<any> | null = null;

export async function getPyodide() {
  if (window.pyodideInstance) {
    return window.pyodideInstance;
  }

  if (!pyodidePromise) {
    pyodidePromise = new Promise((resolve, reject) => {
      // Check if script is already present
      if (document.getElementById('pyodide-script')) {
        const check = setInterval(() => {
          if (window.loadPyodide) {
            clearInterval(check);
            initPyodide().then(resolve).catch(reject);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.id = 'pyodide-script';
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
      script.async = true;

      script.onload = async () => {
        try {
          const pyodide = await initPyodide();
          resolve(pyodide);
        } catch (err) {
          reject(err);
        }
      };

      script.onerror = (err) => {
        reject(new Error('Failed to load Python execution runtime (Pyodide CDN).'));
      };

      document.head.appendChild(script);
    });
  }

  return pyodidePromise;
}

async function initPyodide() {
  if (!window.loadPyodide) {
    throw new Error('Pyodide script loaded but window.loadPyodide is missing.');
  }

  const pyodide = await window.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
  });

  window.pyodideInstance = pyodide;
  return pyodide;
}

export async function runPythonCode(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  try {
    const pyodide = await getPyodide();

    // Prepare Python wrapper script to capture stdout and stderr safely
    const setupCode = `
import sys
import io

_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()
sys.stdout = _stdout_buffer
sys.stderr = _stderr_buffer
`;

    const resetCode = `
_captured_out = _stdout_buffer.getvalue()
_captured_err = _stderr_buffer.getvalue()
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
(_captured_out, _captured_err)
`;

    // Reset Pyodide global state or execute
    await pyodide.runPythonAsync(setupCode);

    try {
      await pyodide.runPythonAsync(code);
    } catch (execError: any) {
      // Restore stdout/stderr even if user code throws
      await pyodide.runPythonAsync(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);
      const endTime = performance.now();
      return {
        output: '',
        error: execError.message || String(execError),
        executionTimeMs: Math.round(endTime - startTime),
        isSuccess: false,
      };
    }

    const [stdout, stderr] = await pyodide.runPythonAsync(resetCode);
    const endTime = performance.now();

    const cleanOutput = (stdout || '').trim();
    const cleanError = (stderr || '').trim();

    return {
      output: cleanOutput,
      error: cleanError.length > 0 ? cleanError : undefined,
      executionTimeMs: Math.round(endTime - startTime),
      isSuccess: !cleanError,
    };
  } catch (err: any) {
    const endTime = performance.now();
    return {
      output: '',
      error: err.message || 'Python execution engine error.',
      executionTimeMs: Math.round(endTime - startTime),
      isSuccess: false,
    };
  }
}
