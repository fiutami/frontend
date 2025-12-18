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
    q1: string | null; // Quanto sei attivo?
    q2: string | null; // Dove vivi?
    q3: string | null; // Hai altri animali?
  };
  phase2: {
    q1: string | null; // Tipo abitazione?
    q2: string | null; // Metri quadri?
    q3: string | null; // Hai spazio esterno?
  };
  phase3: {
    q1: string | null; // Ore al giorno disponibili?
    q2: string | null; // Viaggi spesso?
    q3: string | null; // Esperienza con animali?
  };
}

export interface QuizState {
  currentPhase: 1 | 2 | 3;
  currentQuestion: 0 | 1 | 2;
  answers: QuizAnswers;
}

/**
 * Default empty quiz state
 */
export const EMPTY_QUIZ_STATE: QuizState = {
  currentPhase: 1,
  currentQuestion: 0,
  answers: {
    phase1: { q1: null, q2: null, q3: null },
    phase2: { q1: null, q2: null, q3: null },
    phase3: { q1: null, q2: null, q3: null },
  },
};

/**
 * Quiz phases configuration
 */
export const QUIZ_PHASES: QuizPhase[] = [
  {
    id: 1,
    title: 'Stile di vita',
    questions: [
      {
        id: 'activity',
        text: 'Quanto sei attivo?',
        options: [
          { value: 'sedentary', label: 'Sedentario' },
          { value: 'moderate', label: 'Moderato' },
          { value: 'active', label: 'Molto attivo' },
        ],
      },
      {
        id: 'location',
        text: 'Dove vivi?',
        options: [
          { value: 'city', label: 'Citta' },
          { value: 'suburbs', label: 'Periferia' },
          { value: 'countryside', label: 'Campagna' },
        ],
      },
      {
        id: 'other_pets',
        text: 'Hai altri animali?',
        options: [
          { value: 'yes', label: 'Si' },
          { value: 'no', label: 'No' },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Spazio',
    questions: [
      {
        id: 'housing',
        text: 'Tipo abitazione?',
        options: [
          { value: 'apartment', label: 'Appartamento' },
          { value: 'house', label: 'Casa' },
          { value: 'house_garden', label: 'Casa con giardino' },
        ],
      },
      {
        id: 'size',
        text: 'Metri quadri?',
        options: [
          { value: 'small', label: '<50mq' },
          { value: 'medium', label: '50-100mq' },
          { value: 'large', label: '>100mq' },
        ],
      },
      {
        id: 'outdoor',
        text: 'Hai spazio esterno?',
        options: [
          { value: 'yes', label: 'Si' },
          { value: 'no', label: 'No' },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Tempo',
    questions: [
      {
        id: 'hours',
        text: 'Ore al giorno disponibili?',
        options: [
          { value: 'few', label: '<1h' },
          { value: 'some', label: '1-3h' },
          { value: 'many', label: '>3h' },
        ],
      },
      {
        id: 'travel',
        text: 'Viaggi spesso?',
        options: [
          { value: 'yes', label: 'Si' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'experience',
        text: 'Esperienza con animali?',
        options: [
          { value: 'none', label: 'Nessuna' },
          { value: 'little', label: 'Poca' },
          { value: 'much', label: 'Molta' },
        ],
      },
    ],
  },
];
