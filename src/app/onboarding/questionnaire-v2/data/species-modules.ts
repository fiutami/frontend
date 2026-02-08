/**
 * Species-Specific Module Placeholders for Questionnaire v1.1
 *
 * These modules will contain species-specific questions (D01-D15 for dogs, etc.)
 * For now, they route directly to recommendations to allow testing the core flow.
 *
 * TODO: Implement full question sets for each species
 *
 * @version 1.1
 */

import { Question, QuestionModule, QuestionsMap, ModulesMap } from '../models/question.models';

// ============================================================================
// DOG Module (Placeholder)
// ============================================================================

export const DOG_MODULE: QuestionModule = {
  id: 'DOG',
  titleKey: 'questionnaire.modules.dog.title',
  entryQuestionId: 'D01_COAT',
  questionIds: ['D01_COAT', 'D02_PURPOSE']
};

const DOG_QUESTIONS: Question[] = [
  {
    id: 'D01_COAT',
    textKey: 'questionnaire.d01.text',
    hintKey: 'questionnaire.d01.hint',
    moduleId: 'DOG',
    visualization: 'cards',
    options: [
      {
        id: 'short',
        labelKey: 'questionnaire.d01.options.short',
        set: [
          { path: 'SpeciesPreferences.coatPreference', op: 'set', value: 'short', valueType: 'enum' }
        ],
        next: 'D02_PURPOSE'
      },
      {
        id: 'medium',
        labelKey: 'questionnaire.d01.options.medium',
        set: [
          { path: 'SpeciesPreferences.coatPreference', op: 'set', value: 'medium', valueType: 'enum' }
        ],
        next: 'D02_PURPOSE'
      },
      {
        id: 'long',
        labelKey: 'questionnaire.d01.options.long',
        set: [
          { path: 'SpeciesPreferences.coatPreference', op: 'set', value: 'long', valueType: 'enum' }
        ],
        next: 'D02_PURPOSE'
      },
      {
        id: 'no_preference',
        labelKey: 'questionnaire.d01.options.no_preference',
        set: [
          { path: 'SpeciesPreferences.coatPreference', op: 'set', value: 'no_preference', valueType: 'enum' }
        ],
        next: 'D02_PURPOSE'
      }
    ]
  },
  {
    id: 'D02_PURPOSE',
    textKey: 'questionnaire.d02.text',
    moduleId: 'DOG',
    visualization: 'cards',
    options: [
      {
        id: 'companion',
        labelKey: 'questionnaire.d02.options.companion',
        set: [
          { path: 'Route.completedModules', op: 'push', value: 'DOG', valueType: 'array' }
        ],
        next: 'leaf:DOG_RECOMMENDATION'
      },
      {
        id: 'active',
        labelKey: 'questionnaire.d02.options.active',
        set: [
          { path: 'Route.completedModules', op: 'push', value: 'DOG', valueType: 'array' }
        ],
        next: 'leaf:DOG_RECOMMENDATION'
      },
      {
        id: 'guard',
        labelKey: 'questionnaire.d02.options.guard',
        set: [
          { path: 'Route.completedModules', op: 'push', value: 'DOG', valueType: 'array' }
        ],
        next: 'leaf:DOG_RECOMMENDATION'
      },
      {
        id: 'family',
        labelKey: 'questionnaire.d02.options.family',
        set: [
          { path: 'Route.completedModules', op: 'push', value: 'DOG', valueType: 'array' }
        ],
        next: 'leaf:DOG_RECOMMENDATION'
      }
    ]
  }
];

// ============================================================================
// CAT Module (Placeholder)
// ============================================================================

export const CAT_MODULE: QuestionModule = {
  id: 'CAT',
  titleKey: 'questionnaire.modules.cat.title',
  entryQuestionId: 'K01_INDOOR',
  questionIds: ['K01_INDOOR']
};

const CAT_QUESTIONS: Question[] = [
  {
    id: 'K01_INDOOR',
    textKey: 'questionnaire.k01.text',
    moduleId: 'CAT',
    visualization: 'cards',
    options: [
      {
        id: 'indoor_only',
        labelKey: 'questionnaire.k01.options.indoor_only',
        set: [
          { path: 'SpeciesPreferences.indoorOutdoor', op: 'set', value: 'indoor_only', valueType: 'enum' },
          { path: 'Route.completedModules', op: 'push', value: 'CAT', valueType: 'array' }
        ],
        next: 'leaf:CAT_RECOMMENDATION'
      },
      {
        id: 'outdoor_access',
        labelKey: 'questionnaire.k01.options.outdoor_access',
        set: [
          { path: 'SpeciesPreferences.indoorOutdoor', op: 'set', value: 'outdoor_access', valueType: 'enum' },
          { path: 'Route.completedModules', op: 'push', value: 'CAT', valueType: 'array' }
        ],
        next: 'leaf:CAT_RECOMMENDATION'
      },
      {
        id: 'no_preference',
        labelKey: 'questionnaire.k01.options.no_preference',
        set: [
          { path: 'SpeciesPreferences.indoorOutdoor', op: 'set', value: 'no_preference', valueType: 'enum' },
          { path: 'Route.completedModules', op: 'push', value: 'CAT', valueType: 'array' }
        ],
        next: 'leaf:CAT_RECOMMENDATION'
      }
    ]
  }
];

