import React from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Copy, Check, Sparkles, Terminal } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
  isRunning: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onRun,
  onReset,
  isRunning,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    // Add command shortcut for Ctrl+Enter / Cmd+Enter to run code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
      {/* Editor Header Bar */}
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 pl-2">
            main.py
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-copy-code"
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs flex items-center space-x-1"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            id="btn-reset-code"
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs flex items-center space-x-1"
            title="Reset to initial starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Reset</span>
          </button>

          <button
            id="btn-run-code-editor"
            onClick={onRun}
            disabled={isRunning}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold px-3.5 py-1.5 rounded flex items-center space-x-1.5 shadow-[0_0_12px_rgba(79,70,229,0.3)] transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? 'Executing...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 relative min-h-[220px]">
        <Editor
          height="100%"
          defaultLanguage="python"
          language="python"
          value={code}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "Fira Code, JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            lineNumbersMinChars: 3,
            padding: { top: 12, bottom: 12 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
          }}
        />
      </div>

      {/* Editor Footer Bar */}
      <div className="bg-slate-900/90 px-3 py-1 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center">
        <span>Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300 font-mono">Ctrl+Enter</kbd> to run Python code instantly</span>
        <span className="text-slate-400">Python 3.12 (Pyodide WebAssembly)</span>
      </div>
    </div>
  );
};
