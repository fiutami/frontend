/**
 * Core Questions (Q00-Q27) for Questionnaire v1.1
 *
 * Entry point and main flow before species-specific modules.
 * All text uses i18n keys (questionnaire.qXX.*)
 *
 * @version 1.1
 */

import { Question, QuestionsMap } from '../models/question.models';

export const CORE_QUESTIONS: Question[] = [
  // ============================================================================
  // Q00 - Entry Point
  // ============================================================================
  {
    id: 'Q00_ENTRY',
    textKey: 'questionnaire.q00.text',
    hintKey: 'questionnaire.q00.hint',
    visualization: 'cards',
    options: [
      {
        id: 'find_ideal',
        labelKey: 'questionnaire.q00.options.find_ideal',
        descriptionKey: 'questionnaire.q00.options.find_ideal_desc',
        icon: 'search',
        set: [
          { path: 'RelationshipProfile.motivation', op: 'set', value: 'find_ideal', valueType: 'enum' }
        ],
        next: 'Q01_COUNTRY'
      },
      {
        id: 'register_pet',
        labelKey: 'questionnaire.q00.options.register_pet',
        descriptionKey: 'questionnaire.q00.options.register_pet_desc',
        icon: 'pets',
        set: [
          { path: 'RelationshipProfile.motivation', op: 'set', value: 'register_pet', valueType: 'enum' }
        ],
        next: 'leaf:REGISTER_REDIRECT'
      },
      {
        id: 'curiosity',
        labelKey: 'questionnaire.q00.options.curiosity',
        descriptionKey: 'questionnaire.q00.options.curiosity_desc',
        icon: 'help_outline',
        set: [
          { path: 'RelationshipProfile.motivation', op: 'set', value: 'curiosity', valueType: 'enum' }
        ],
        next: 'Q01_COUNTRY'
      }
    ]
  },

  // ============================================================================
  // Q01-Q05 - Jurisdiction & Location
  // ============================================================================
  {
    id: 'Q01_COUNTRY',
    textKey: 'questionnaire.q01.text',
    hintKey: 'questionnaire.q01.hint',
    visualization: 'radio',
    options: [
      {
        id: 'italy',
        labelKey: 'questionnaire.q01.options.italy',
        icon: '🇮🇹',
        set: [
          { path: 'JurisdictionProfile.country', op: 'set', value: 'IT', valueType: 'string' }
        ],
        next: 'Q02_REGION'
      },
      {
        id: 'brazil',
        labelKey: 'questionnaire.q01.options.brazil',
        icon: '🇧🇷',
        set: [
          { path: 'JurisdictionProfile.country', op: 'set', value: 'BR', valueType: 'string' }
        ],
        next: 'Q02_REGION'
      },
      {
        id: 'other',
        labelKey: 'questionnaire.q01.options.other',
        icon: '🌍',
        set: [
          { path: 'JurisdictionProfile.country', op: 'set', value: 'OTHER', valueType: 'string' }
        ],
        next: 'Q02_REGION'
      }
    ]
  },

  {
    id: 'Q02_REGION',
    textKey: 'questionnaire.q02.text',
    visualization: 'radio',
    // This would be dynamically populated based on country
    options: [
      {
        id: 'north',
        labelKey: 'questionnaire.q02.options.north',
        set: [
          { path: 'JurisdictionProfile.region', op: 'set', value: 'north', valueType: 'string' },
          { path: 'EnvironmentProfile.climate', op: 'set', value: 'cold', valueType: 'enum' }
        ],
        next: 'Q03_HOUSING'
      },
      {
        id: 'center',
        labelKey: 'questionnaire.q02.options.center',
        set: [
          { path: 'JurisdictionProfile.region', op: 'set', value: 'center', valueType: 'string' },
          { path: 'EnvironmentProfile.climate', op: 'set', value: 'temperate', valueType: 'enum' }
        ],
        next: 'Q03_HOUSING'
      },
      {
        id: 'south',
        labelKey: 'questionnaire.q02.options.south',
        set: [
          { path: 'JurisdictionProfile.region', op: 'set', value: 'south', valueType: 'string' },
          { path: 'EnvironmentProfile.climate', op: 'set', value: 'warm', valueType: 'enum' }
        ],
        next: 'Q03_HOUSING'
      }
    ]
  },

  // ============================================================================
  // Q03-Q06 - Environment
  // ============================================================================
  {
    id: 'Q03_HOUSING',
    textKey: 'questionnaire.q03.text',
    hintKey: 'questionnaire.q03.hint',
    visualization: 'cards',
    options: [
      {
        id: 'apartment_small',
        labelKey: 'questionnaire.q03.options.apartment_small',
        descriptionKey: 'questionnaire.q03.options.apartment_small_desc',
        icon: 'apartment',
        set: [
          { path: 'EnvironmentProfile.housingType', op: 'set', value: 'apartment_small', valueType: 'enum' },
          { path: 'EnvironmentProfile.outdoorAccess', op: 'set', value: 'none', valueType: 'enum' }
        ],
        next: 'Q04_OUTDOOR'
      },
      {
        id: 'apartment_large',
        labelKey: 'questionnaire.q03.options.apartment_large',
        descriptionKey: 'questionnaire.q03.options.apartment_large_desc',
        icon: 'home',
        set: [
          { path: 'EnvironmentProfile.housingType', op: 'set', value: 'apartment_large', valueType: 'enum' }
        ],
        next: 'Q04_OUTDOOR'
      },
      {
        id: 'house_garden',
        labelKey: 'questionnaire.q03.options.house_garden',
        descriptionKey: 'questionnaire.q03.options.house_garden_desc',
        icon: 'cottage',
        set: [
          { path: 'EnvironmentProfile.housingType', op: 'set', value: 'house_with_garden', valueType: 'enum' },
          { path: 'EnvironmentProfile.outdoorAccess', op: 'set', value: 'private_garden', valueType: 'enum' }
        ],
        next: 'Q05_NOISE'
      },
      {
        id: 'rural',
        labelKey: 'questionnaire.q03.options.rural',
        descriptionKey: 'questionnaire.q03.options.rural_desc',
        icon: 'landscape',
        set: [
          { path: 'EnvironmentProfile.housingType', op: 'set', value: 'rural', valueType: 'enum' },
          { path: 'EnvironmentProfile.outdoorAccess', op: 'set', value: 'large_property', valueType: 'enum' }
        ],
        next: 'Q05_NOISE'
      }
    ]
  },

  {
    id: 'Q04_OUTDOOR',
    textKey: 'questionnaire.q04.text',
    showIf: "EnvironmentProfile.housingType == 'apartment_small' or EnvironmentProfile.housingType == 'apartment_large'",
    nextOnSkip: 'Q05_NOISE',
    visualization: 'squares',
    options: [
      {
        id: 'none',
        labelKey: 'questionnaire.q04.options.none',
        icon: 'block',
        set: [
          { path: 'EnvironmentProfile.outdoorAccess', op: 'set', value: 'none', valueType: 'enum' }
        ],
        next: 'Q05_NOISE'
      },
      {
        id: 'balcony',
        labelKey: 'questionnaire.q04.options.balcony',
        icon: 'balcony',
        set: [
          { path: 'EnvironmentProfile.outdoorAccess', op: 'set', value: 'balcony', valueType: 'enum' }
        ],
        next: 'Q05_NOISE'
      },
      {
        id: 'shared_garden',
        labelKey: 'questionnaire.q04.options.shared_garden',
        icon: 'park',
        set: [
          { path: 'EnvironmentProfile.outdoorAccess', op: 'set', value: 'shared_garden', valueType: 'enum' }
        ],
        next: 'Q05_NOISE'
      }
    ]
  },

  {
    id: 'Q05_NOISE',
    textKey: 'questionnaire.q05.text',
    hintKey: 'questionnaire.q05.hint',
    visualization: 'radio',
    options: [
      {
        id: 'yes',
        labelKey: 'questionnaire.q05.options.yes',
        set: [
          { path: 'EnvironmentProfile.noiseRestrictions', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q06_FAMILY'
      },
      {
        id: 'no',
        labelKey: 'questionnaire.q05.options.no',
        set: [
          { path: 'EnvironmentProfile.noiseRestrictions', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q06_FAMILY'
      },
      {
        id: 'unsure',
        labelKey: 'questionnaire.q05.options.unsure',
        set: [
          { path: 'EnvironmentProfile.noiseRestrictions', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q06_FAMILY'
      }
    ]
  },

  // ============================================================================
  // Q06-Q08 - Family & Relationships
  // ============================================================================
  {
    id: 'Q06_FAMILY',
    textKey: 'questionnaire.q06.text',
    visualization: 'cards',
    options: [
      {
        id: 'single',
        labelKey: 'questionnaire.q06.options.single',
        icon: 'person',
        set: [
          { path: 'RelationshipProfile.familyComposition', op: 'set', value: 'single', valueType: 'enum' }
        ],
        next: 'Q09_TIME'
      },
      {
        id: 'couple',
        labelKey: 'questionnaire.q06.options.couple',
        icon: 'people',
        set: [
          { path: 'RelationshipProfile.familyComposition', op: 'set', value: 'couple', valueType: 'enum' }
        ],
        next: 'Q07_AGREEMENT'
      },
      {
        id: 'family_kids',
        labelKey: 'questionnaire.q06.options.family_kids',
        icon: 'family_restroom',
        set: [
          { path: 'RelationshipProfile.familyComposition', op: 'set', value: 'family_young_kids', valueType: 'enum' }
        ],
        next: 'Q08_CHILDREN_AGES'
      },
      {
        id: 'seniors',
        labelKey: 'questionnaire.q06.options.seniors',
        icon: 'elderly',
        set: [
          { path: 'RelationshipProfile.familyComposition', op: 'set', value: 'seniors', valueType: 'enum' },
          { path: 'HealthProfile.needsSeniorFriendly', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q09_TIME'
      }
    ]
  },

  {
    id: 'Q07_AGREEMENT',
    textKey: 'questionnaire.q07.text',
    showIf: "RelationshipProfile.familyComposition == 'couple' or RelationshipProfile.familyComposition == 'family_young_kids' or RelationshipProfile.familyComposition == 'family_teens'",
    nextOnSkip: 'Q09_TIME',
    visualization: 'radio',
    options: [
      {
        id: 'yes',
        labelKey: 'questionnaire.q07.options.yes',
        set: [
          { path: 'RelationshipProfile.householdAgreement', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q09_TIME'
      },
      {
        id: 'discussing',
        labelKey: 'questionnaire.q07.options.discussing',
        set: [
          { path: 'RelationshipProfile.householdAgreement', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q09_TIME'
      },
      {
        id: 'no',
        labelKey: 'questionnaire.q07.options.no',
        set: [
          { path: 'RelationshipProfile.householdAgreement', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q09_TIME'
      }
    ]
  },

  {
    id: 'Q08_CHILDREN_AGES',
    textKey: 'questionnaire.q08.text',
    showIf: "RelationshipProfile.familyComposition == 'family_young_kids' or RelationshipProfile.familyComposition == 'family_teens'",
    nextOnSkip: 'Q09_TIME',
    visualization: 'squares',
    options: [
      {
        id: 'babies',
        labelKey: 'questionnaire.q08.options.babies',
        descriptionKey: 'questionnaire.q08.options.babies_desc',
        set: [
          { path: 'RelationshipProfile.childrenAges', op: 'push', value: 2, valueType: 'array' }
        ],
        next: 'Q07_AGREEMENT'
      },
      {
        id: 'toddlers',
        labelKey: 'questionnaire.q08.options.toddlers',
        descriptionKey: 'questionnaire.q08.options.toddlers_desc',
        set: [
          { path: 'RelationshipProfile.childrenAges', op: 'push', value: 5, valueType: 'array' }
        ],
        next: 'Q07_AGREEMENT'
      },
      {
        id: 'children',
        labelKey: 'questionnaire.q08.options.children',
        descriptionKey: 'questionnaire.q08.options.children_desc',
        set: [
          { path: 'RelationshipProfile.childrenAges', op: 'push', value: 10, valueType: 'array' },
          { path: 'RelationshipProfile.familyComposition', op: 'set', value: 'family_young_kids', valueType: 'enum' }
        ],
        next: 'Q07_AGREEMENT'
      },
      {
        id: 'teens',
        labelKey: 'questionnaire.q08.options.teens',
        descriptionKey: 'questionnaire.q08.options.teens_desc',
        set: [
          { path: 'RelationshipProfile.childrenAges', op: 'push', value: 15, valueType: 'array' },
          { path: 'RelationshipProfile.familyComposition', op: 'set', value: 'family_teens', valueType: 'enum' }
        ],
        next: 'Q07_AGREEMENT'
      }
    ]
  },

  // ============================================================================
  // Q09-Q12 - Lifestyle & Time
  // ============================================================================
  {
    id: 'Q09_TIME',
    textKey: 'questionnaire.q09.text',
    hintKey: 'questionnaire.q09.hint',
    visualization: 'cards',
    options: [
      {
        id: 'minimal',
        labelKey: 'questionnaire.q09.options.minimal',
        descriptionKey: 'questionnaire.q09.options.minimal_desc',
        icon: 'hourglass_empty',
        set: [
          { path: 'LifestyleProfile.dailyTime', op: 'set', value: 'minimal', valueType: 'enum' }
        ],
        next: 'Q10_AWAY_HOURS'
      },
      {
        id: 'moderate',
        labelKey: 'questionnaire.q09.options.moderate',
        descriptionKey: 'questionnaire.q09.options.moderate_desc',
        icon: 'schedule',
        set: [
          { path: 'LifestyleProfile.dailyTime', op: 'set', value: 'medium', valueType: 'enum' }
        ],
        next: 'Q10_AWAY_HOURS'
      },
      {
        id: 'plenty',
        labelKey: 'questionnaire.q09.options.plenty',
        descriptionKey: 'questionnaire.q09.options.plenty_desc',
        icon: 'free_cancellation',
        set: [
          { path: 'LifestyleProfile.dailyTime', op: 'set', value: 'high', valueType: 'enum' }
        ],
        next: 'Q10_AWAY_HOURS'
      },
      {
        id: 'flexible',
        labelKey: 'questionnaire.q09.options.flexible',
        descriptionKey: 'questionnaire.q09.options.flexible_desc',
        icon: 'home_work',
        set: [
          { path: 'LifestyleProfile.dailyTime', op: 'set', value: 'flexible', valueType: 'enum' },
          { path: 'LifestyleProfile.worksFromHome', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q10_AWAY_HOURS'
      }
    ]
  },

  {
    id: 'Q10_AWAY_HOURS',
    textKey: 'questionnaire.q10.text',
    visualization: 'squares',
    options: [
      {
        id: 'few',
        labelKey: 'questionnaire.q10.options.few',
        descriptionKey: 'questionnaire.q10.options.few_desc',
        set: [
          { path: 'LifestyleProfile.awayHoursPerDay', op: 'set', value: 4, valueType: 'number' }
        ],
        next: 'Q11_ACTIVITY'
      },
      {
        id: 'standard',
        labelKey: 'questionnaire.q10.options.standard',
        descriptionKey: 'questionnaire.q10.options.standard_desc',
        set: [
          { path: 'LifestyleProfile.awayHoursPerDay', op: 'set', value: 8, valueType: 'number' }
        ],
        next: 'Q11_ACTIVITY'
      },
      {
        id: 'long',
        labelKey: 'questionnaire.q10.options.long',
        descriptionKey: 'questionnaire.q10.options.long_desc',
        set: [
          { path: 'LifestyleProfile.awayHoursPerDay', op: 'set', value: 10, valueType: 'number' }
        ],
        next: 'Q11_ACTIVITY'
      },
      {
        id: 'variable',
        labelKey: 'questionnaire.q10.options.variable',
        set: [
          { path: 'LifestyleProfile.awayHoursPerDay', op: 'set', value: 6, valueType: 'number' },
          { path: 'LifestyleProfile.frequentTravel', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q11_ACTIVITY'
      }
    ]
  },

  {
    id: 'Q11_ACTIVITY',
    textKey: 'questionnaire.q11.text',
    hintKey: 'questionnaire.q11.hint',
    visualization: 'cards',
    options: [
      {
        id: 'sedentary',
        labelKey: 'questionnaire.q11.options.sedentary',
        icon: 'weekend',
        set: [
          { path: 'LifestyleProfile.activityLevel', op: 'set', value: 'sedentary', valueType: 'enum' }
        ],
        next: 'Q12_EXPERIENCE'
      },
      {
        id: 'moderate',
        labelKey: 'questionnaire.q11.options.moderate',
        icon: 'directions_walk',
        set: [
          { path: 'LifestyleProfile.activityLevel', op: 'set', value: 'moderate', valueType: 'enum' }
        ],
        next: 'Q12_EXPERIENCE'
      },
      {
        id: 'active',
        labelKey: 'questionnaire.q11.options.active',
        icon: 'directions_run',
        set: [
          { path: 'LifestyleProfile.activityLevel', op: 'set', value: 'active', valueType: 'enum' }
        ],
        next: 'Q12_EXPERIENCE'
      },
      {
        id: 'athletic',
        labelKey: 'questionnaire.q11.options.athletic',
        icon: 'fitness_center',
        set: [
          { path: 'LifestyleProfile.activityLevel', op: 'set', value: 'athletic', valueType: 'enum' }
        ],
        next: 'Q12_EXPERIENCE'
      }
    ]
  },

  {
    id: 'Q12_EXPERIENCE',
    textKey: 'questionnaire.q12.text',
    visualization: 'cards',
    options: [
      {
        id: 'none',
        labelKey: 'questionnaire.q12.options.none',
        descriptionKey: 'questionnaire.q12.options.none_desc',
        icon: 'new_releases',
        set: [
          { path: 'LifestyleProfile.experience', op: 'set', value: 'none', valueType: 'enum' }
        ],
        next: 'Q13_OTHER_PETS'
      },
      {
        id: 'some',
        labelKey: 'questionnaire.q12.options.some',
        descriptionKey: 'questionnaire.q12.options.some_desc',
        icon: 'pets',
        set: [
          { path: 'LifestyleProfile.experience', op: 'set', value: 'some', valueType: 'enum' }
        ],
        next: 'Q13_OTHER_PETS'
      },
      {
        id: 'experienced',
        labelKey: 'questionnaire.q12.options.experienced',
        descriptionKey: 'questionnaire.q12.options.experienced_desc',
        icon: 'verified',
        set: [
          { path: 'LifestyleProfile.experience', op: 'set', value: 'experienced', valueType: 'enum' }
        ],
        next: 'Q13_OTHER_PETS'
      },
      {
        id: 'professional',
        labelKey: 'questionnaire.q12.options.professional',
        descriptionKey: 'questionnaire.q12.options.professional_desc',
        icon: 'workspace_premium',
        set: [
          { path: 'LifestyleProfile.experience', op: 'set', value: 'professional', valueType: 'enum' }
        ],
        next: 'Q13_OTHER_PETS'
      }
    ]
  },

  {
    id: 'Q13_OTHER_PETS',
    textKey: 'questionnaire.q13.text',
    visualization: 'radio',
    options: [
      {
        id: 'no',
        labelKey: 'questionnaire.q13.options.no',
        set: [
          { path: 'LifestyleProfile.hasOtherPets', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q14_BUDGET'
      },
      {
        id: 'dog',
        labelKey: 'questionnaire.q13.options.dog',
        set: [
          { path: 'LifestyleProfile.hasOtherPets', op: 'set', value: true, valueType: 'boolean' },
          { path: 'LifestyleProfile.otherPetTypes', op: 'push', value: 'dog', valueType: 'array' }
        ],
        next: 'Q14_BUDGET'
      },
      {
        id: 'cat',
        labelKey: 'questionnaire.q13.options.cat',
        set: [
          { path: 'LifestyleProfile.hasOtherPets', op: 'set', value: true, valueType: 'boolean' },
          { path: 'LifestyleProfile.otherPetTypes', op: 'push', value: 'cat', valueType: 'array' }
        ],
        next: 'Q14_BUDGET'
      },
      {
        id: 'other',
        labelKey: 'questionnaire.q13.options.other',
        set: [
          { path: 'LifestyleProfile.hasOtherPets', op: 'set', value: true, valueType: 'boolean' },
          { path: 'LifestyleProfile.otherPetTypes', op: 'push', value: 'other', valueType: 'array' }
        ],
        next: 'Q14_BUDGET'
      }
    ]
  },

  // ============================================================================
  // Q14-Q16 - Finance
  // ============================================================================
  {
    id: 'Q14_BUDGET',
    textKey: 'questionnaire.q14.text',
    hintKey: 'questionnaire.q14.hint',
    visualization: 'cards',
    options: [
      {
        id: 'low',
        labelKey: 'questionnaire.q14.options.low',
        descriptionKey: 'questionnaire.q14.options.low_desc',
        set: [
          { path: 'FinanceProfile.monthlyBudget', op: 'set', value: 'low', valueType: 'enum' },
          { path: 'FinanceProfile.monthlyAmountEur', op: 'set', value: 50, valueType: 'number' }
        ],
        next: 'Q15_EMERGENCY'
      },
      {
        id: 'medium',
        labelKey: 'questionnaire.q14.options.medium',
        descriptionKey: 'questionnaire.q14.options.medium_desc',
        set: [
          { path: 'FinanceProfile.monthlyBudget', op: 'set', value: 'medium', valueType: 'enum' },
          { path: 'FinanceProfile.monthlyAmountEur', op: 'set', value: 150, valueType: 'number' }
        ],
        next: 'Q15_EMERGENCY'
      },
      {
        id: 'high',
        labelKey: 'questionnaire.q14.options.high',
        descriptionKey: 'questionnaire.q14.options.high_desc',
        set: [
          { path: 'FinanceProfile.monthlyBudget', op: 'set', value: 'high', valueType: 'enum' },
          { path: 'FinanceProfile.monthlyAmountEur', op: 'set', value: 300, valueType: 'number' }
        ],
        next: 'Q15_EMERGENCY'
      },
      {
        id: 'unlimited',
        labelKey: 'questionnaire.q14.options.unlimited',
        descriptionKey: 'questionnaire.q14.options.unlimited_desc',
        set: [
          { path: 'FinanceProfile.monthlyBudget', op: 'set', value: 'unlimited', valueType: 'enum' }
        ],
        next: 'Q15_EMERGENCY'
      }
    ]
  },

  {
    id: 'Q15_EMERGENCY',
    textKey: 'questionnaire.q15.text',
    hintKey: 'questionnaire.q15.hint',
    visualization: 'radio',
    options: [
      {
        id: 'yes',
        labelKey: 'questionnaire.q15.options.yes',
        set: [
          { path: 'FinanceProfile.emergencyFundAvailable', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q16_INSURANCE'
      },
      {
        id: 'partial',
        labelKey: 'questionnaire.q15.options.partial',
        set: [
          { path: 'FinanceProfile.emergencyFundAvailable', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q16_INSURANCE'
      },
      {
        id: 'no',
        labelKey: 'questionnaire.q15.options.no',
        set: [
          { path: 'FinanceProfile.emergencyFundAvailable', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q16_INSURANCE'
      }
    ]
  },

  {
    id: 'Q16_INSURANCE',
    textKey: 'questionnaire.q16.text',
    visualization: 'radio',
    options: [
      {
        id: 'yes',
        labelKey: 'questionnaire.q16.options.yes',
        set: [
          { path: 'FinanceProfile.willingToInsure', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q17_ALLERGIES'
      },
      {
        id: 'maybe',
        labelKey: 'questionnaire.q16.options.maybe',
        set: [
          { path: 'FinanceProfile.willingToInsure', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q17_ALLERGIES'
      },
      {
        id: 'no',
        labelKey: 'questionnaire.q16.options.no',
        set: [
          { path: 'FinanceProfile.willingToInsure', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q17_ALLERGIES'
      }
    ]
  },

  // ============================================================================
  // Q17-Q19 - Health
  // ============================================================================
  {
    id: 'Q17_ALLERGIES',
    textKey: 'questionnaire.q17.text',
    visualization: 'radio',
    options: [
      {
        id: 'none',
        labelKey: 'questionnaire.q17.options.none',
        set: [
          { path: 'HealthProfile.allergyStatus', op: 'set', value: 'none', valueType: 'enum' }
        ],
        next: 'Q18_PHYSICAL'
      },
      {
        id: 'mild',
        labelKey: 'questionnaire.q17.options.mild',
        set: [
          { path: 'HealthProfile.allergyStatus', op: 'set', value: 'mild', valueType: 'enum' }
        ],
        next: 'Q18_PHYSICAL'
      },
      {
        id: 'moderate',
        labelKey: 'questionnaire.q17.options.moderate',
        set: [
          { path: 'HealthProfile.allergyStatus', op: 'set', value: 'moderate', valueType: 'enum' }
        ],
        next: 'Q18_PHYSICAL'
      },
      {
        id: 'severe',
        labelKey: 'questionnaire.q17.options.severe',
        set: [
          { path: 'HealthProfile.allergyStatus', op: 'set', value: 'severe', valueType: 'enum' }
        ],
        next: 'Q18_PHYSICAL'
      }
    ]
  },

  {
    id: 'Q18_PHYSICAL',
    textKey: 'questionnaire.q18.text',
    hintKey: 'questionnaire.q18.hint',
    visualization: 'radio',
    options: [
      {
        id: 'no_limitations',
        labelKey: 'questionnaire.q18.options.no_limitations',
        set: [
          { path: 'HealthProfile.physicalLimitations', op: 'set', value: false, valueType: 'boolean' },
          { path: 'HealthProfile.canHandleLargeAnimals', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q19_GROOMING'
      },
      {
        id: 'some_limitations',
        labelKey: 'questionnaire.q18.options.some_limitations',
        set: [
          { path: 'HealthProfile.physicalLimitations', op: 'set', value: true, valueType: 'boolean' },
          { path: 'HealthProfile.canHandleLargeAnimals', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q19_GROOMING'
      },
      {
        id: 'mobility_issues',
        labelKey: 'questionnaire.q18.options.mobility_issues',
        set: [
          { path: 'HealthProfile.physicalLimitations', op: 'set', value: true, valueType: 'boolean' },
          { path: 'HealthProfile.canHandleLargeAnimals', op: 'set', value: false, valueType: 'boolean' },
          { path: 'HealthProfile.needsSeniorFriendly', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q19_GROOMING'
      }
    ]
  },

  // ============================================================================
  // Q19-Q21 - Care
  // ============================================================================
  {
    id: 'Q19_GROOMING',
    textKey: 'questionnaire.q19.text',
    visualization: 'cards',
    options: [
      {
        id: 'minimal',
        labelKey: 'questionnaire.q19.options.minimal',
        descriptionKey: 'questionnaire.q19.options.minimal_desc',
        set: [
          { path: 'CareRoutineProfile.groomingWillingness', op: 'set', value: 'minimal', valueType: 'enum' }
        ],
        next: 'Q20_TRAINING'
      },
      {
        id: 'weekly',
        labelKey: 'questionnaire.q19.options.weekly',
        descriptionKey: 'questionnaire.q19.options.weekly_desc',
        set: [
          { path: 'CareRoutineProfile.groomingWillingness', op: 'set', value: 'weekly', valueType: 'enum' }
        ],
        next: 'Q20_TRAINING'
      },
      {
        id: 'daily',
        labelKey: 'questionnaire.q19.options.daily',
        descriptionKey: 'questionnaire.q19.options.daily_desc',
        set: [
          { path: 'CareRoutineProfile.groomingWillingness', op: 'set', value: 'daily', valueType: 'enum' }
        ],
        next: 'Q20_TRAINING'
      },
      {
        id: 'professional',
        labelKey: 'questionnaire.q19.options.professional',
        descriptionKey: 'questionnaire.q19.options.professional_desc',
        set: [
          { path: 'CareRoutineProfile.groomingWillingness', op: 'set', value: 'professional', valueType: 'enum' }
        ],
        next: 'Q20_TRAINING'
      }
    ]
  },

  {
    id: 'Q20_TRAINING',
    textKey: 'questionnaire.q20.text',
    visualization: 'radio',
    options: [
      {
        id: 'yes',
        labelKey: 'questionnaire.q20.options.yes',
        set: [
          { path: 'CareRoutineProfile.willingToTrain', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q21_ADOPTION'
      },
      {
        id: 'basic',
        labelKey: 'questionnaire.q20.options.basic',
        set: [
          { path: 'CareRoutineProfile.willingToTrain', op: 'set', value: true, valueType: 'boolean' },
          { path: 'CareRoutineProfile.trainingHoursPerWeek', op: 'set', value: 2, valueType: 'number' }
        ],
        next: 'Q21_ADOPTION'
      },
      {
        id: 'no',
        labelKey: 'questionnaire.q20.options.no',
        set: [
          { path: 'CareRoutineProfile.willingToTrain', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q21_ADOPTION'
      }
    ]
  },

  // ============================================================================
  // Q21-Q23 - Ethics
  // ============================================================================
  {
    id: 'Q21_ADOPTION',
    textKey: 'questionnaire.q21.text',
    visualization: 'cards',
    options: [
      {
        id: 'shelter',
        labelKey: 'questionnaire.q21.options.shelter',
        descriptionKey: 'questionnaire.q21.options.shelter_desc',
        icon: 'volunteer_activism',
        set: [
          { path: 'EthicsProfile.adoptionPreference', op: 'set', value: 'shelter', valueType: 'enum' },
          { path: 'EthicsProfile.prefersRescue', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q22_LEGAL'
      },
      {
        id: 'breeder',
        labelKey: 'questionnaire.q21.options.breeder',
        descriptionKey: 'questionnaire.q21.options.breeder_desc',
        icon: 'verified_user',
        set: [
          { path: 'EthicsProfile.adoptionPreference', op: 'set', value: 'breeder', valueType: 'enum' },
          { path: 'EthicsProfile.ethicalBreederOnly', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q22_LEGAL'
      },
      {
        id: 'no_preference',
        labelKey: 'questionnaire.q21.options.no_preference',
        descriptionKey: 'questionnaire.q21.options.no_preference_desc',
        icon: 'help_outline',
        set: [
          { path: 'EthicsProfile.adoptionPreference', op: 'set', value: 'no_preference', valueType: 'enum' }
        ],
        next: 'Q22_LEGAL'
      }
    ]
  },

  // ============================================================================
  // Q22-Q24 - Legal & Contingency
  // ============================================================================
  {
    id: 'Q22_LEGAL',
    textKey: 'questionnaire.q22.text',
    hintKey: 'questionnaire.q22.hint',
    visualization: 'radio',
    options: [
      {
        id: 'ready',
        labelKey: 'questionnaire.q22.options.ready',
        set: [
          { path: 'LegalReadinessProfile.readiness', op: 'set', value: 'ready', valueType: 'enum' },
          { path: 'LegalReadinessProfile.checkedRegulations', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q23_LANDLORD'
      },
      {
        id: 'researching',
        labelKey: 'questionnaire.q22.options.researching',
        set: [
          { path: 'LegalReadinessProfile.readiness', op: 'set', value: 'researching', valueType: 'enum' }
        ],
        next: 'Q23_LANDLORD'
      },
      {
        id: 'not_started',
        labelKey: 'questionnaire.q22.options.not_started',
        set: [
          { path: 'LegalReadinessProfile.readiness', op: 'set', value: 'not_ready', valueType: 'enum' }
        ],
        next: 'Q23_LANDLORD'
      }
    ]
  },

  {
    id: 'Q23_LANDLORD',
    textKey: 'questionnaire.q23.text',
    showIf: "EnvironmentProfile.housingType == 'apartment_small' or EnvironmentProfile.housingType == 'apartment_large'",
    nextOnSkip: 'Q24_BACKUP',
    visualization: 'radio',
    options: [
      {
        id: 'yes',
        labelKey: 'questionnaire.q23.options.yes',
        set: [
          { path: 'LegalReadinessProfile.landlordApproval', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q24_BACKUP'
      },
      {
        id: 'need_to_ask',
        labelKey: 'questionnaire.q23.options.need_to_ask',
        set: [
          { path: 'LegalReadinessProfile.landlordApproval', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q24_BACKUP'
      },
      {
        id: 'owner',
        labelKey: 'questionnaire.q23.options.owner',
        set: [
          { path: 'LegalReadinessProfile.landlordApproval', op: 'set', value: 'not_applicable', valueType: 'string' }
        ],
        next: 'Q24_BACKUP'
      }
    ]
  },

  {
    id: 'Q24_BACKUP',
    textKey: 'questionnaire.q24.text',
    visualization: 'radio',
    options: [
      {
        id: 'yes',
        labelKey: 'questionnaire.q24.options.yes',
        set: [
          { path: 'ContingencyProfile.hasBackupCaretaker', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q25_VACATION'
      },
      {
        id: 'working_on_it',
        labelKey: 'questionnaire.q24.options.working_on_it',
        set: [
          { path: 'ContingencyProfile.hasBackupCaretaker', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q25_VACATION'
      },
      {
        id: 'no',
        labelKey: 'questionnaire.q24.options.no',
        set: [
          { path: 'ContingencyProfile.hasBackupCaretaker', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q25_VACATION'
      }
    ]
  },

  {
    id: 'Q25_VACATION',
    textKey: 'questionnaire.q25.text',
    visualization: 'cards',
    options: [
      {
        id: 'take_along',
        labelKey: 'questionnaire.q25.options.take_along',
        icon: 'luggage',
        set: [
          { path: 'ContingencyProfile.vacationPlan', op: 'set', value: 'take_along', valueType: 'enum' }
        ],
        next: 'Q26_COMMITMENT'
      },
      {
        id: 'pet_sitter',
        labelKey: 'questionnaire.q25.options.pet_sitter',
        icon: 'person',
        set: [
          { path: 'ContingencyProfile.vacationPlan', op: 'set', value: 'pet_sitter', valueType: 'enum' }
        ],
        next: 'Q26_COMMITMENT'
      },
      {
        id: 'boarding',
        labelKey: 'questionnaire.q25.options.boarding',
        icon: 'hotel',
        set: [
          { path: 'ContingencyProfile.vacationPlan', op: 'set', value: 'boarding', valueType: 'enum' }
        ],
        next: 'Q26_COMMITMENT'
      },
      {
        id: 'family',
        labelKey: 'questionnaire.q25.options.family',
        icon: 'family_restroom',
        set: [
          { path: 'ContingencyProfile.vacationPlan', op: 'set', value: 'family', valueType: 'enum' }
        ],
        next: 'Q26_COMMITMENT'
      }
    ]
  },

  {
    id: 'Q26_COMMITMENT',
    textKey: 'questionnaire.q26.text',
    hintKey: 'questionnaire.q26.hint',
    visualization: 'radio',
    options: [
      {
        id: 'yes',
        labelKey: 'questionnaire.q26.options.yes',
        set: [
          { path: 'ContingencyProfile.longTermCommitment', op: 'set', value: true, valueType: 'boolean' }
        ],
        next: 'Q27_SPECIES_CHOICE'
      },
      {
        id: 'thinking',
        labelKey: 'questionnaire.q26.options.thinking',
        set: [
          { path: 'ContingencyProfile.longTermCommitment', op: 'set', value: false, valueType: 'boolean' }
        ],
        next: 'Q27_SPECIES_CHOICE'
      }
    ]
  },

  // ============================================================================
  // Q27 - Species Selection (Routes to Modules)
  // ============================================================================
  {
    id: 'Q27_SPECIES_CHOICE',
    textKey: 'questionnaire.q27.text',
    hintKey: 'questionnaire.q27.hint',
    visualization: 'cards',
    options: [
      {
        id: 'dog',
        labelKey: 'questionnaire.q27.options.dog',
        descriptionKey: 'questionnaire.q27.options.dog_desc',
        icon: '🐕',
        set: [
          { path: 'Route.selectedSpecies', op: 'set', value: 'dog', valueType: 'string' },
          { path: 'Route.selectedModule', op: 'set', value: 'DOG', valueType: 'string' }
        ],
        next: 'module:COMPANION'
      },
      {
        id: 'cat',
        labelKey: 'questionnaire.q27.options.cat',
        descriptionKey: 'questionnaire.q27.options.cat_desc',
        icon: '🐈',
        set: [
          { path: 'Route.selectedSpecies', op: 'set', value: 'cat', valueType: 'string' },
          { path: 'Route.selectedModule', op: 'set', value: 'CAT', valueType: 'string' }
        ],
        next: 'module:COMPANION'
      },
      {
        id: 'small_mammal',
        labelKey: 'questionnaire.q27.options.small_mammal',
        descriptionKey: 'questionnaire.q27.options.small_mammal_desc',
        icon: '🐹',
        set: [
          { path: 'Route.selectedSpecies', op: 'set', value: 'small_mammal', valueType: 'string' },
          { path: 'Route.selectedModule', op: 'set', value: 'SMALL_MAMMAL', valueType: 'string' }
        ],
        next: 'module:COMPANION'
      },
      {
        id: 'bird',
        labelKey: 'questionnaire.q27.options.bird',
        descriptionKey: 'questionnaire.q27.options.bird_desc',
        icon: '🦜',
        set: [
          { path: 'Route.selectedSpecies', op: 'set', value: 'bird', valueType: 'string' },
          { path: 'Route.selectedModule', op: 'set', value: 'BIRD', valueType: 'string' }
        ],
        next: 'module:COMPANION'
      },
      {
        id: 'fish',
        labelKey: 'questionnaire.q27.options.fish',
        descriptionKey: 'questionnaire.q27.options.fish_desc',
        icon: '🐠',
        set: [
          { path: 'Route.selectedSpecies', op: 'set', value: 'fish', valueType: 'string' },
          { path: 'Route.selectedModule', op: 'set', value: 'FISH', valueType: 'string' }
        ],
        next: 'leaf:FINAL_RECOMMENDATION'
      },
      {
        id: 'unsure',
        labelKey: 'questionnaire.q27.options.unsure',
        descriptionKey: 'questionnaire.q27.options.unsure_desc',
        icon: '❓',
        set: [
          { path: 'Route.selectedSpecies', op: 'set', value: 'unsure', valueType: 'string' }
        ],
        next: 'module:COMPANION'
      }
    ]
  }
];

// ============================================================================
// Exported Maps for O(1) Lookup
// ============================================================================

export const CORE_QUESTIONS_MAP: QuestionsMap = CORE_QUESTIONS.reduce(
  (acc, q) => {
    acc[q.id] = q;
    return acc;
  },
  {} as QuestionsMap
);

export const CORE_QUESTIONS_ORDER: string[] = CORE_QUESTIONS.map(q => q.id);
