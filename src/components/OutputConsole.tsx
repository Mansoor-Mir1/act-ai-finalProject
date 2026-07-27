import React, { useState } from 'react';
import { Terminal, AlertCircle, CheckCircle, Sparkles, Clock, RefreshCw, Check } from 'lucide-react';
import { ExecutionResult, Exercise } from '../types';

interface OutputConsoleProps {
  result: ExecutionResult | null;
  exercise?: Exercise;
  onAskAiToExplainError?: (errorMessage: string) => void;
  onClearConsole?: () => void;
  isRunning: boolean;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({
  result,
  exercise,
  onAskAiToExplainError,
  onClearConsole,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState<'output' | 'tests'>('output');

  // Check test pass if expectedOutput exists
  let isTestPassed = false;
  if (result && exercise?.expectedOutput) {
    const cleanOutput = result.output.trim().replace(/\r\n/g, '\n');
    const cleanExpected = exercise.expectedOutput.trim().replace(/\r\n/g, '\n');
    isTestPassed = result.isSuccess && cleanOutput === cleanExpected;
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
      {/* Console Header Tabs */}
      <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('output')}
            className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors flex items-center space-x-1.5 ${
              activeTab === 'output'
                ? 'bg-slate-800 text-indigo-400 font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>CONSOLE OUTPUT</span>
            {result?.error && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          {exercise?.expectedOutput && (
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center space-x-1.5 ${
                activeTab === 'tests'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isTestPassed ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Test Results</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          {result?.executionTimeMs !== undefined && (
            <span className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
              <Clock className="w-3 h-3" />
              <span>{result.executionTimeMs}ms</span>
            </span>
          )}

          {onClearConsole && (
            <button
              onClick={onClearConsole}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors text-[11px]"
              title="Clear output console"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-3 font-mono text-xs overflow-y-auto bg-slate-950/90 text-slate-200 space-y-2 leading-relaxed">
        {isRunning ? (
          <div className="h-full flex items-center justify-center space-x-2 text-sky-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Executing Python code in WebAssembly...</span>
          </div>
        ) : !result ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
            <Terminal className="w-8 h-8 stroke-[1.5]" />
            <p className="text-xs">Click "Run Code" or press Ctrl+Enter to execute.</p>
          </div>
        ) : activeTab === 'output' ? (
          <div className="space-y-3">
            {/* Stdout Output */}
            {result.output ? (
              <div className="whitespace-pre-wrap font-mono text-slate-200 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                {result.output}
              </div>
            ) : (
              !result.error && (
                <p className="text-slate-500 italic">Code executed successfully with no printed output.</p>
              )
            )}

            {/* Error Display */}
            {result.error && (
              <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 space-y-2 text-rose-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Python Execution Error</span>
                  </div>

                  {onAskAiToExplainError && (
                    <button
                      onClick={() => onAskAiToExplainError(result.error!)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow transition-all"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-200" />
                      <span>Ask PyCoach to Explain</span>
                    </button>
                  )}
                </div>

                <pre className="whitespace-pre-wrap font-mono text-xs text-rose-200 bg-rose-950/80 p-2.5 rounded border border-rose-900/60 overflow-x-auto">
                  {result.error}
                </pre>
              </div>
            )}
          </div>
        ) : (
          /* Test Validation Tab */
          <div className="space-y-3">
            <div className={`p-3 rounded-xl border ${
              isTestPassed
                ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
            }`}>
              <div className="flex items-center space-x-2 font-bold mb-1">
                {isTestPassed ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Exercise Test Passed! 🎉</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">Output does not match expected result</span>
                  </>
                )}
              </div>
              <p className="text-[11px] opacity-90">
                {isTestPassed
                  ? 'Great job! Your program produced the exact expected output.'
                  : 'Check your print statements and string capitalization.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Your Output</span>
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200">
                  {result.output || '(No output)'}
                </pre>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Expected Output</span>
                <pre className="whitespace-pre-wrap font-mono text-xs text-emerald-300">
                  {exercise?.expectedOutput}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
