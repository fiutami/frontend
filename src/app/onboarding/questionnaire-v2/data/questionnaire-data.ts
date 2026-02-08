/**
 * Combined Questionnaire Data for v1.1
 *
 * Aggregates all questions, modules, and leaves into single maps
 * that can be loaded into the FlowEngineService.
 *
 * @version 1.1
 */

import { QuestionsMap, ModulesMap, LeavesMap } from '../models/question.models';

import { CORE_QUESTIONS_MAP, CORE_QUESTIONS_ORDER } from './core-questions';
import { COMPANION_QUESTIONS_MAP, COMPANION_QUESTIONS_ORDER, COMPANION_MODULE } from './companion-module';
import { SPECIES_QUESTIONS_MAP, SPECIES_MODULES_MAP } from './species-modules';
import { LEAVES_MAP } from './leaves';

// ============================================================================
// Combined Questions Map (all questions)
// ============================================================================

export const ALL_QUESTIONS_MAP: QuestionsMap = {
  ...CORE_QUESTIONS_MAP,
  ...COMPANION_QUESTIONS_MAP,
  ...SPECIES_QUESTIONS_MAP
};

// ============================================================================
// Combined Modules Map (all modules)
// ============================================================================

export const ALL_MODULES_MAP: ModulesMap = {
  COMPANION: COMPANION_MODULE,
  ...SPECIES_MODULES_MAP
};

// ============================================================================
// Combined Leaves Map (all leaves)
// ============================================================================

export const ALL_LEAVES_MAP: LeavesMap = LEAVES_MAP;

// ============================================================================
// Question Order (for navigation fallback)
// ============================================================================

export const ALL_QUESTIONS_ORDER: string[] = [
  ...CORE_QUESTIONS_ORDER,
  ...COMPANION_QUESTIONS_ORDER,
  // Species modules are entered via module: prefix, not linear order
];

// ============================================================================
// Stats
// ============================================================================

export const QUESTIONNAIRE_STATS = {
  totalQuestions: Object.keys(ALL_QUESTIONS_MAP).length,
  totalModules: Object.keys(ALL_MODULES_MAP).length,
  totalLeaves: Object.keys(ALL_LEAVES_MAP).length,
  coreQuestions: CORE_QUESTIONS_ORDER.length,
  companionQuestions: COMPANION_QUESTIONS_ORDER.length,
  version: '1.1'
};

// ============================================================================
// Initialization Helper
// ============================================================================

/**
 * Load all questionnaire data into the flow engine.
 * Call this during app initialization.
 */
export function getQuestionnaireData() {
  return {
    questions: ALL_QUESTIONS_MAP,
    modules: ALL_MODULES_MAP,
    leaves: ALL_LEAVES_MAP,
    order: ALL_QUESTIONS_ORDER
  };
}
