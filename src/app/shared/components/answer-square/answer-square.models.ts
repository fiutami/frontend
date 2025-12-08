/**
 * Answer option for questionnaire squares
 */
export interface AnswerOption {
  /** Unique value for the option (e.g., 'poco', 'medio', 'molto') */
  value: string;

  /** Display label for the option (e.g., 'Poco', 'Medio', 'Molto') */
  label: string;

  /** Optional icon or emoji to display */
  icon?: string;

  /** Optional description text */
  description?: string;
}
