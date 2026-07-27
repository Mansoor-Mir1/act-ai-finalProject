import React from 'react';
import { Sparkles, BookOpen, Flame, Trophy, Play, RotateCcw, PanelLeft, Code2 } from 'lucide-react';
import { Lesson } from '../types';

interface NavbarProps {
  currentLesson: Lesson;
  streakDays: number;
  points: number;
  completedCount: number;
  totalLessons: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isAiPanelOpen: boolean;
  onToggleAiPanel: () => void;
  isSandboxMode: boolean;
  onToggleSandbox: () => void;
  onRunCode: () => void;
  isRunning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLesson,
  streakDays,
  points,
  completedCount,
  totalLessons,
  isSidebarOpen,
  onToggleSidebar,
  isAiPanelOpen,
  onToggleAiPanel,
  isSandboxMode,
  onToggleSandbox,
  onRunCode,
  isRunning,
}) => {
  const progressPercent = Math.round((completedCount / (totalLessons || 1)) * 100);

  return (
    <header id="main-navbar" className="h-16 bg-slate-950 border-b border-slate-800 text-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xl">
      {/* Left section: Logo & Sidebar Toggle */}
      <div className="flex items-center space-x-4">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors border border-slate-800"
          title="Toggle Curriculum Sidebar"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => isSandboxMode && onToggleSandbox()}>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] text-base">
            🐍
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight text-white font-mono uppercase">PYTHON_ARCHITECT</span>
              <span className="text-[10px] font-mono tracking-widest uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
                Core Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">AI Interactive Learning Platform</p>
          </div>
        </div>
      </div>

      {/* Middle section: Current Lesson title or Sandbox badge */}
      <div className="hidden md:flex items-center space-x-4 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
        {isSandboxMode ? (
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono tracking-wide">
            <Code2 className="w-4 h-4" />
            <span>Python Sandbox / Playground Active</span>
          </div>
        ) : (
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-indigo-400 uppercase tracking-wider text-[11px] font-semibold">{currentLesson.moduleTitle}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-200 font-medium truncate max-w-[200px] lg:max-w-[320px]">
              {currentLesson.title}
            </span>
          </div>
        )}
      </div>

      {/* Right section: Gamification, Run code & AI Tutor toggle */}
      <div className="flex items-center space-x-3">
        {/* Sandbox toggle */}
        <button
          id="btn-toggle-sandbox"
          onClick={onToggleSandbox}
          className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all flex items-center space-x-1.5 ${
            isSandboxMode
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isSandboxMode ? 'Exit Sandbox' : 'Playground'}</span>
        </button>

        {/* Streak Counter */}
        <div className="flex items-center space-x-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span>{streakDays}d</span>
        </div>

        {/* Points Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold">
          <Trophy className="w-3.5 h-3.5" />
          <span>{points} pts</span>
        </div>

        {/* Run Code Button */}
        <button
          id="btn-run-code-nav"
          onClick={onRunCode}
          disabled={isRunning}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold font-mono px-4 py-2 rounded-lg flex items-center space-x-2 shadow-[0_0_15px_rgba(79,70,229,0.35)] transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Executing...' : 'Run (Ctrl+Enter)'}</span>
        </button>

        {/* AI Tutor Toggle */}
        <button
          id="btn-toggle-ai-tutor"
          onClick={onToggleAiPanel}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center space-x-1.5 ${
            isAiPanelOpen
              ? 'bg-slate-800 text-indigo-300 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">PyCoach AI</span>
        </button>
      </div>
    </header>
  );
};
