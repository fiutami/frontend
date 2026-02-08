/**
 * Questionnaire v1.1 - Public API
 *
 * Export all models and services for the new questionnaire flow engine.
 *
 * @version 1.1
 */

// Models
export * from './models/question.models';
export * from './models/profile.models';
export * from './models/flow.models';

// Engine Services
export * from './engine/expression-parser.service';
export * from './engine/profile-manager.service';
export * from './engine/flow-engine.service';
export * from './engine/embedding.service';
export * from './engine/matching-engine.service';
export * from './engine/fiuto-ai.service';

// Data
export * from './data/questionnaire-data';
export { CORE_QUESTIONS, CORE_QUESTIONS_MAP } from './data/core-questions';
export { COMPANION_QUESTIONS, COMPANION_MODULE } from './data/companion-module';
export { SPECIES_MODULES, SPECIES_QUESTIONS } from './data/species-modules';
export { LEAVES, LEAVES_MAP } from './data/leaves';

// Components
export * from './components';

// Pages
export * from './pages';
