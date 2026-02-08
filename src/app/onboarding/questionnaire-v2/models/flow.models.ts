/**
 * Flow State Models for Questionnaire v1.1
 *
 * Manages navigation state, history, and answer tracking.
 *
 * Key features:
 * - Record<> for JSON serialization (NOT Map)
 * - History for back navigation
 * - Selected option tracking for recomputation
 *
 * @version 1.1
 */

import { Question, QuestionOption } from './question.models';

/**
 * A recorded answer (selected option)
 */
export interface SelectedOption {
  /** Option ID that was selected */
  optionId: string;
  /** Full option data (for recomputation) */
  option: QuestionOption;
  /** When the answer was given */
  timestamp: number;
  /** Time spent on this question (ms) */
  timeSpentMs: number;
}

/**
 * Entry in navigation history
 */
export interface HistoryEntry {
  /** Question that was answered */
  questionId: string;
  /** Option that was selected */
  selectedOptionId: string;
  /** When this was recorded */
  timestamp: number;
}

/**
 * Current flow state (serializable)
 *
 * IMPORTANT: Uses Record<> instead of Map for JSON serialization.
 * Use helper functions to convert to Map if needed for runtime operations.
 */
export interface FlowState {
  /** Currently displayed question/node ID */
  currentNodeId: string;

  /**
   * Answers indexed by question ID.
   * Use Record for serialization - NOT Map!
   */
  answersByQuestionId: Record<string, SelectedOption>;

  /**
   * Navigation history for back button.
   * Ordered: oldest first, newest last.
   */
  history: HistoryEntry[];

  /** Current module being navigated (if any) */
  currentModuleId?: string;

  /** When navigation started */
  startedAt: number;

  /** Last navigation timestamp */
  lastUpdatedAt: number;
}

/**
 * Navigation direction
 */
export type NavigationDirection = 'forward' | 'back' | 'skip' | 'jump';

/**
 * Navigation event (for analytics)
 */
export interface NavigationEvent {
  direction: NavigationDirection;
  fromNodeId: string;
  toNodeId: string;
  timestamp: number;
  /** Reason for skip (if applicable) */
  skipReason?: 'showIf_false' | 'user_skip' | 'module_exit';
}

/**
 * Destination types for navigation
 */
export type DestinationType = 'question' | 'module' | 'leaf' | 'unknown';

/**
 * Parsed destination from next string
 */
export interface ParsedDestination {
  type: DestinationType;
  id: string;
  raw: string;
}

/**
 * Parse a destination string (e.g., "module:DOG", "leaf:FINAL", "Q05")
 */
export function parseDestination(destination: string): ParsedDestination {
  if (destination.startsWith('module:')) {
    return {
      type: 'module',
      id: destination.substring(7),
      raw: destination
    };
  }

  if (destination.startsWith('leaf:')) {
    return {
      type: 'leaf',
      id: destination.substring(5),
      raw: destination
    };
  }

  // Assume question ID
  if (destination.match(/^[A-Z]\d{2}/)) {
    return {
      type: 'question',
      id: destination,
      raw: destination
    };
  }

  return {
    type: 'unknown',
    id: destination,
    raw: destination
  };
}

/**
 * Create initial flow state
 */
export function createInitialFlowState(entryNodeId: string = 'Q00_ENTRY'): FlowState {
  const now = Date.now();
  return {
    currentNodeId: entryNodeId,
    answersByQuestionId: {},
    history: [],
    startedAt: now,
    lastUpdatedAt: now
  };
}

/**
 * Serialize flow state to JSON string
 */
export function serializeFlowState(state: FlowState): string {
  return JSON.stringify(state);
}

/**
 * Deserialize flow state from JSON string
 */
export function deserializeFlowState(json: string): FlowState | null {
  try {
    const parsed = JSON.parse(json);
    // Validate required fields
    if (!parsed.currentNodeId || !parsed.answersByQuestionId || !parsed.history) {
      return null;
    }
    return parsed as FlowState;
  } catch {
    return null;
  }
}

// ============================================================================
// Helper Functions for Record <-> Map conversion
// ============================================================================

/**
 * Convert answers Record to Map (for runtime operations)
 */
export function answersToMap(
  answers: Record<string, SelectedOption>
): Map<string, SelectedOption> {
  return new Map(Object.entries(answers));
}

/**
 * Convert answers Map to Record (for serialization)
 */
export function answersToRecord(
  map: Map<string, SelectedOption>
): Record<string, SelectedOption> {
  return Object.fromEntries(map);
}

/**
 * Check if an answer exists for a question
 */
export function hasAnswer(
  answers: Record<string, SelectedOption>,
  questionId: string
): boolean {
  return questionId in answers;
}

/**
 * Get answer for a question (or undefined)
 */
export function getAnswer(
  answers: Record<string, SelectedOption>,
  questionId: string
): SelectedOption | undefined {
  return answers[questionId];
}

/**
 * Set answer for a question (immutably)
 */
export function setAnswer(
  answers: Record<string, SelectedOption>,
  questionId: string,
  answer: SelectedOption
): Record<string, SelectedOption> {
  return { ...answers, [questionId]: answer };
}

/**
 * Delete answer for a question (immutably)
 * Uses spread + delete pattern for Record (NOT .delete() which is Map)
 */
export function deleteAnswer(
  answers: Record<string, SelectedOption>,
  questionId: string
): Record<string, SelectedOption> {
  const { [questionId]: _, ...rest } = answers;
  return rest;
}

/**
 * Get all answered question IDs
 */
export function getAnsweredQuestionIds(
  answers: Record<string, SelectedOption>
): string[] {
  return Object.keys(answers);
}

/**
 * Count total answers
 */
export function countAnswers(
  answers: Record<string, SelectedOption>
): number {
  return Object.keys(answers).length;
}
