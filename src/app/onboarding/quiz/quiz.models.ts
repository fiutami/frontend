/**
 * Quiz models for onboarding questionnaire
 */

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizPhase {
  id: number;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizAnswers {
  phase1: {
    q1: string | null;
    q2: string | null;
    q3: string | null;
  };
  phase2: {
    q1: string | null;
    q2: string | null;
    q3: string | null;
  };
  phase3: {
    q1: string | null;
    q2: string | null;
    q3: string | null;
  };
}

export interface QuizState {
  currentPhase: 1 | 2 | 3;
  currentQuestion: 0 | 1 | 2;
  answers: QuizAnswers;
}

export const EMPTY_QUIZ_STATE: QuizState = {
  currentPhase: 1,
  currentQuestion: 0,
  answers: {
    phase1: { q1: null, q2: null, q3: null },
    phase2: { q1: null, q2: null, q3: null },
    phase3: { q1: null, q2: null, q3: null },
  },
};
