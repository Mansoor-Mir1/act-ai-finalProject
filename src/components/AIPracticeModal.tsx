import React, { useState, useEffect } from 'react';
import { Lesson } from '../types';
import {
  Target,
  X,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  Loader2,
  Code,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface PracticeProblem {
  problemTitle: string;
  problemStatement: string;
  starterCode?: string;
  difficulty: string;
  expectedConcept?: string;
}

interface EvaluationResult {
  isCorrect: boolean;
  congratulations?: string;
  explanation?: string;
  mistake?: string;
  hint?: string;
}

interface ProblemHistoryItem {
  problemIndex: number;
  problemTitle: string;
  problemStatement: string;
  studentAnswer: string;
  isCorrect: boolean;
  attempts: number;
  explanation?: string;
}

interface FinalSummary {
  strengths: string[];
  weaknesses: string[];
  recommendedReview: string;
  summaryNote: string;
}

interface AIPracticeModalProps {
  currentLesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
}

export const AIPracticeModal: React.FC<AIPracticeModalProps> = ({
  currentLesson,
  isOpen,
  onClose,
}) => {
  const TOTAL_PROBLEMS = 5;

  const [practiceState, setPracticeState] = useState<'intro' | 'problem' | 'summary'>('intro');
  const [currentProblemIndex, setCurrentProblemIndex] = useState(1);
  const [currentProblem, setCurrentProblem] = useState<PracticeProblem | null>(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [attemptsCount, setAttemptsCount] = useState(1);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ProblemHistoryItem[]>([]);
  const [finalSummary, setFinalSummary] = useState<FinalSummary | null>(null);

  // Reset when modal opens or lesson changes
  useEffect(() => {
    if (isOpen) {
      resetSession();
    }
  }, [isOpen, currentLesson.id]);

  const resetSession = () => {
    setPracticeState('intro');
    setCurrentProblemIndex(1);
    setCurrentProblem(null);
    setStudentAnswer('');
    setAttemptsCount(1);
    setIsEvaluating(false);
    setIsLoadingProblem(false);
    setIsLoadingSummary(false);
    setEvaluationResult(null);
    setScore(0);
    setErrorMessage(null);
    setHistory([]);
    setFinalSummary(null);
  };

  // Fetch ONE problem at a time from backend
  const fetchSingleProblem = async (pIndex: number, prevProblemsList: string[]) => {
    setIsLoadingProblem(true);
    setErrorMessage(null);
    setEvaluationResult(null);
    setAttemptsCount(1);

    try {
      const response = await fetch('/api/ai/practice/generate-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: currentLesson.title,
          moduleTitle: currentLesson.moduleTitle,
          theoryMarkdown: currentLesson.theoryMarkdown,
          difficulty: currentLesson.difficulty || 'Beginner',
          problemIndex: pIndex,
          totalProblems: TOTAL_PROBLEMS,
          previousProblems: prevProblemsList,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate practice problem.');
      }

      setCurrentProblem(data.problem);
      setStudentAnswer(data.problem.starterCode || '');
      setPracticeState('problem');
    } catch (err: any) {
      console.error('Practice Fetch Error:', err);
      setErrorMessage(err.message || 'Unable to load practice problem. Please retry.');
    } finally {
      setIsLoadingProblem(false);
    }
  };

  const handleStartPractice = () => {
    resetSession();
    fetchSingleProblem(1, []);
  };

  // Submit student's answer to backend for verification
  const handleSubmitAnswer = async () => {
    if (!studentAnswer.trim() || !currentProblem || isEvaluating) return;

    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/practice/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: currentProblem.problemTitle,
          problemStatement: currentProblem.problemStatement,
          starterCode: currentProblem.starterCode,
          studentAnswer,
          lessonTitle: currentLesson.title,
          difficulty: currentLesson.difficulty || 'Beginner',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify answer.');
      }

      const evalRes: EvaluationResult = data.evaluation;
      setEvaluationResult(evalRes);

      if (evalRes.isCorrect) {
        // Increase score if correct
        setScore((prev) => prev + 1);

        // Record history
        const item: ProblemHistoryItem = {
          problemIndex: currentProblemIndex,
          problemTitle: currentProblem.problemTitle,
          problemStatement: currentProblem.problemStatement,
          studentAnswer,
          isCorrect: true,
          attempts: attemptsCount,
          explanation: evalRes.explanation,
        };
        setHistory((prev) => [...prev, item]);
      }
    } catch (err: any) {
      console.error('Answer Evaluation Error:', err);
      setErrorMessage(err.message || 'Error checking answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Allow student to try again on incorrect answer
  const handleTryAgain = () => {
    setEvaluationResult(null);
    setAttemptsCount((prev) => prev + 1);
  };

  // Move to next problem or finish session
  const handleNextProblem = () => {
    if (currentProblemIndex < TOTAL_PROBLEMS) {
      const nextIdx = currentProblemIndex + 1;
      setCurrentProblemIndex(nextIdx);
      const prevTitles = history.map((h) => h.problemTitle);
      fetchSingleProblem(nextIdx, prevTitles);
    } else {
      fetchSummary();
    }
  };

  // Fetch final session summary from backend
  const fetchSummary = async () => {
    setIsLoadingSummary(true);
    setPracticeState('summary');

    try {
      const response = await fetch('/api/ai/practice/summarize-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: currentLesson.title,
          difficulty: currentLesson.difficulty || 'Beginner',
          totalProblems: TOTAL_PROBLEMS,
          score,
          history,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate session summary.');
      }

      setFinalSummary(data.summary);
    } catch (err: any) {
      console.error('Summary Fetch Error:', err);
      setFinalSummary({
        strengths: ['Completed all 5 practice challenges'],
        weaknesses: ['Needs additional practice on core lesson syntax'],
        recommendedReview: `Re-read ${currentLesson.title} theory and practice examples.`,
        summaryNote: 'Great effort completing the practice set!',
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Practice Problems
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-medium text-xs truncate max-w-[220px]">
                  {currentLesson.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {currentLesson.moduleTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* INTRO SCREEN */}
          {practiceState === 'intro' && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-light text-white tracking-tight">
                  Interactive Python Practice
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  PyCoach will generate <span className="text-emerald-300 font-semibold">5 step-by-step practice problems</span> for{' '}
                  <strong className="text-slate-200">{currentLesson.title}</strong>. Solve one problem at a time, receive instant evaluation, and track your progress!
                </p>
                <div className="pt-2 flex justify-center">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono rounded-full">
                    <span>Difficulty:</span>
                    <strong className="text-emerald-400 uppercase">{currentLesson.difficulty || 'Beginner'}</strong>
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleStartPractice}
                  disabled={isLoadingProblem}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center space-x-2 mx-auto disabled:opacity-50"
                >
                  {isLoadingProblem ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Problem 1...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Practice Set</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PROBLEM SCREEN */}
          {practiceState === 'problem' && (
            <div className="space-y-6">
              {/* Header Status Bar: Problem Number, Score, Difficulty */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-medium">
                    Problem <strong className="text-white">{currentProblemIndex}</strong> of {TOTAL_PROBLEMS}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      Score: {score} / {TOTAL_PROBLEMS}
                    </span>
                    <span className="text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                      Difficulty: <strong className="text-indigo-300">{currentProblem?.difficulty || currentLesson.difficulty || 'Beginner'}</strong>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${(currentProblemIndex / TOTAL_PROBLEMS) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {isLoadingProblem ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs font-mono animate-pulse">
                    PyCoach is creating Problem {currentProblemIndex}...
                  </p>
                </div>
              ) : currentProblem ? (
                <div className="space-y-5">
                  {/* Problem Statement Card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-1.5">
                        <Code className="w-3.5 h-3.5" />
                        <span>{currentProblem.problemTitle}</span>
                      </span>
                      {attemptsCount > 1 && (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Attempt #{attemptsCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-200 leading-relaxed">
                      {currentProblem.problemStatement}
                    </p>
                  </div>

                  {/* Code Input Area */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Your Python Code / Answer:</span>
                      <span className="text-slate-500">Edit below and submit</span>
                    </label>
                    <textarea
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      disabled={evaluationResult?.isCorrect || isEvaluating}
                      rows={5}
                      placeholder="# Type your Python solution here..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 transition-colors resize-none disabled:opacity-75"
                    />
                  </div>

                  {/* Evaluation Feedback */}
                  {evaluationResult && (
                    <div
                      className={`p-4 rounded-xl border space-y-2 animate-fadeIn ${
                        evaluationResult.isCorrect
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                          : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 font-mono text-xs font-bold uppercase tracking-wide">
                        {evaluationResult.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Answer Verified Correct! 🎉</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span className="text-rose-400">Needs Adjustment</span>
                          </>
                        )}
                      </div>

                      {/* Correct Feedback */}
                      {evaluationResult.isCorrect && (
                        <div className="space-y-1 text-xs text-slate-300">
                          <p className="font-semibold text-emerald-300">
                            {evaluationResult.congratulations}
                          </p>
                          <p className="leading-relaxed text-slate-300">
                            {evaluationResult.explanation}
                          </p>
                        </div>
                      )}

                      {/* Incorrect Feedback with Mistake & Hint */}
                      {!evaluationResult.isCorrect && (
                        <div className="space-y-2 text-xs text-slate-300">
                          <p className="leading-relaxed text-rose-200">
                            <strong>Feedback:</strong> {evaluationResult.mistake}
                          </p>
                          {evaluationResult.hint && (
                            <div className="bg-amber-950/30 border border-amber-500/30 text-amber-200 p-2.5 rounded-lg flex items-start space-x-2 text-xs mt-1">
                              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-amber-400 font-mono text-[11px] block uppercase">
                                  PyCoach Hint:
                                </strong>
                                <span>{evaluationResult.hint}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                      {errorMessage}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 flex justify-between items-center">
                    {!evaluationResult ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!studentAnswer.trim() || isEvaluating}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-mono font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center space-x-2 ml-auto"
                      >
                        {isEvaluating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying Solution...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Solution</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    ) : evaluationResult.isCorrect ? (
                      <button
                        onClick={handleNextProblem}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs py-2.5 px-6 rounded-xl transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] ml-auto"
                      >
                        <span>
                          {currentProblemIndex < TOTAL_PROBLEMS
                            ? 'Next Problem'
                            : 'View Final Summary'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex justify-end space-x-3 w-full">
                        <button
                          onClick={handleTryAgain}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs py-2.5 px-5 rounded-xl transition-all flex items-center space-x-1.5 shadow-[0_0_12px_rgba(217,119,6,0.3)]"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Try Again with Hint</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* SUMMARY SCREEN */}
          {practiceState === 'summary' && (
            <div className="space-y-6">
              {isLoadingSummary ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs font-mono animate-pulse">
                    PyCoach is evaluating your complete session report...
                  </p>
                </div>
              ) : (
                <>
                  {/* Score Header Card */}
                  <div className="text-center bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                        Session Complete
                      </span>
                      <h3 className="text-3xl font-mono font-bold text-white mt-1">
                        {score} / {TOTAL_PROBLEMS}
                      </h3>
                      <p className="text-xs text-emerald-400 font-mono mt-1">
                        {Math.round((score / TOTAL_PROBLEMS) * 100)}% Practice Completion
                      </p>
                    </div>

                    {finalSummary?.summaryNote && (
                      <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
                        {finalSummary.summaryNote}
                      </p>
                    )}
                  </div>

                  {/* Strengths & Weaknesses Breakdown */}
                  {finalSummary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Key Strengths</span>
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc">
                          {finalSummary.strengths.map((str, idx) => (
                            <li key={idx}>{str}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <HelpCircle className="w-4 h-4 text-amber-400" />
                          <span>Areas for Improvement</span>
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc">
                          {finalSummary.weaknesses.map((wk, idx) => (
                            <li key={idx}>{wk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Recommended Review */}
                  {finalSummary?.recommendedReview && (
                    <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl space-y-1">
                      <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span>Recommended Review Lesson</span>
                      </span>
                      <p className="text-xs text-slate-200">
                        {finalSummary.recommendedReview}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      onClick={handleStartPractice}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs py-2.5 px-4 rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Practice Problems</span>
                    </button>

                    <button
                      onClick={onClose}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                    >
                      Close & Keep Learning
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
