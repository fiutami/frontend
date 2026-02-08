/**
 * Companion Module (C01-C05) for Questionnaire v1.1
 *
 * Common questions for companion animals (dogs, cats, small mammals, birds).
 * These questions refine preferences before routing to species-specific modules.
 *
 * @version 1.1
 */

import { Question, QuestionModule, QuestionsMap } from '../models/question.models';

// ============================================================================
// Module Definition
// ============================================================================

export const COMPANION_MODULE: QuestionModule = {
  id: 'COMPANION',
  titleKey: 'questionnaire.modules.companion.title',
  entryQuestionId: 'C01_SIZE_PREFERENCE',
  questionIds: ['C01_SIZE_PREFERENCE', 'C02_ENERGY', 'C03_NOISE_TOLERANCE', 'C04_HANDLING', 'C05_LIFESPAN']
};

// ============================================================================
// Questions
// ============================================================================

export const COMPANION_QUESTIONS: Question[] = [
  {
    id: 'C01_SIZE_PREFERENCE',
    textKey: 'questionnaire.c01.text',
    hintKey: 'questionnaire.c01.hint',
    moduleId: 'COMPANION',
    visualization: 'cards',
    // Show for dogs, cats, small mammals
    showIf: "Route.selectedSpecies == 'dog' or Route.selectedSpecies == 'cat' or Route.selectedSpecies == 'small_mammal' or Route.selectedSpecies == 'unsure'",
    nextOnSkip: 'C03_NOISE_TOLERANCE',
    options: [
      {
        id: 'small',
        labelKey: 'questionnaire.c01.options.small',
        descriptionKey: 'questionnaire.c01.options.small_desc',
        icon: 'cruelty_free',
        set: [
          { path: 'SpeciesPreferences.sizePreference', op: 'set', value: 'small', valueType: 'enum' }
        ],
        next: 'C02_ENERGY'
      },
      {
        id: 'medium',
        labelKey: 'questionnaire.c01.options.medium',
        descriptionKey: 'questionnaire.c01.options.medium_desc',
        icon: 'pets',
        set: [
          { path: 'SpeciesPreferences.sizePreference', op: 'set', value: 'medium', valueType: 'enum' }
        ],
        next: 'C02_ENERGY'
      },
      {
        id: 'large',
        labelKey: 'questionnaire.c01.options.large',
        descriptionKey: 'questionnaire.c01.options.large_desc',
        icon: 'pets',
        set: [
          { path: 'SpeciesPreferences.sizePreference', op: 'set', value: 'large', valueType: 'enum' }
        ],
        next: 'C02_ENERGY'
      },
      {
        id: 'no_preference',
        labelKey: 'questionnaire.c01.options.no_preference',
        icon: 'help_outline',
        set: [
          { path: 'SpeciesPreferences.sizePreference', op: 'set', value: 'no_preference', valueType: 'enum' }
        ],
        next: 'C02_ENERGY'
      }
    ]
  },

  {
    id: 'C02_ENERGY',
    textKey: 'questionnaire.c02.text',
    hintKey: 'questionnaire.c02.hint',
    moduleId: 'COMPANION',
    visualization: 'cards',
    showIf: "Route.selectedSpecies == 'dog' or Route.selectedSpecies == 'cat' or Route.selectedSpecies == 'unsure'",
    nextOnSkip: 'C03_NOISE_TOLERANCE',
    options: [
      {
        id: 'low',
        labelKey: 'questionnaire.c02.options.low',
        descriptionKey: 'questionnaire.c02.options.low_desc',
        icon: 'self_improvement',
        set: [
          { path: 'SpeciesPreferences.energyPreference', op: 'set', value: 'low', valueType: 'enum' }
        ],
        next: 'C03_NOISE_TOLERANCE'
      },
      {
        id: 'medium',
        labelKey: 'questionnaire.c02.options.medium',
        descriptionKey: 'questionnaire.c02.options.medium_desc',
        icon: 'directions_walk',
        set: [
          { path: 'SpeciesPreferences.energyPreference', op: 'set', value: 'medium', valueType: 'enum' }
        ],
        next: 'C03_NOISE_TOLERANCE'
      },
      {
        id: 'high',
        labelKey: 'questionnaire.c02.options.high',
        descriptionKey: 'questionnaire.c02.options.high_desc',
        icon: 'directions_run',
        set: [
          { path: 'SpeciesPreferences.energyPreference', op: 'set', value: 'high', valueType: 'enum' }
        ],
        next: 'C03_NOISE_TOLERANCE'
      },
      {
        id: 'no_preference',
        labelKey: 'questionnaire.c02.options.no_preference',
        icon: 'help_outline',
        set: [
          { path: 'SpeciesPreferences.energyPreference', op: 'set', value: 'no_preference', valueType: 'enum' }
        ],
        next: 'C03_NOISE_TOLERANCE'
      }
    ]
  },

  {
    id: 'C03_NOISE_TOLERANCE',
    textKey: 'questionnaire.c03.text',
    hintKey: 'questionnaire.c03.hint',
    moduleId: 'COMPANION',
    visualization: 'squares',
    // Show for all companion animals
    options: [
      {
        id: 'silent',
        labelKey: 'questionnaire.c03.options.silent',
        descriptionKey: 'questionnaire.c03.options.silent_desc',
        icon: 'volume_off',
        set: [
          { path: 'SpeciesPreferences.noiseTolerance', op: 'set', value: 'silent', valueType: 'enum' }
        ],
        next: 'C04_HANDLING'
      },
      {
        id: 'low',
        labelKey: 'questionnaire.c03.options.low',
        descriptionKey: 'questionnaire.c03.options.low_desc',
        icon: 'volume_down',
        set: [
          { path: 'SpeciesPreferences.noiseTolerance', op: 'set', value: 'low', valueType: 'enum' }
        ],
        next: 'C04_HANDLING'
      },
      {
        id: 'medium',
        labelKey: 'questionnaire.c03.options.medium',
        descriptionKey: 'questionnaire.c03.options.medium_desc',
        icon: 'volume_up',
        set: [
          { path: 'SpeciesPreferences.noiseTolerance', op: 'set', value: 'medium', valueType: 'enum' }
        ],
        next: 'C04_HANDLING'
      },
      {
        id: 'high',
        labelKey: 'questionnaire.c03.options.high',
        descriptionKey: 'questionnaire.c03.options.high_desc',
        icon: 'campaign',
        set: [
          { path: 'SpeciesPreferences.noiseTolerance', op: 'set', value: 'high', valueType: 'enum' }
        ],
        next: 'C04_HANDLING'
      }
    ]
  },

  {
    id: 'C04_HANDLING',
    textKey: 'questionnaire.c04.text',
    hintKey: 'questionnaire.c04.hint',
    moduleId: 'COMPANION',
    visualization: 'cards',
    // More relevant for small mammals and birds
    showIf: "Route.selectedSpecies == 'small_mammal' or Route.selectedSpecies == 'bird' or Route.selectedSpecies == 'unsure'",
    nextOnSkip: 'C05_LIFESPAN',
    options: [
      {
        id: 'minimal',
        labelKey: 'questionnaire.c04.options.minimal',
        descriptionKey: 'questionnaire.c04.options.minimal_desc',
        icon: 'visibility',
        set: [
          { path: 'SpeciesPreferences.handlingFrequency', op: 'set', value: 'minimal', valueType: 'enum' }
        ],
        next: 'C05_LIFESPAN'
      },
      {
        id: 'regular',
        labelKey: 'questionnaire.c04.options.regular',
        descriptionKey: 'questionnaire.c04.options.regular_desc',
        icon: 'pan_tool',
        set: [
          { path: 'SpeciesPreferences.handlingFrequency', op: 'set', value: 'regular', valueType: 'enum' }
        ],
        next: 'C05_LIFESPAN'
      },
      {
        id: 'frequent',
        labelKey: 'questionnaire.c04.options.frequent',
        descriptionKey: 'questionnaire.c04.options.frequent_desc',
        icon: 'favorite',
        set: [
          { path: 'SpeciesPreferences.handlingFrequency', op: 'set', value: 'frequent', valueType: 'enum' }
        ],
        next: 'C05_LIFESPAN'
      }
    ]
  },

  {
    id: 'C05_LIFESPAN',
    textKey: 'questionnaire.c05.text',
    hintKey: 'questionnaire.c05.hint',
    moduleId: 'COMPANION',
    visualization: 'cards',
    options: [
      {
        id: 'short',
        labelKey: 'questionnaire.c05.options.short',
        descriptionKey: 'questionnaire.c05.options.short_desc',
        set: [
          { path: 'ContingencyProfile.longTermCommitment', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'C05_ROUTE_SPECIES'
      },
      {
        id: 'medium',
        labelKey: 'questionnaire.c05.options.medium',
        descriptionKey: 'questionnaire.c05.options.medium_desc',
        set: [
          { path: 'ContingencyProfile.longTermCommitment', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'C05_ROUTE_SPECIES'
      },
      {
        id: 'long',
        labelKey: 'questionnaire.c05.options.long',
        descriptionKey: 'questionnaire.c05.options.long_desc',
        set: [
          { path: 'ContingencyProfile.longTermCommitment', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'C05_ROUTE_SPECIES'
      },
      {
        id: 'no_preference',
        labelKey: 'questionnaire.c05.options.no_preference',
        set: [],
        next: 'C05_ROUTE_SPECIES'
      }
    ]
  },

  // Router question - invisible, just routes based on selected species
  {
    id: 'C05_ROUTE_SPECIES',
    textKey: 'questionnaire.c05_route.text', // Not displayed
    moduleId: 'COMPANION',
    visualization: 'radio',
    // This is a "virtual" question that routes based on species
    // In practice, the flow engine should handle this based on Route.selectedModule
    options: [
      {
        id: 'dog',
        labelKey: 'questionnaire.c05_route.options.dog',
        set: [
          { path: 'Route.completedModules', op: 'push', value: 'COMPANION', valueType: 'array' }
        ],
        next: 'module:DOG'
      },
      {
        id: 'cat',
        labelKey: 'questionnaire.c05_route.options.cat',
        set: [
          { path: 'Route.completedModules', op: 'push', value: 'COMPANION', valueType: 'array' }
        ],
        next: 'module:CAT'
      },
      {
        id: 'small_mammal',
        labelKey: 'questionnaire.c05_route.options.small_mammal',
        set: [
          { path: 'Route.completedModules', op: 'push', value: 'COMPANION', valueType: 'array' }
        ],
        next: 'module:SMALL_MAMMAL'
      },
      {
        id: 'bird',
        labelKey: 'questionnaire.c05_route.options.bird',
        set: [
          { path: 'Route.completedModules', op: 'push', value: 'COMPANION', valueType: 'array' }
        ],
        next: 'module:BIRD'
      },
      {
        id: 'unsure',
        labelKey: 'questionnaire.c05_route.options.unsure',
        set: [
          { path: 'Route.completedModules', op: 'push', value: 'COMPANION', valueType: 'array' }
        ],
        next: 'leaf:FINAL_RECOMMENDATION'
      }
    ]
  }
];

// ============================================================================
// Exported Maps
// ============================================================================

export const COMPANION_QUESTIONS_MAP: QuestionsMap = COMPANION_QUESTIONS.reduce(
  (acc, q) => {
    acc[q.id] = q;
    return acc;
  },
  {} as QuestionsMap
);

export const COMPANION_QUESTIONS_ORDER: string[] = COMPANION_QUESTIONS.map(q => q.id);
