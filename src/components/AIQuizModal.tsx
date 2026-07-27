import React, { useState, useEffect } from 'react';
import { Lesson } from '../types';
import {
  HelpCircle,
  X,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  Loader2,
} from 'lucide-react';

interface QuizOption {
  key: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

interface QuizQuestion {
  questionText: string;
  options: QuizOption[];
  correctOptionKey: string;
  explanation: string;
}

interface QuizHistoryItem {
  questionIndex: number;
  questionText: string;
  options: QuizOption[];
  selectedKey: string;
  correctKey: string;
  isCorrect: boolean;
  explanation: string;
}

interface AIQuizModalProps {
  currentLesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
}

export const AIQuizModal: React.FC<AIQuizModalProps> = ({
  currentLesson,
  isOpen,
  onClose,
}) => {
  const TOTAL_QUESTIONS = 5;

  const [quizState, setQuizState] = useState<'intro' | 'question' | 'summary'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);

  // Reset quiz state whenever lesson changes or modal opens
  useEffect(() => {
    if (isOpen) {
      resetQuiz();
    }
  }, [isOpen, currentLesson.id]);

  const resetQuiz = () => {
    setQuizState('intro');
    setCurrentQuestionIndex(1);
    setCurrentQuestion(null);
    setSelectedOptionKey(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizHistory([]);
    setErrorMessage(null);
  };

  // Fetch single question from backend Gemini API
  const fetchQuestion = async (qIndex: number, previousQs: string[]) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedOptionKey(null);
    setIsAnswerSubmitted(false);

    try {
      const response = await fetch('/api/ai/quiz/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: currentLesson.title,
          moduleTitle: currentLesson.moduleTitle,
          theoryMarkdown: currentLesson.theoryMarkdown,
          questionIndex: qIndex,
          totalQuestions: TOTAL_QUESTIONS,
          previousQuestions: previousQs,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quiz question.');
      }

      setCurrentQuestion(data.question);
      setQuizState('question');
    } catch (err: any) {
      console.error('Quiz Fetch Error:', err);
      setErrorMessage(err.message || 'Error generating question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    resetQuiz();
    fetchQuestion(1, []);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionKey || !currentQuestion || isAnswerSubmitted) return;

    const isCorrect = selectedOptionKey === currentQuestion.correctOptionKey;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setIsAnswerSubmitted(true);

    // Record in history
    const historyItem: QuizHistoryItem = {
      questionIndex: currentQuestionIndex,
      questionText: currentQuestion.questionText,
      options: currentQuestion.options,
      selectedKey: selectedOptionKey,
      correctKey: currentQuestion.correctOptionKey,
      isCorrect,
      explanation: currentQuestion.explanation,
    };

    setQuizHistory((prev) => [...prev, historyItem]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < TOTAL_QUESTIONS) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      const prevQTexts = quizHistory.map((h) => h.questionText);
      fetchQuestion(nextIdx, prevQTexts);
    } else {
      setQuizState('summary');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  AI Quiz
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
          {quizState === 'intro' && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-light text-white tracking-tight">
                  Test Your Python Knowledge
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  PyCoach will generate <span className="text-indigo-300 font-semibold">5 unique adaptive questions</span> created exclusively for{' '}
                  <strong className="text-slate-200">{currentLesson.title}</strong>. Answer one question at a time to get instant feedback and explanations!
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleStartQuiz}
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center space-x-2 mx-auto disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Question 1...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Quiz Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* QUESTION SCREEN */}
          {quizState === 'question' && (
            <div className="space-y-6">
              {/* Progress & Score Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-medium">
                    Question <strong className="text-white">{currentQuestionIndex}</strong> of {TOTAL_QUESTIONS}
                  </span>
                  <span className="text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                    Score: {score} / {TOTAL_QUESTIONS}
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{
                      width: `${(currentQuestionIndex / TOTAL_QUESTIONS) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-xs font-mono animate-pulse">
                    PyCoach is crafting Question {currentQuestionIndex}...
                  </p>
                </div>
              ) : currentQuestion ? (
                <div className="space-y-5">
                  {/* Question Text */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-sm font-medium text-slate-100 leading-relaxed">
                      {currentQuestion.questionText}
                    </h4>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = selectedOptionKey === opt.key;
                      const isCorrectKey = currentQuestion.correctOptionKey === opt.key;

                      let cardStyle =
                        'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300';

                      if (isAnswerSubmitted) {
                        if (isCorrectKey) {
                          cardStyle = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300';
                        } else if (isSelected && !isCorrectKey) {
                          cardStyle = 'bg-rose-500/10 border-rose-500/50 text-rose-300';
                        } else {
                          cardStyle = 'bg-slate-950/40 border-slate-900 opacity-50 text-slate-500';
                        }
                      } else if (isSelected) {
                        cardStyle =
                          'bg-indigo-500/10 border-indigo-500/60 text-white shadow-[0_0_10px_rgba(79,70,229,0.2)]';
                      }

                      return (
                        <button
                          key={opt.key}
                          onClick={() => !isAnswerSubmitted && setSelectedOptionKey(opt.key)}
                          disabled={isAnswerSubmitted}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs font-sans flex items-center space-x-3 transition-all ${cardStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="flex-1 leading-snug">{opt.text}</span>

                          {isAnswerSubmitted && isCorrectKey && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {isAnswerSubmitted && isSelected && !isCorrectKey && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Answer Result Feedback & Explanation */}
                  {isAnswerSubmitted && (
                    <div
                      className={`p-4 rounded-xl border space-y-2 animate-fadeIn ${
                        selectedOptionKey === currentQuestion.correctOptionKey
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                          : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 font-mono text-xs font-bold uppercase tracking-wide">
                        {selectedOptionKey === currentQuestion.correctOptionKey ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Correct Answer! 🎉</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span className="text-rose-400">
                              Incorrect (Correct Option: {currentQuestion.correctOptionKey})
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pt-1">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="pt-2 flex justify-end">
                    {!isAnswerSubmitted ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOptionKey}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-mono font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-2.5 px-6 rounded-xl transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                      >
                        <span>
                          {currentQuestionIndex < TOTAL_QUESTIONS
                            ? 'Next Question'
                            : 'View Final Summary'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* SUMMARY SCREEN */}
          {quizState === 'summary' && (
            <div className="space-y-6">
              {/* Score Header Card */}
              <div className="text-center bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    Quiz Complete
                  </span>
                  <h3 className="text-3xl font-mono font-bold text-white mt-1">
                    {score} / {TOTAL_QUESTIONS}
                  </h3>
                  <p className="text-xs text-indigo-400 font-mono mt-1">
                    {Math.round((score / TOTAL_QUESTIONS) * 100)}% Accuracy
                  </p>
                </div>

                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  {score === 5
                    ? '🏆 Perfect Score! You have completely mastered this lesson!'
                    : score >= 3
                    ? '🌟 Great Job! You have a solid understanding of this topic.'
                    : '📚 Good Effort! We recommend re-reading the theory notes and retaking the quiz.'}
                </p>
              </div>

              {/* Review History breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Question Review</span>
                </h4>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {quizHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-400 font-semibold">Q{item.questionIndex}:</span>
                        {item.isCorrect ? (
                          <span className="text-emerald-400 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct ({item.selectedKey})</span>
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center space-x-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>
                              Incorrect ({item.selectedKey} vs {item.correctKey})
                            </span>
                          </span>
                        )}
                      </div>

                      <p className="text-slate-200 font-medium">{item.questionText}</p>
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleStartQuiz}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs py-2.5 px-4 rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
                >
                  Close & Continue Learning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
