/**
 * UserPreferenceProfile Models for Questionnaire v1.1
 *
 * Structured profile with 14 global sections that get populated
 * as the user answers questions. Used for matching engine.
 *
 * Key features:
 * - Schema versioning for migrations
 * - Variant tracking for A/B/C testing
 * - Route for conditional routing decisions
 *
 * @version 1.1
 */

import { QuestionnaireVariant } from '../../../core/models/analytics.models';

// ============================================================================
// Enum Types
// ============================================================================

export type DailyTimeAvailable = 'minimal' | 'low' | 'medium' | 'high' | 'flexible';
export type ExperienceLevel = 'none' | 'some' | 'experienced' | 'professional';
export type HousingType = 'apartment_small' | 'apartment_large' | 'house_no_garden' | 'house_with_garden' | 'rural' | 'farm';
export type OutdoorAccess = 'none' | 'balcony' | 'shared_garden' | 'private_garden' | 'large_property';
export type BudgetRange = 'low' | 'medium' | 'high' | 'unlimited';
export type FamilyComposition = 'single' | 'couple' | 'family_young_kids' | 'family_teens' | 'seniors' | 'multi_generation';
export type Motivation = 'find_ideal' | 'register_pet' | 'curiosity' | 'gift' | 'therapy';
export type GroomingWillingness = 'minimal' | 'weekly' | 'daily' | 'professional';
export type ActivityLevel = 'sedentary' | 'moderate' | 'active' | 'very_active' | 'athletic';
export type AllergyStatus = 'none' | 'mild' | 'moderate' | 'severe' | 'unknown';
export type AdoptionPreference = 'breeder' | 'shelter' | 'rescue' | 'no_preference';
export type LegalReadiness = 'not_ready' | 'researching' | 'ready' | 'already_compliant';

// ============================================================================
// Profile Sections
// ============================================================================

/**
 * Jurisdiction and legal requirements based on location
 */
export interface JurisdictionProfile {
  country: string;
  region?: string;
  city?: string;
  /** Species allowed in this jurisdiction */
  allowedSpecies: string[];
  /** Species banned in this jurisdiction */
  bannedSpecies: string[];
  /** Special permits required */
  requiredPermits: string[];
}

/**
 * User's lifestyle and daily routine
 */
export interface LifestyleProfile {
  dailyTime: DailyTimeAvailable;
  experience: ExperienceLevel;
  activityLevel: ActivityLevel;
  /** Typical away-from-home hours per day */
  awayHoursPerDay: number;
  /** Works from home */
  worksFromHome: boolean;
  /** Travels frequently */
  frequentTravel: boolean;
  /** Has other pets */
  hasOtherPets: boolean;
  /** Types of other pets */
  otherPetTypes?: string[];
}

/**
 * Living environment details
 */
export interface EnvironmentProfile {
  housingType: HousingType;
  outdoorAccess: OutdoorAccess;
  /** Square meters of living space */
  livingSpaceM2?: number;
  /** Number of floors */
  floors: number;
  /** Has elevator */
  hasElevator: boolean;
  /** Noise restrictions (apartment rules) */
  noiseRestrictions: boolean;
  /** Climate type */
  climate: 'cold' | 'temperate' | 'warm' | 'hot' | 'variable';
}

/**
 * Financial capacity for pet care
 */
export interface FinanceProfile {
  monthlyBudget: BudgetRange;
  /** Estimated monthly amount in EUR */
  monthlyAmountEur?: number;
  /** Can afford emergency vet care */
  emergencyFundAvailable: boolean;
  /** Willing to get pet insurance */
  willingToInsure: boolean;
}

/**
 * Family and relationship context
 */
export interface RelationshipProfile {
  motivation: Motivation;
  familyComposition: FamilyComposition;
  /** Ages of children in household */
  childrenAges?: number[];
  /** All household members agree */
  householdAgreement: boolean;
  /** Primary caretaker */
  primaryCaretaker: 'user' | 'partner' | 'shared' | 'child' | 'other';
}

