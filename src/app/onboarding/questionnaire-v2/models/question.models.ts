/**
 * Question Models for Questionnaire v1.1 Flow Engine
 *
 * Key features:
 * - textKey for i18n (never hardcoded text)
 * - nextOnSkip for skip logic when showIf=false
 * - SetAction with typed operations (set, inc, push, toggle, merge)
 *
 * @version 1.1
 */

/**
 * Operation types for SetAction
 * - set: Replace value entirely
 * - inc: Increment numeric value
 * - push: Append to array
 * - toggle: Flip boolean
 * - merge: Deep merge object
 */
export type SetActionOp = 'set' | 'inc' | 'push' | 'toggle' | 'merge';

/**
 * Value types for SetAction validation
 */
export type SetActionValueType = 'string' | 'number' | 'boolean' | 'enum' | 'array' | 'object';

/**
 * Action to apply when an option is selected.
 * Modifies the UserPreferenceProfile.
 */
export interface SetAction {
  /** Path to profile field, e.g. "LifestyleProfile.dailyTime" */
  path: string;
  /** Operation to perform */
  op: SetActionOp;
  /** Value to apply */
  value: unknown;
  /** Type hint for validation */
  valueType: SetActionValueType;
}

/**
 * Visualization types for questions
 */
export type QuestionVisualization = 'radio' | 'squares' | 'cards' | 'slider' | 'multi-select';

/**
 * Single option within a question
 */
export interface QuestionOption {
  /** Unique ID within the question */
  id: string;
  /** i18n key for label, e.g. "questionnaire.q01.options.a" */
  labelKey: string;
  /** Optional i18n key for description */
  descriptionKey?: string;
  /** Optional icon identifier */
  icon?: string;
  /** Actions to apply when selected */
  set: SetAction[];
  /**
   * Where to navigate after selection.
   * Can be:
   * - Question ID: "Q02_COUNTRY"
   * - Module entry: "module:COMPANION"
   * - Leaf: "leaf:FINAL_RECOMMENDATION"
   */
  next: string;
}

/**
 * A question in the questionnaire flow
 */
export interface Question {
  /** Unique question ID, e.g. "Q00_ENTRY" */
  id: string;
  /** i18n key for question text */
  textKey: string;
  /** Optional i18n key for hint/help text */
  hintKey?: string;
  /** Available options */
  options: QuestionOption[];
  /**
   * Expression to evaluate for conditional display.
   * Uses safe expression syntax, e.g.:
   * "LifestyleProfile.dailyTime == 'high' and FinanceProfile.budget >= 50"
   */
  showIf?: string;
  /**
   * CRITICAL: Where to navigate if showIf evaluates to false.
   * If not specified, uses findNextQuestionId() fallback.
   * This is NOT the same as options[0].next!
   */
  nextOnSkip?: string;
  /** How to render options */
  visualization?: QuestionVisualization;
  /** Module this question belongs to (for progress tracking) */
  moduleId?: string;
}

/**
 * A module is a group of related questions
 */
export interface QuestionModule {
  /** Module ID, e.g. "COMPANION", "DOG", "CAT" */
  id: string;
  /** i18n key for module title */
  titleKey: string;
  /** First question ID in the module */
  entryQuestionId: string;
  /** Question IDs in this module (for progress calculation) */
  questionIds: string[];
}

/**
 * A leaf is a terminal node (end of flow)
 */
export interface Leaf {
  /** Leaf ID, e.g. "FINAL_RECOMMENDATION" */
  id: string;
  /** Type of leaf */
  type: 'recommendation' | 'redirect' | 'end';
  /** Route to navigate to (for redirect type) */
  route?: string;
  /** Component to render (for recommendation type) */
  component?: string;
}

/**
 * Questions lookup dictionary for O(1) access
 */
export type QuestionsMap = Record<string, Question>;

/**
 * Modules lookup dictionary
 */
export type ModulesMap = Record<string, QuestionModule>;

/**
 * Leaves lookup dictionary
 */
export type LeavesMap = Record<string, Leaf>;
