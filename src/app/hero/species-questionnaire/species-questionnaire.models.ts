/**
 * Questionnaire answers for species profiling
 */
export interface QuestionnaireAnswers {
  /** Q1: Quanto tempo puoi dedicargli ogni giorno? ('poco' | 'medio' | 'molto') */
  q1_time: string | null;

  /** Q2: Quanto tempo passi fuori casa? ('meno_2h' | '2_6h' | 'piu_6h') */
  q2_presence: string | null;

  /** Q3: Che spazio hai a disposizione? ('interno' | 'balcone' | 'giardino') */
  q3_space: string | null;

  /** Q4: Ci sono allergie in casa? ('si' | 'no') */
  q4_allergies: string | null;

  /** Q5: Cosa desideri dal tuo animale? ('compagnia' | 'tranquillita' | 'attivita' | 'indipendente') */
  q5_desire: string | null;

  /** Q6: Quanta cura puoi dedicargli? ('bassa' | 'media' | 'alta') */
  q6_care: string | null;
}

/**
 * Question keys for type safety
 */
export type QuestionKey = keyof QuestionnaireAnswers;

/**
 * Default empty questionnaire state
 */
export const EMPTY_QUESTIONNAIRE: QuestionnaireAnswers = {
  q1_time: null,
  q2_presence: null,
  q3_space: null,
  q4_allergies: null,
  q5_desire: null,
  q6_care: null,
};

/**
 * Storage key for session persistence
 */
export const QUESTIONNAIRE_STORAGE_KEY = 'speciesQuestionnaire';
