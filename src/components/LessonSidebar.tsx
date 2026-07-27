import React from 'react';
import { LessonModule, Lesson } from '../types';
import { CheckCircle2, Circle, BookOpen, Clock, ChevronRight, Bookmark } from 'lucide-react';

interface LessonSidebarProps {
  modules: LessonModule[];
  currentLessonId: string;
  completedLessonIds: string[];
  bookmarkedLessonIds?: string[];
  onSelectLesson: (lesson: Lesson) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  modules,
  currentLessonId,
  completedLessonIds,
  bookmarkedLessonIds = [],
  onSelectLesson,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.round((completedCount / (totalLessons || 1)) * 100);

  return (
    <aside id="curriculum-sidebar" className="w-80 bg-slate-950 border-r border-slate-800 h-[calc(100vh-64px)] flex flex-col z-20 shrink-0">
      {/* Sidebar Header & Progress */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-300">CURRICULUM ROADMAP</span>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400">{progressPercent}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] h-1.5 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 text-[10px] font-mono text-slate-500 flex justify-between">
          <span>{completedCount}/{totalLessons} LESSONS COMPLETED</span>
          <span className="text-emerald-400 font-semibold">CORE TRACK</span>
        </div>
      </div>

      {/* Modules list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {modules.map((mod) => (
          <div key={mod.id} className="space-y-1.5">
            <div className="px-2 py-1 flex items-center justify-between">
              <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{mod.title}</h3>
            </div>
            
            <div className="space-y-1">
              {mod.lessons.map((lesson) => {
                const isCurrent = lesson.id === currentLessonId;
                const isCompleted = completedLessonIds.includes(lesson.id);
                const isBookmarked = bookmarkedLessonIds.includes(lesson.id);

                let statusLabel = 'Not Started';
                let statusBadgeStyle = 'bg-slate-800/60 text-slate-400 border-slate-700/50';

                if (isCompleted) {
                  statusLabel = 'Completed';
                  statusBadgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                } else if (isCurrent) {
                  statusLabel = 'In Progress';
                  statusBadgeStyle = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
                }

                return (
                  <button
                    key={lesson.id}
                    id={`sidebar-lesson-${lesson.id}`}
                    onClick={() => onSelectLesson(lesson)}
                    className={`w-full text-left p-3 rounded-r transition-all flex items-start space-x-3 group ${
                      isCurrent
                        ? 'bg-indigo-500/10 border-l-2 border-indigo-500 text-white shadow-sm'
                        : 'hover:bg-slate-900/60 border-l-2 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                        </div>
                      ) : (
                        <Circle className="w-4 h-4 text-slate-700 group-hover:text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-indigo-300' : 'text-slate-200'}`}>
                          {lesson.title}
                        </p>
                        {isBookmarked && <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0 ml-1" />}
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-[10px] font-mono text-slate-500">
                        <span className={`px-1.5 py-0.2 rounded border text-[9px] font-mono font-bold uppercase ${statusBadgeStyle}`}>
                          {statusLabel}
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration}</span>
                        </span>
                      </div>
                    </div>

                    {isCurrent && <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 self-center" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 text-center">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Architectural Mode: Guided Learning
        </p>
      </div>
    </aside>
  );
};
