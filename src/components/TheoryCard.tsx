import React from 'react';
import { Lesson, LessonResource } from '../types';
import { CheckCircle, Target, ArrowRight, ArrowLeft, HelpCircle, Bookmark, BookmarkCheck, BookOpen, ExternalLink } from 'lucide-react';

interface TheoryCardProps {
  lesson: Lesson;
  resources?: LessonResource[];
  isCompleted: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onToggleCompletion?: () => void;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
  hasPrevLesson?: boolean;
  hasNextLesson?: boolean;
  onOpenQuiz?: () => void;
  onOpenPractice?: () => void;
}

export const TheoryCard: React.FC<TheoryCardProps> = ({
  lesson,
  resources,
  isCompleted,
  isBookmarked,
  onToggleBookmark,
  onToggleCompletion,
  onPrevLesson,
  onNextLesson,
  hasPrevLesson,
  hasNextLesson,
  onOpenQuiz,
  onOpenPractice,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
              {lesson.moduleTitle}
            </span>
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                isCompleted
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              }`}
            >
              {isCompleted ? 'Completed ✓' : 'In Progress'}
            </span>
          </div>
          <h2 className="text-lg font-light tracking-tight text-white mt-1">{lesson.title}</h2>
        </div>

        <div className="flex items-center space-x-2">
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-lg border transition-all ${
                isBookmarked
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-400/20" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}

          {onToggleCompletion && (
            <button
              onClick={onToggleCompletion}
              className={`flex items-center space-x-1.5 text-xs font-mono font-bold px-3 py-2 rounded-xl border transition-all shadow-md ${
                isCompleted
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${isCompleted ? 'fill-emerald-400/20 text-emerald-300' : 'text-white'}`} />
              <span>{isCompleted ? 'Completed ✓' : 'Mark as Complete'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Theory Markdown Content */}
      <div className="text-xs text-slate-300 leading-relaxed space-y-3 font-sans">
        <div className="whitespace-pre-line text-slate-300 space-y-2">
          {lesson.theoryMarkdown}
        </div>
      </div>

      {/* AI Quiz & Practice Call to Action Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {onOpenQuiz && (
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 flex flex-col justify-between space-y-2 shadow-md">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-indigo-200">AI Knowledge Quiz</p>
                <p className="text-[10px] text-slate-400">5 Multiple-Choice Questions</p>
              </div>
            </div>
            <button
              onClick={onOpenQuiz}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-1.5 px-3 rounded-lg shadow-[0_0_12px_rgba(79,70,229,0.3)] transition-all w-full"
            >
              Start Quiz 📝
            </button>
          </div>
        )}

        {onOpenPractice && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between space-y-2 shadow-md">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-emerald-200">Practice Problems</p>
                <p className="text-[10px] text-slate-400">5 Interactive Python Problems</p>
              </div>
            </div>
            <button
              onClick={onOpenPractice}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs py-1.5 px-3 rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all w-full"
            >
              Practice Problems 🎯
            </button>
          </div>
        )}
      </div>

      {/* 📚 Resources Section */}
      {resources && resources.length > 0 && (
        <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-2.5 shadow-md">
          <div className="flex items-center space-x-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>📚 Resources</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {resources.map((res) => (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 text-xs font-mono text-slate-200 hover:text-white transition-all group shadow-sm"
              >
                <div className="flex items-center space-x-2 truncate pr-2">
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate">{res.title}</span>
                </div>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                  {res.type}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Task Instructions */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 space-y-2">
        <div className="flex items-center space-x-2 text-indigo-400 font-mono font-bold text-xs uppercase tracking-wider">
          <Target className="w-4 h-4 text-indigo-400" />
          <span>Exercise Goal</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          {lesson.exercise.instructions}
        </p>

        {lesson.exercise.expectedOutput && (
          <div className="mt-2 bg-slate-900/90 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-widest mb-1">Target Output:</span>
            <span className="text-emerald-400 whitespace-pre-wrap">{lesson.exercise.expectedOutput}</span>
          </div>
        )}
      </div>

      {/* Linear Navigation Controls */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <button
          onClick={onPrevLesson}
          disabled={!hasPrevLesson}
          className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-mono font-semibold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-800 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Lesson</span>
        </button>

        <button
          onClick={onNextLesson}
          disabled={!hasNextLesson}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-mono font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
        >
          <span>Next Lesson</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
