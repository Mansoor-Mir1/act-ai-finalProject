export interface Exercise {
  id: string;
  title: string;
  instructions: string;
  initialCode: string;
  solutionCode?: string;
  expectedOutput?: string;
  testCases?: {
    input?: string;
    expected: string;
    description: string;
  }[];
  hints: string[];
}

export interface GlobalResource {
  id: string;
  title: string;
  description: string;
  topic: string;
  url: string;
  createdAt: string;
}

export interface LessonResource {
  id: string;
  lessonId: string;
  title: string;
  url: string;
  type: 'Documentation' | 'Tutorial' | 'Video' | 'GitHub' | 'Other';
  createdAt?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  theoryMarkdown: string;
  exercise: Exercise;
  order?: number;
  published?: boolean;
  resources?: LessonResource[];
}

export interface LessonModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  codeSnippet?: string;
}

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTimeMs?: number;
  isSuccess: boolean;
  variables?: Record<string, string>;
}

export interface UserProgress {
  completedLessonIds: string[];
  bookmarkedLessonIds?: string[];
  currentLessonId: string;
  streakDays: number;
  points: number;
  savedCode: Record<string, string>;
}

export type ProgressStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface LessonProgressDoc {
  lessonId: string;
  userId: string;
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  completedQuestions: number;
  quizStatus: ProgressStatus;
  practiceStatus: ProgressStatus;
  startedAt: string;
  updatedAt: string;
  completedAt?: string | null;
  accuracy: number;
  isCompleted: boolean;

  // Practice state for resume
  practiceHistory?: any[];
  practiceCurrentProblem?: any;
  practiceStudentAnswer?: string;
  practiceAttemptsCount?: number;

  // Quiz state for resume
  quizHistory?: any[];
  quizCurrentQuestionObj?: any;
}