/**
 * Willingness and ability to provide care
 */
export interface CareRoutineProfile {
  groomingWillingness: GroomingWillingness;
  /** Willing to do daily walks */
  dailyWalks: boolean;
  /** Can handle training */
  willingToTrain: boolean;
  /** Hours per week for training */
  trainingHoursPerWeek?: number;
  /** Can handle special diets */
  specialDietCapable: boolean;
}

/**
 * Health considerations
 */
export interface HealthProfile {
  allergyStatus: AllergyStatus;
  /** Specific allergens */
  allergens?: string[];
  /** Physical limitations */
  physicalLimitations: boolean;
  /** Can handle large/strong animals */
  canHandleLargeAnimals: boolean;
  /** Senior-friendly needed */
  needsSeniorFriendly: boolean;
}

/**
 * Legal preparedness
 */
export interface LegalReadinessProfile {
  readiness: LegalReadiness;
  /** Has checked local regulations */
  checkedRegulations: boolean;
  /** Landlord allows pets */
  landlordApproval: boolean | 'not_applicable';
  /** HOA allows pets */
  hoaApproval: boolean | 'not_applicable';
}

/**
 * Ethical preferences
 */
export interface EthicsProfile {
  adoptionPreference: AdoptionPreference;
  /** Avoid puppy mills */
  avoidPuppyMills: boolean;
  /** Prefers rescue/mixed breeds */
  prefersRescue: boolean;
  /** Supports ethical breeders only */
  ethicalBreederOnly: boolean;
}

/**
 * Backup plans and contingencies
 */
export interface ContingencyProfile {
  /** Has backup caretaker */
  hasBackupCaretaker: boolean;
  /** Plan for vacations */
  vacationPlan: 'take_along' | 'pet_sitter' | 'boarding' | 'family' | 'not_planned';
  /** Plan if can't keep pet */
  emergencyPlan: 'family' | 'friends' | 'shelter' | 'not_planned';
  /** Long-term commitment acknowledged */
  longTermCommitment: boolean;
}

/**
 * Routing decisions (internal use)
 */
export interface RouteProfile {
  /** Selected species for deep-dive */
  selectedSpecies?: string;
  /** Selected module to enter */
  selectedModule?: string;
  /** Path taken through questionnaire */
  pathTaken: string[];
  /** Modules completed */
  completedModules: string[];
}

/**
 * Species-specific preferences (filled after species selection)
 */
export interface SpeciesPreferences {
  /** For dogs: size preference */
  sizePreference?: 'small' | 'medium' | 'large' | 'giant' | 'no_preference';
  /** For dogs: coat type preference */
  coatPreference?: 'short' | 'medium' | 'long' | 'wire' | 'hairless' | 'no_preference';
  /** For dogs: energy level preference */
  energyPreference?: 'low' | 'medium' | 'high' | 'no_preference';
  /** For cats: indoor/outdoor preference */
  indoorOutdoor?: 'indoor_only' | 'outdoor_access' | 'no_preference';
  /** For small mammals: species preference */
  smallMammalType?: string;
  /** For birds: noise tolerance */
  noiseTolerance?: 'silent' | 'low' | 'medium' | 'high';
  /** For reptiles: handling frequency */
  handlingFrequency?: 'minimal' | 'regular' | 'frequent';
  /** For fish: tank complexity */
  tankComplexity?: 'simple' | 'moderate' | 'advanced';
}

/**
 * Matching scores (computed after questionnaire)
 */
export interface MatchingScores {
  /** Overall compatibility score per species */
  speciesScores: Record<string, number>;
  /** Top breed matches with scores */
  breedMatches: Array<{
    breedId: string;
    score: number;
    reasons: string[];
    tradeoffs: string[];
  }>;
  /** Computed at timestamp */
  computedAt?: string;
}

// ============================================================================
// Main Profile
// ============================================================================

/**
 * Complete user preference profile
 */
