/**
 * Flow Engine Service Tests
 *
 * Tests critical functionality:
 * - Navigation (forward, back)
 * - showIf evaluation with nextOnSkip
 * - History tracking
 * - Answer invalidation on back
 *
 * @version 1.1
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FlowEngineService } from './flow-engine.service';
import { ProfileManagerService } from './profile-manager.service';
import { ExpressionParserService } from './expression-parser.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ExperimentService } from '../../../core/services/experiment.service';
import { AuthService } from '../../../core/services/auth.service';

import { Question, QuestionsMap, ModulesMap, LeavesMap } from '../models/question.models';

describe('FlowEngineService', () => {
  let service: FlowEngineService;
  let profileManager: ProfileManagerService;

  // Test data - minimal flow for testing
  const TEST_QUESTIONS: QuestionsMap = {
    'Q01': {
      id: 'Q01',
      textKey: 'test.q01',
      options: [
        {
          id: 'a',
          labelKey: 'test.q01.a',
          set: [{ path: 'LifestyleProfile.dailyTime', op: 'set', value: 'high', valueType: 'enum' }],
          next: 'Q02'
        },
        {
          id: 'b',
          labelKey: 'test.q01.b',
          set: [{ path: 'LifestyleProfile.dailyTime', op: 'set', value: 'low', valueType: 'enum' }],
          next: 'Q03'
        }
      ]
    },
    'Q02': {
      id: 'Q02',
      textKey: 'test.q02',
      showIf: "LifestyleProfile.dailyTime == 'high'",
      nextOnSkip: 'Q03',
      options: [
        {
          id: 'a',
          labelKey: 'test.q02.a',
          set: [],
          next: 'Q03'
        }
      ]
    },
    'Q03': {
      id: 'Q03',
      textKey: 'test.q03',
      options: [
        {
          id: 'a',
          labelKey: 'test.q03.a',
          set: [],
          next: 'leaf:END'
        }
      ]
    }
  };

  const TEST_MODULES: ModulesMap = {};

  const TEST_LEAVES: LeavesMap = {
    'END': { id: 'END', type: 'end' }
  };

  const TEST_ORDER = ['Q01', 'Q02', 'Q03'];

  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FlowEngineService,
        ProfileManagerService,
        ExpressionParserService,
        AnalyticsService,
        ExperimentService,
        AuthService
      ]
    });

    service = TestBed.inject(FlowEngineService);
    profileManager = TestBed.inject(ProfileManagerService);

    // Load test data
    service.loadQuestionData(TEST_QUESTIONS, TEST_MODULES, TEST_LEAVES, TEST_ORDER);
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start at entry question', async () => {
      await service.start('Q01');
      expect(service.currentQuestion()?.id).toBe('Q01');
    });
  });

  describe('Forward Navigation', () => {
    it('should navigate to next question on option select', async () => {
      await service.start('Q01');

      const option = TEST_QUESTIONS['Q01'].options[0]; // next: Q02
      await service.selectOption(option);

      expect(service.currentQuestion()?.id).toBe('Q02');
    });

    it('should apply set actions to profile', async () => {
      await service.start('Q01');

      const option = TEST_QUESTIONS['Q01'].options[0]; // sets dailyTime = 'high'
      await service.selectOption(option);

      const profile = profileManager.getProfile();
      expect(profile.LifestyleProfile.dailyTime).toBe('high');
    });

    it('should record answer in history', async () => {
      await service.start('Q01');

      const option = TEST_QUESTIONS['Q01'].options[0];
      await service.selectOption(option);

      expect(service.hasAnswer('Q01')).toBeTrue();
      expect(service.getAnswer('Q01')?.optionId).toBe('a');
    });
  });

  describe('showIf and nextOnSkip', () => {
    it('should show question when showIf is true', async () => {
      await service.start('Q01');

      // Select option that sets dailyTime = 'high'
      const optionA = TEST_QUESTIONS['Q01'].options[0];
      await service.selectOption(optionA);

      // Q02 has showIf: dailyTime == 'high' - should show
      expect(service.currentQuestion()?.id).toBe('Q02');
    });

    it('should skip to nextOnSkip when showIf is false', async () => {
      await service.start('Q01');

      // Select option that sets dailyTime = 'low'
      const optionB = TEST_QUESTIONS['Q01'].options[1];
      await service.selectOption(optionB);

      // Q02 has showIf: dailyTime == 'high' - should skip to Q03
      expect(service.currentQuestion()?.id).toBe('Q03');
    });
  });

  describe('Back Navigation', () => {
    it('should allow going back', async () => {
      await service.start('Q01');
      expect(service.canGoBack()).toBeFalse();

      await service.selectOption(TEST_QUESTIONS['Q01'].options[0]);
      expect(service.canGoBack()).toBeTrue();
    });

    it('should return to previous question on goBack', async () => {
      await service.start('Q01');
      await service.selectOption(TEST_QUESTIONS['Q01'].options[0]);

      expect(service.currentQuestion()?.id).toBe('Q02');

      service.goBack();

      expect(service.currentQuestion()?.id).toBe('Q01');
    });

    it('should remove answer when going back', async () => {
      await service.start('Q01');
      await service.selectOption(TEST_QUESTIONS['Q01'].options[0]);

      expect(service.hasAnswer('Q01')).toBeTrue();

      service.goBack();

      expect(service.hasAnswer('Q01')).toBeFalse();
    });
  });

  describe('Leaf Navigation', () => {
    it('should complete when reaching a leaf', async () => {
      await service.start('Q01');
      await service.selectOption(TEST_QUESTIONS['Q01'].options[1]); // -> Q03 (skips Q02)
      await service.selectOption(TEST_QUESTIONS['Q03'].options[0]); // -> leaf:END

      expect(service.isComplete()).toBeTrue();
      expect(service.currentLeaf()?.id).toBe('END');
    });
  });
});

describe('ExpressionParserService', () => {
  let parser: ExpressionParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpressionParserService]
    });
    parser = TestBed.inject(ExpressionParserService);
  });

  it('should evaluate simple equality', () => {
    const profile = createMockProfile({ dailyTime: 'high' });
    expect(parser.evaluate("LifestyleProfile.dailyTime == 'high'", profile)).toBeTrue();
    expect(parser.evaluate("LifestyleProfile.dailyTime == 'low'", profile)).toBeFalse();
  });

  it('should evaluate numeric comparisons', () => {
    const profile = createMockProfile({ awayHoursPerDay: 8 });
    expect(parser.evaluate("LifestyleProfile.awayHoursPerDay >= 8", profile)).toBeTrue();
    expect(parser.evaluate("LifestyleProfile.awayHoursPerDay < 8", profile)).toBeFalse();
  });

  it('should evaluate logical AND', () => {
    const profile = createMockProfile({ dailyTime: 'high', awayHoursPerDay: 4 });
    expect(parser.evaluate(
      "LifestyleProfile.dailyTime == 'high' and LifestyleProfile.awayHoursPerDay < 6",
      profile
    )).toBeTrue();
  });

  it('should evaluate logical OR', () => {
    const profile = createMockProfile({ dailyTime: 'low' });
    expect(parser.evaluate(
      "LifestyleProfile.dailyTime == 'high' or LifestyleProfile.dailyTime == 'low'",
      profile
    )).toBeTrue();
  });

  it('should return true for empty expression', () => {
    const profile = createMockProfile({});
    expect(parser.evaluate('', profile)).toBeTrue();
    expect(parser.evaluate(undefined, profile)).toBeTrue();
  });

  it('should block non-whitelisted paths', () => {
    const profile = createMockProfile({});
    // Should not crash, just return true (default)
    expect(parser.evaluate("SomeRandomProfile.field == 'value'", profile)).toBeTrue();
  });
});

// Helper to create mock profile
function createMockProfile(lifestyle: Partial<{
  dailyTime: string;
  awayHoursPerDay: number;
  experience: string;
}>): any {
  return {
    schemaVersion: 1,
    questionnaireVersion: '1.1',
    variant: 'A',
    startedAt: new Date().toISOString(),
    lastQuestionId: 'Q01',
    JurisdictionProfile: { country: '', allowedSpecies: [], bannedSpecies: [], requiredPermits: [] },
    LifestyleProfile: {
      dailyTime: lifestyle.dailyTime || 'medium',
      experience: lifestyle.experience || 'none',
      activityLevel: 'moderate',
      awayHoursPerDay: lifestyle.awayHoursPerDay ?? 8,
      worksFromHome: false,
      frequentTravel: false,
      hasOtherPets: false
    },
    EnvironmentProfile: { housingType: 'apartment_large', outdoorAccess: 'none', floors: 1, hasElevator: false, noiseRestrictions: false, climate: 'temperate' },
    FinanceProfile: { monthlyBudget: 'medium', emergencyFundAvailable: false, willingToInsure: false },
    RelationshipProfile: { motivation: 'find_ideal', familyComposition: 'single', householdAgreement: true, primaryCaretaker: 'user' },
    CareRoutineProfile: { groomingWillingness: 'weekly', dailyWalks: true, willingToTrain: true, specialDietCapable: false },
    HealthProfile: { allergyStatus: 'none', physicalLimitations: false, canHandleLargeAnimals: true, needsSeniorFriendly: false },
    LegalReadinessProfile: { readiness: 'researching', checkedRegulations: false, landlordApproval: 'not_applicable', hoaApproval: 'not_applicable' },
    EthicsProfile: { adoptionPreference: 'no_preference', avoidPuppyMills: true, prefersRescue: false, ethicalBreederOnly: false },
    ContingencyProfile: { hasBackupCaretaker: false, vacationPlan: 'not_planned', emergencyPlan: 'not_planned', longTermCommitment: false },
    Route: { pathTaken: [], completedModules: [] },
    SpeciesPreferences: {}
  };
}
