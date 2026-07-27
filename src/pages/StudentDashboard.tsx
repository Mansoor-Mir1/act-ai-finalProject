import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PYTHON_MODULES } from '../data/pythonLessons';
import { Lesson, LessonResource } from '../types';
import { getLessonsFromFirestore, getLessonResources } from '../lib/firestoreService';
import { LessonSidebar } from '../components/LessonSidebar';
import { TheoryCard } from '../components/TheoryCard';
import { CodeEditor } from '../components/CodeEditor';
import { OutputConsole } from '../components/OutputConsole';
import { AITutorPanel } from '../components/AITutorPanel';
import { AIQuizModal } from '../components/AIQuizModal';
import { AIPracticeModal } from '../components/AIPracticeModal';
import { runPythonCode } from '../utils/pyodideRunner';
import { ExecutionResult } from '../types';
import { LogOut, PanelLeft, Play, ShieldCheck, CheckCircle2, Sparkles, HelpCircle, Target, BarChart2, Bookmark } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  
  // Lessons loaded from Firestore or fallback
  const [allLessons, setAllLessons] = useState<Lesson[]>(() => PYTHON_MODULES.flatMap((mod) => mod.lessons));
  const [currentLesson, setCurrentLesson] = useState<Lesson>(allLessons[0]);
  const [currentResources, setCurrentResources] = useState<LessonResource[]>([]);
  const [code, setCode] = useState<string>(allLessons[0]?.exercise?.initialCode || '');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [bookmarkedLessonIds, setBookmarkedLessonIds] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [aiTutorOpen, setAiTutorOpen] = useState<boolean>(true);
  const [quizModalOpen, setQuizModalOpen] = useState<boolean>(false);
  const [practiceModalOpen, setPracticeModalOpen] = useState<boolean>(false);
  const [externalErrorToExplain, setExternalErrorToExplain] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Load published lessons from Firestore on mount
  useEffect(() => {
    const loadPublishedLessons = async () => {
      try {
        const firestoreLessons = await getLessonsFromFirestore(true); // Published only for student
        if (firestoreLessons && firestoreLessons.length > 0) {
          setAllLessons(firestoreLessons);
        }
      } catch (err) {
        console.error('Error fetching student lessons from Firestore:', err);
      }
    };

    loadPublishedLessons();
  }, []);

  // Fetch external learning resources for the current lesson from Firestore
  useEffect(() => {
    const fetchResources = async () => {
      if (!currentLesson?.id) return;
      try {
        const resList = await getLessonResources(currentLesson.id);
        setCurrentResources(resList);
      } catch (err) {
        console.error('Error loading current lesson resources:', err);
        setCurrentResources([]);
      }
    };

    fetchResources();
  }, [currentLesson?.id]);

  // Load last opened lesson, completed lessons, & bookmarks from Firestore
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!currentUser) return;
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.currentLessonId && allLessons.length > 0) {
            const found = allLessons.find((l) => l.id === data.currentLessonId);
            if (found) {
              setCurrentLesson(found);
              setCode(found.exercise.initialCode);
            }
          }
          if (Array.isArray(data.completedLessonIds)) {
            setCompletedLessonIds(data.completedLessonIds);
          }
          if (Array.isArray(data.bookmarkedLessonIds)) {
            setBookmarkedLessonIds(data.bookmarkedLessonIds);
          }
        }
      } catch (err) {
        console.error('Failed to load user progress from Firestore:', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchUserProgress();
  }, [currentUser, allLessons]);

  // Toggle bookmark handler
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
      } catch (e) {
        console.error('Failed to save bookmark:', e);
      }
    }
  };

  // Toggle lesson completion handler
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
      } catch (e) {
        console.error('Failed to save completion status:', e);
      }
    }
  };

  // "Continue Learning" - opens the last/first incomplete lesson
  const handleContinueLearning = () => {
    const nextIncomplete = allLessons.find((l) => !completedLessonIds.includes(l.id));
    if (nextIncomplete) {
      handleSelectLesson(nextIncomplete);
    }
  };

  // Handle lesson change and persist in Firestore
  const handleSelectLesson = async (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCode(lesson.exercise.initialCode);
    setExecutionResult(null);

    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          userDocRef,
          {
            currentLessonId: lesson.id,
            lastOpenedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error saving current lesson to Firestore:', err);
      }
    }
  };

  // Find index for Previous and Next navigation
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const hasPrevLesson = currentIndex > 0;
  const hasNextLesson = currentIndex < allLessons.length - 1;

  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      handleSelectLesson(allLessons[currentIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      handleSelectLesson(allLessons[currentIndex + 1]);
    }
  };

  // Code Execution Handler
  const handleRunCode = async () => {
    setIsRunning(true);
    setExecutionResult(null);

    const result = await runPythonCode(code);
    setExecutionResult(result);
    setIsRunning(false);

    // Auto-mark completed if output matches expected
    if (
      result.isSuccess &&
      currentLesson.exercise.expectedOutput &&
      result.output.trim().replace(/\r\n/g, '\n') === currentLesson.exercise.expectedOutput.trim().replace(/\r\n/g, '\n')
    ) {
      if (!completedLessonIds.includes(currentLesson.id)) {
        const newCompleted = [...completedLessonIds, currentLesson.id];
        setCompletedLessonIds(newCompleted);

        if (currentUser) {
          try {
            await setDoc(
              doc(db, 'users', currentUser.uid),
              { completedLessonIds: newCompleted },
              { merge: true }
            );
          } catch (e) {
            console.error('Failed to save completion status:', e);
          }
        }
      }
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
        <p className="text-xs font-mono text-slate-400 tracking-wider uppercase animate-pulse">Loading Roadmap & Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xl shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors border border-slate-800"
            title="Toggle Python Roadmap Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] text-base">
              🐍
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-white font-mono uppercase">PYTHON_ARCHITECT</span>
                <span className="text-[10px] font-mono tracking-widest uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
                  Student Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">AI Python Learning Platform</p>
            </div>
          </div>
        </div>

        {/* Middle Active Lesson Title */}
        <div className="hidden md:flex items-center space-x-3 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800 font-mono text-xs">
          <span className="text-indigo-400 uppercase tracking-wider text-[11px] font-semibold">{currentLesson.moduleTitle}</span>
          <span className="text-slate-700">•</span>
          <span className="text-slate-200 font-medium truncate max-w-[280px]">
            {currentLesson.title}
          </span>
        </div>

        {/* Right Section: Student Info, PyCoach Toggle, AI Quiz, Practice Problems, Learning Progress & Logout */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/student/progress')}
            className="px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md"
            title="Open Learning Progress & Analytics Dashboard"
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">My Progress</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
              {Math.round((completedLessonIds.length / (allLessons.length || 1)) * 100)}%
            </span>
          </button>

          <button
            onClick={handleContinueLearning}
            className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md"
            title="Continue Learning - Opens last incomplete lesson"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            <span className="hidden md:inline">Continue</span>
          </button>

          <button
            onClick={() => setPracticeModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md"
            title="Start Interactive Practice Problems for current lesson"
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Practice Problems 🎯</span>
          </button>

          <button
            onClick={() => setQuizModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md"
            title="Take AI Knowledge Quiz for current lesson"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">AI Quiz 📝</span>
          </button>

          <button
            onClick={() => setAiTutorOpen(!aiTutorOpen)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center space-x-2 transition-all shadow-md ${
              aiTutorOpen
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_12px_rgba(79,70,229,0.4)]'
                : 'bg-slate-900 hover:bg-slate-800 text-indigo-400 border-indigo-500/30'
            }`}
            title="Toggle PyCoach AI Tutor Panel"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden sm:inline">PyCoach AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <div className="hidden 2xl:flex items-center space-x-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-slate-300">{userProfile?.displayName || userProfile?.email}</span>
          </div>

          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono flex items-center space-x-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Roadmap Sidebar */}
        <LessonSidebar
          modules={PYTHON_MODULES}
          currentLessonId={currentLesson.id}
          completedLessonIds={completedLessonIds}
          bookmarkedLessonIds={bookmarkedLessonIds}
          onSelectLesson={handleSelectLesson}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Center/Right Main Content Grid */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-w-7xl mx-auto">
            {/* Notes & Theory Card Column */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <TheoryCard
                lesson={currentLesson}
                resources={currentResources}
                isCompleted={completedLessonIds.includes(currentLesson.id)}
                isBookmarked={bookmarkedLessonIds.includes(currentLesson.id)}
                onToggleBookmark={() => handleToggleBookmark(currentLesson.id)}
                onToggleCompletion={() => handleToggleCompletion(currentLesson.id)}
                onPrevLesson={handlePrevLesson}
                onNextLesson={handleNextLesson}
                hasPrevLesson={hasPrevLesson}
                hasNextLesson={hasNextLesson}
                onOpenQuiz={() => setQuizModalOpen(true)}
                onOpenPractice={() => setPracticeModalOpen(true)}
              />
            </div>

            {/* Code Editor & Execution Console Column */}
            <div className="lg:col-span-7 flex flex-col space-y-4 h-full">
              {/* Monaco Code Editor */}
              <div className="flex-1 min-h-[380px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
                <CodeEditor
                  code={code}
                  onChange={(val) => setCode(val)}
                  onRun={handleRunCode}
                  isRunning={isRunning}
                  lessonTitle={currentLesson.title}
                />
              </div>

              {/* Console Output Window */}
              <div className="h-48 shrink-0">
                <OutputConsole
                  result={executionResult}
                  exercise={currentLesson.exercise}
                  onAskAiToExplainError={(err) => {
                    setExternalErrorToExplain(err);
                    setAiTutorOpen(true);
                  }}
                  onClearConsole={() => setExecutionResult(null)}
                  isRunning={isRunning}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Right PyCoach AI Tutor Panel */}
        <AITutorPanel
          currentLesson={currentLesson}
          userCode={code}
          isOpen={aiTutorOpen}
          onClose={() => setAiTutorOpen(false)}
          externalErrorToExplain={externalErrorToExplain}
          onClearExternalError={() => setExternalErrorToExplain(null)}
          onStartQuiz={() => setQuizModalOpen(true)}
          onStartPractice={() => setPracticeModalOpen(true)}
        />

        {/* AI Quiz Modal */}
        <AIQuizModal
          currentLesson={currentLesson}
          isOpen={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
        />

        {/* AI Practice Problems Modal */}
        <AIPracticeModal
          currentLesson={currentLesson}
          isOpen={practiceModalOpen}
          onClose={() => setPracticeModalOpen(false)}
        />
      </div>
    </div>
  );
};
