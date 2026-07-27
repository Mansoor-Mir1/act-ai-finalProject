import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PYTHON_MODULES } from '../data/pythonLessons';
import { Lesson } from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  BookOpen,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Play,
  ArrowLeft,
  Award,
  Sparkles,
  BarChart2,
  Clock,
  Circle,
  HelpCircle,
  Flame,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';

export const LearningProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [bookmarkedLessonIds, setBookmarkedLessonIds] = useState<string[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string>('py-101');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'completed' | 'bookmarks' | 'quizzes'>('overview');

  // Flatten all lessons across modules
  const allLessons: Lesson[] = PYTHON_MODULES.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const remainingCount = Math.max(0, totalLessons - completedCount);
  const completionPercentage = Math.round((completedCount / (totalLessons || 1)) * 100);

  // Find current lesson object
  const currentLesson = allLessons.find((l) => l.id === currentLessonId) || allLessons[0];

  // Find last incomplete lesson for "Continue Learning"
  const lastIncompleteLesson = allLessons.find((l) => !completedLessonIds.includes(l.id)) || currentLesson;

  // Fetch user progress from Firestore
  useEffect(() => {
    const fetchProgress = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userDocRef);

        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.completedLessonIds)) {
            setCompletedLessonIds(data.completedLessonIds);
          }
          if (Array.isArray(data.bookmarkedLessonIds)) {
            setBookmarkedLessonIds(data.bookmarkedLessonIds);
          }
          if (data.currentLessonId) {
            setCurrentLessonId(data.currentLessonId);
          }
        }
      } catch (err) {
        console.error('Error fetching progress in LearningProgressPage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [currentUser]);

  // Toggle Bookmark status
  const handleToggleBookmark = async (lessonId: string) => {
    const isBookmarked = bookmarkedLessonIds.includes(lessonId);
    const updated = isBookmarked
      ? bookmarkedLessonIds.filter((id) => id !== lessonId)
      : [...bookmarkedLessonIds, lessonId];

    setBookmarkedLessonIds(updated);

    if (currentUser) {
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          { bookmarkedLessonIds: updated },
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to update bookmarks in Firestore:', err);
      }
    }
  };

  // Toggle Completion status
  const handleToggleCompletion = async (lessonId: string) => {
    const isCompleted = completedLessonIds.includes(lessonId);
    const updated = isCompleted
      ? completedLessonIds.filter((id) => id !== lessonId)
      : [...completedLessonIds, lessonId];

    setCompletedLessonIds(updated);

    if (currentUser) {
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          { completedLessonIds: updated },
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to update completion status in Firestore:', err);
      }
    }
  };

  // Navigate to Dashboard with specific lesson
  const handleOpenLesson = async (lesson: Lesson) => {
    if (currentUser) {
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          { currentLessonId: lesson.id },
          { merge: true }
        );
      } catch (e) {
        console.error('Failed to save selected lesson:', e);
      }
    }
    navigate('/student/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
        <p className="text-xs font-mono text-slate-400 tracking-wider uppercase animate-pulse">Loading Progress Analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xl">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors border border-slate-800 flex items-center space-x-2 text-xs font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspace</span>
          </button>

          <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white font-mono uppercase">LEARNING_PROGRESS_HUB</h1>
              <p className="text-[11px] text-slate-500">Track Course Completion, Bookmarks & Performance</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenLesson(lastIncompleteLesson)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs py-2 px-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center space-x-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Continue Learning</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto p-6 space-y-8 flex-1">
        {/* Welcome & Progress Overview Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  Student Analytics
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">
                  {userProfile?.displayName || userProfile?.email || 'Student'}
                </span>
              </div>
              <h2 className="text-2xl font-light text-white tracking-tight">
                Python Mastery Progress
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Track your active journey across all {totalLessons} curriculum lessons. Bookmarks and completion records are safely synced with your profile.
              </p>
            </div>

            {/* "Continue Learning" Quick Action */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl shrink-0 space-y-2 max-w-xs">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                Next Up in Track:
              </span>
              <p className="text-xs font-bold text-slate-200 truncate">
                {lastIncompleteLesson.title}
              </p>
              <button
                onClick={() => handleOpenLesson(lastIncompleteLesson)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md"
              >
                <span>Continue Learning</span>
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Overall Course Progress:</span>
              <span className="text-indigo-300 font-bold">{completionPercentage}% Completed</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Core Stats Grid: Total, Completed, Remaining, Percentage */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Lessons */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Total Lessons</span>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-mono font-bold text-white">{totalLessons}</p>
            <p className="text-[10px] text-slate-500 font-mono">Across all modules</p>
          </div>

          {/* Completed Lessons */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-mono font-bold text-emerald-400">{completedCount}</p>
            <p className="text-[10px] text-slate-500 font-mono">Verified finished</p>
          </div>

          {/* Remaining Lessons */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Remaining</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-mono font-bold text-amber-300">{remainingCount}</p>
            <p className="text-[10px] text-slate-500 font-mono">Lessons to complete</p>
          </div>

          {/* Completion Percentage */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Completion Rate</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-mono font-bold text-purple-300">{completionPercentage}%</p>
            <p className="text-[10px] text-slate-500 font-mono">Overall percentage</p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-mono font-bold transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Roadmap
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 text-xs font-mono font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'completed'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Completed Lessons</span>
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">
              {completedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-3 text-xs font-mono font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'bookmarks'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Bookmarked Lessons</span>
            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-[10px]">
              {bookmarkedLessonIds.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`pb-3 text-xs font-mono font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'quizzes'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Quiz Statistics</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ROADMAP */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Lesson Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
                  <Flame className="w-4 h-4" />
                  <span>Current Active Lesson</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  {currentLesson.moduleTitle}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">
                    {currentLesson.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {currentLesson.description}
                  </p>
                  <div className="flex items-center space-x-3 pt-1 text-[11px] font-mono text-slate-500">
                    <span>Duration: {currentLesson.duration}</span>
                    <span>•</span>
                    <span>Difficulty: {currentLesson.difficulty}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleToggleBookmark(currentLesson.id)}
                    className={`p-2 rounded-lg border transition-colors ${
                      bookmarkedLessonIds.includes(currentLesson.id)
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={bookmarkedLessonIds.includes(currentLesson.id) ? 'Remove Bookmark' : 'Bookmark Lesson'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenLesson(currentLesson)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-all shadow-md"
                  >
                    <span>Resume Workspace</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            </div>

            {/* Curriculum Modules Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                Full Curriculum Breakdown
              </h3>

              {PYTHON_MODULES.map((module) => (
                <div key={module.id} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase">
                        {module.title}
                      </h4>
                      <p className="text-xs text-slate-400">{module.description}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {module.lessons.filter((l) => completedLessonIds.includes(l.id)).length} / {module.lessons.length} Done
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/60">
                    {module.lessons.map((lesson) => {
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      const isBookmarked = bookmarkedLessonIds.includes(lesson.id);
                      const isCurrent = lesson.id === currentLessonId;

                      let statusLabel = 'Not Started';
                      let statusBadgeStyle = 'bg-slate-800/60 text-slate-400 border-slate-700/50';

                      if (isCompleted) {
                        statusLabel = 'Completed ✓';
                        statusBadgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                      } else if (isCurrent) {
                        statusLabel = 'In Progress';
                        statusBadgeStyle = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
                      }

                      return (
                        <div
                          key={lesson.id}
                          className={`p-3.5 flex items-center justify-between hover:bg-slate-900/80 transition-colors ${
                            isCurrent ? 'bg-indigo-500/5' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <button
                              onClick={() => handleToggleCompletion(lesson.id)}
                              className="shrink-0 text-slate-600 hover:text-emerald-400 transition-colors"
                              title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                              ) : isCurrent ? (
                                <div className="w-5 h-5 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                                </div>
                              ) : (
                                <Circle className="w-5 h-5 text-slate-700 hover:text-slate-500" />
                              )}
                            </button>

                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <p
                                  onClick={() => handleOpenLesson(lesson)}
                                  className={`text-xs font-semibold cursor-pointer hover:underline truncate ${
                                    isCurrent ? 'text-indigo-300 font-bold' : 'text-slate-200'
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${statusBadgeStyle}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">{lesson.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 ml-4">
                            <button
                              onClick={() => handleToggleBookmark(lesson.id)}
                              className={`p-1.5 rounded transition-colors ${
                                isBookmarked
                                  ? 'text-amber-400 bg-amber-500/10'
                                  : 'text-slate-600 hover:text-slate-300'
                              }`}
                              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenLesson(lesson)}
                              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded transition-colors"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: COMPLETED LESSONS */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed Lessons ({completedCount})</span>
              </h3>
            </div>

            {completedCount === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Circle className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-medium text-slate-300">No completed lessons yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Run exercise code or mark lessons as completed to track your finished topics here.
                </p>
                <button
                  onClick={() => handleOpenLesson(currentLesson)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-2 px-4 rounded-xl shadow-md transition-all inline-block mt-2"
                >
                  Start First Lesson
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allLessons
                  .filter((l) => completedLessonIds.includes(l.id))
                  .map((lesson) => (
                    <div
                      key={lesson.id}
                      className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Completed ✓
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {lesson.moduleTitle}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white pt-1">{lesson.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{lesson.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleToggleCompletion(lesson.id)}
                          className="text-[11px] font-mono text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          Mark Incomplete
                        </button>
                        <button
                          onClick={() => handleOpenLesson(lesson)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold py-1.5 px-3 rounded-lg transition-all"
                        >
                          Review Lesson
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BOOKMARKED LESSONS */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <Bookmark className="w-4 h-4" />
                <span>Bookmarked Lessons ({bookmarkedLessonIds.length})</span>
              </h3>
            </div>

            {bookmarkedLessonIds.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-medium text-slate-300">No bookmarked lessons</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the bookmark icon on any lesson to save it for quick review later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allLessons
                  .filter((l) => bookmarkedLessonIds.includes(l.id))
                  .map((lesson) => (
                    <div
                      key={lesson.id}
                      className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Bookmarked 🔖
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {lesson.moduleTitle}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white pt-1">{lesson.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{lesson.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleToggleBookmark(lesson.id)}
                          className="text-[11px] font-mono text-slate-500 hover:text-amber-400 transition-colors"
                        >
                          Remove Bookmark
                        </button>
                        <button
                          onClick={() => handleOpenLesson(lesson)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold py-1.5 px-3 rounded-lg transition-all"
                        >
                          Open Lesson
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUIZ STATISTICS PLACEHOLDER */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-2">
                <HelpCircle className="w-4 h-4" />
                <span>Quiz & Practice Analytics</span>
              </h3>
            </div>

            {/* Placeholder Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Quizzes Completed</span>
                <p className="text-2xl font-mono font-bold text-purple-300">3 Sets</p>
                <p className="text-[10px] text-slate-500 font-mono">AI generated quizzes</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Average Quiz Score</span>
                <p className="text-2xl font-mono font-bold text-emerald-400">88%</p>
                <p className="text-[10px] text-slate-500 font-mono">Accuracy rating</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Practice Sets Solved</span>
                <p className="text-2xl font-mono font-bold text-indigo-300">12 Problems</p>
                <p className="text-[10px] text-slate-500 font-mono">Step-by-step verification</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
              <h4 className="text-sm font-mono font-bold text-white">Interactive Quiz Analytics Engine</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Take AI Quizzes and Practice Problems inside the workspace to populate live topic mastery graphs and strength breakdowns.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