export interface UserPreferenceProfile {
  // Metadata
  /** Schema version for migrations */
  schemaVersion: number;
  /** Questionnaire version (e.g. "1.1") */
  questionnaireVersion: string;
  /** A/B/C experiment variant */
  variant: QuestionnaireVariant;
  /** When questionnaire was started */
  startedAt: string;
  /** When questionnaire was completed */
  completedAt?: string;
  /** Last answered question ID */
  lastQuestionId: string;

  // 14 Global Profiles
  JurisdictionProfile: JurisdictionProfile;
  LifestyleProfile: LifestyleProfile;
  EnvironmentProfile: EnvironmentProfile;
  FinanceProfile: FinanceProfile;
  RelationshipProfile: RelationshipProfile;
  CareRoutineProfile: CareRoutineProfile;
  HealthProfile: HealthProfile;
  LegalReadinessProfile: LegalReadinessProfile;
  EthicsProfile: EthicsProfile;
  ContingencyProfile: ContingencyProfile;
  Route: RouteProfile;

  // Species-specific
  SpeciesPreferences: SpeciesPreferences;

  // Matching results
  MatchingScores?: MatchingScores;
}

/**
 * Default empty profile factory
 */
export function createEmptyProfile(
  variant: QuestionnaireVariant,
  questionnaireVersion: string = '1.1'
): UserPreferenceProfile {
  return {
    schemaVersion: 1,
    questionnaireVersion,
    variant,
    startedAt: new Date().toISOString(),
    lastQuestionId: 'Q00_ENTRY',

    JurisdictionProfile: {
      country: '',
      allowedSpecies: [],
      bannedSpecies: [],
      requiredPermits: []
    },

    LifestyleProfile: {
      dailyTime: 'medium',
      experience: 'none',
      activityLevel: 'moderate',
      awayHoursPerDay: 8,
      worksFromHome: false,
      frequentTravel: false,
      hasOtherPets: false
    },

    EnvironmentProfile: {
      housingType: 'apartment_large',
      outdoorAccess: 'none',
      floors: 1,
      hasElevator: false,
      noiseRestrictions: false,
      climate: 'temperate'
    },

    FinanceProfile: {
      monthlyBudget: 'medium',
      emergencyFundAvailable: false,
      willingToInsure: false
    },

    RelationshipProfile: {
      motivation: 'find_ideal',
      familyComposition: 'single',
      householdAgreement: true,
      primaryCaretaker: 'user'
    },

    CareRoutineProfile: {
      groomingWillingness: 'weekly',
      dailyWalks: true,
      willingToTrain: true,
      specialDietCapable: false
    },

    HealthProfile: {
      allergyStatus: 'none',
      physicalLimitations: false,
      canHandleLargeAnimals: true,
      needsSeniorFriendly: false
    },

    LegalReadinessProfile: {
      readiness: 'researching',
      checkedRegulations: false,
      landlordApproval: 'not_applicable',
      hoaApproval: 'not_applicable'
    },

    EthicsProfile: {
      adoptionPreference: 'no_preference',
      avoidPuppyMills: true,
      prefersRescue: false,
      ethicalBreederOnly: false
    },

    ContingencyProfile: {
      hasBackupCaretaker: false,
      vacationPlan: 'not_planned',
      emergencyPlan: 'not_planned',
      longTermCommitment: false
    },

    Route: {
      pathTaken: [],
      completedModules: []
    },

    SpeciesPreferences: {}
  };
}

/**
 * Profile keys that can be accessed in showIf expressions
 */
export const ALLOWED_PROFILE_ROOTS = [
  'JurisdictionProfile',
  'LifestyleProfile',
  'EnvironmentProfile',
  'FinanceProfile',
  'RelationshipProfile',
  'CareRoutineProfile',
  'HealthProfile',
  'LegalReadinessProfile',
  'EthicsProfile',
  'ContingencyProfile',
  'Route',
  'SpeciesPreferences'
] as const;

export type AllowedProfileRoot = typeof ALLOWED_PROFILE_ROOTS[number];