// ============================================================================
// SMALL_MAMMAL Module (Placeholder)
// ============================================================================

export const SMALL_MAMMAL_MODULE: QuestionModule = {
  id: 'SMALL_MAMMAL',
  titleKey: 'questionnaire.modules.small_mammal.title',
  entryQuestionId: 'S01_TYPE',
  questionIds: ['S01_TYPE']
};

const SMALL_MAMMAL_QUESTIONS: Question[] = [
  {
    id: 'S01_TYPE',
    textKey: 'questionnaire.s01.text',
    moduleId: 'SMALL_MAMMAL',
    visualization: 'cards',
    options: [
      {
        id: 'rabbit',
        labelKey: 'questionnaire.s01.options.rabbit',
        icon: '🐰',
        set: [
          { path: 'SpeciesPreferences.smallMammalType', op: 'set', value: 'rabbit', valueType: 'string' },
          { path: 'Route.completedModules', op: 'push', value: 'SMALL_MAMMAL', valueType: 'array' }
        ],
        next: 'leaf:SMALL_MAMMAL_RECOMMENDATION'
      },
      {
        id: 'hamster',
        labelKey: 'questionnaire.s01.options.hamster',
        icon: '🐹',
        set: [
          { path: 'SpeciesPreferences.smallMammalType', op: 'set', value: 'hamster', valueType: 'string' },
          { path: 'Route.completedModules', op: 'push', value: 'SMALL_MAMMAL', valueType: 'array' }
        ],
        next: 'leaf:SMALL_MAMMAL_RECOMMENDATION'
      },
      {
        id: 'guinea_pig',
        labelKey: 'questionnaire.s01.options.guinea_pig',
        icon: '🐹',
        set: [
          { path: 'SpeciesPreferences.smallMammalType', op: 'set', value: 'guinea_pig', valueType: 'string' },
          { path: 'Route.completedModules', op: 'push', value: 'SMALL_MAMMAL', valueType: 'array' }
        ],
        next: 'leaf:SMALL_MAMMAL_RECOMMENDATION'
      },
      {
        id: 'unsure',
        labelKey: 'questionnaire.s01.options.unsure',
        set: [
          { path: 'Route.completedModules', op: 'push', value: 'SMALL_MAMMAL', valueType: 'array' }
        ],
        next: 'leaf:SMALL_MAMMAL_RECOMMENDATION'
      }
    ]
  }
];

// ============================================================================
// BIRD Module (Placeholder)
// ============================================================================

export const BIRD_MODULE: QuestionModule = {
  id: 'BIRD',
  titleKey: 'questionnaire.modules.bird.title',
  entryQuestionId: 'B01_SIZE',
  questionIds: ['B01_SIZE']
};

const BIRD_QUESTIONS: Question[] = [
  {
    id: 'B01_SIZE',
    textKey: 'questionnaire.b01.text',
    moduleId: 'BIRD',
    visualization: 'cards',
    options: [
      {
        id: 'small',
        labelKey: 'questionnaire.b01.options.small',
        descriptionKey: 'questionnaire.b01.options.small_desc',
        set: [
          { path: 'SpeciesPreferences.sizePreference', op: 'set', value: 'small', valueType: 'enum' },
          { path: 'Route.completedModules', op: 'push', value: 'BIRD', valueType: 'array' }
        ],
        next: 'leaf:BIRD_RECOMMENDATION'
      },
      {
        id: 'medium',
        labelKey: 'questionnaire.b01.options.medium',
        descriptionKey: 'questionnaire.b01.options.medium_desc',
        set: [
          { path: 'SpeciesPreferences.sizePreference', op: 'set', value: 'medium', valueType: 'enum' },
          { path: 'Route.completedModules', op: 'push', value: 'BIRD', valueType: 'array' }
        ],
        next: 'leaf:BIRD_RECOMMENDATION'
      },
      {
        id: 'large',
        labelKey: 'questionnaire.b01.options.large',
        descriptionKey: 'questionnaire.b01.options.large_desc',
        set: [
          { path: 'SpeciesPreferences.sizePreference', op: 'set', value: 'large', valueType: 'enum' },
          { path: 'Route.completedModules', op: 'push', value: 'BIRD', valueType: 'array' }
        ],
        next: 'leaf:BIRD_RECOMMENDATION'
      }
    ]
  }
];

// ============================================================================
// Combined Exports
// ============================================================================

export const SPECIES_MODULES: QuestionModule[] = [
  DOG_MODULE,
  CAT_MODULE,
  SMALL_MAMMAL_MODULE,
  BIRD_MODULE
];

export const SPECIES_QUESTIONS: Question[] = [
  ...DOG_QUESTIONS,
  ...CAT_QUESTIONS,
  ...SMALL_MAMMAL_QUESTIONS,
  ...BIRD_QUESTIONS
];

export const SPECIES_MODULES_MAP: ModulesMap = SPECIES_MODULES.reduce(
  (acc, mod) => {
    acc[mod.id] = mod;
    return acc;
  },
  {} as ModulesMap
);

export const SPECIES_QUESTIONS_MAP: QuestionsMap = SPECIES_QUESTIONS.reduce(
  (acc, q) => {
    acc[q.id] = q;
    return acc;
  },
  {} as QuestionsMap
);
