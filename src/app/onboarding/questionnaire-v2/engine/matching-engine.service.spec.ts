/**
 * Matching Engine Service Tests
 *
 * Tests:
 * - Hard constraint filtering
 * - Rule-based scoring
 * - Match reasons generation
 * - Tradeoff detection
 *
 * @version 1.1
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MatchingEngineService, BreedCandidate, BreedAttributes } from './matching-engine.service';
import { EmbeddingService } from './embedding.service';
import { UserPreferenceProfile, createEmptyProfile } from '../models/profile.models';

describe('MatchingEngineService', () => {
  let service: MatchingEngineService;
  let httpMock: HttpTestingController;
  let mockEmbeddingService: jasmine.SpyObj<EmbeddingService>;

  // Test breed data
  const TEST_BREEDS: BreedCandidate[] = [
    {
      id: 'dog-labrador',
      name: 'Labrador Retriever',
      species: 'dog',
      description: 'Friendly, energetic dog great with families',
      attributes: {
        size: 'large',
        energyLevel: 'high',
        groomingNeeds: 'medium',
        trainability: 'high',
        goodWithChildren: true,
        goodWithOtherPets: true,
        apartmentFriendly: false,
        exerciseNeeds: 'high',
        monthlyExpense: 'medium'
      }
    },
    {
      id: 'dog-chihuahua',
      name: 'Chihuahua',
      species: 'dog',
      description: 'Tiny dog perfect for apartments',
      attributes: {
        size: 'tiny',
        energyLevel: 'medium',
        groomingNeeds: 'low',
        trainability: 'medium',
        goodWithChildren: false,
        goodWithOtherPets: true,
        apartmentFriendly: true,
        exerciseNeeds: 'low',
        monthlyExpense: 'low'
      }
    },
    {
      id: 'dog-great-dane',
      name: 'Great Dane',
      species: 'dog',
      description: 'Giant gentle dog',
      attributes: {
        size: 'giant',
        energyLevel: 'medium',
        groomingNeeds: 'low',
        trainability: 'medium',
        goodWithChildren: true,
        goodWithOtherPets: true,
        apartmentFriendly: false,
        exerciseNeeds: 'medium',
        monthlyExpense: 'high'
      }
    },
    {
      id: 'dog-cavalier',
      name: 'Cavalier King Charles Spaniel',
      species: 'dog',
      description: 'Affectionate apartment-friendly dog',
      attributes: {
        size: 'small',
        energyLevel: 'low',
        groomingNeeds: 'medium',
        trainability: 'high',
        goodWithChildren: true,
        goodWithOtherPets: true,
        apartmentFriendly: true,
        exerciseNeeds: 'low',
        monthlyExpense: 'medium'
      }
    },
    {
      id: 'dog-border-collie',
      name: 'Border Collie',
      species: 'dog',
      description: 'Highly energetic and intelligent herding dog',
      attributes: {
        size: 'medium',
        energyLevel: 'very_high',
        groomingNeeds: 'medium',
        trainability: 'high',
        goodWithChildren: true,
        goodWithOtherPets: true,
        apartmentFriendly: false,
        exerciseNeeds: 'high',
        monthlyExpense: 'medium'
      }
    }
  ];

  beforeEach(() => {
    // Mock EmbeddingService - disable AI matching
    mockEmbeddingService = jasmine.createSpyObj('EmbeddingService', [
      'loadModel',
      'embedProfile',
      'embedBreed',
      'cosineSimilarity',
      'unload'
    ]);
    mockEmbeddingService.loadModel.and.returnValue(Promise.resolve(false));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MatchingEngineService,
        { provide: EmbeddingService, useValue: mockEmbeddingService }
      ]
    });

    service = TestBed.inject(MatchingEngineService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.reset();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start with idle state', () => {
      expect(service.state().status).toBe('idle');
      expect(service.results().length).toBe(0);
    });
  });

  describe('Hard Constraints - Apartment Filter', () => {
    it('should filter out giant dogs for small apartments', async () => {
      const profile = createTestProfile({
        EnvironmentProfile: { housingType: 'apartment_small' }
      });

      const matchPromise = service.computeMatchesLocal(profile);

      // Mock API call with test breeds
      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      const results = await matchPromise;

      // Giant breeds should be filtered out
      const ids = results.map(r => r.breed.id);
      expect(ids).not.toContain('dog-great-dane');

      // Apartment-friendly breeds should remain
      expect(ids).toContain('dog-chihuahua');
      expect(ids).toContain('dog-cavalier');
    });

    it('should filter out non-apartment-friendly dogs for apartments', async () => {
      const profile = createTestProfile({
        EnvironmentProfile: { housingType: 'apartment_large' }
      });

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      const results = await matchPromise;
      const ids = results.map(r => r.breed.id);

      // Non apartment-friendly dogs filtered
      expect(ids).not.toContain('dog-labrador');
      expect(ids).not.toContain('dog-border-collie');
    });
  });

  describe('Hard Constraints - Time/Energy Filter', () => {
    it('should filter out very high energy dogs for low time users', async () => {
      const profile = createTestProfile({
        LifestyleProfile: { dailyTime: 'low' }
      });

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      const results = await matchPromise;
      const ids = results.map(r => r.breed.id);

      // Very high energy breeds filtered
      expect(ids).not.toContain('dog-border-collie');

      // Low energy breeds remain
      expect(ids).toContain('dog-cavalier');
    });
  });

  describe('Hard Constraints - Budget Filter', () => {
    it('should filter out high expense breeds for low budget', async () => {
      const profile = createTestProfile({
        FinanceProfile: { monthlyBudget: 'low' }
      });

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      const results = await matchPromise;
      const ids = results.map(r => r.breed.id);

      // High expense and giant breeds filtered
      expect(ids).not.toContain('dog-great-dane');

      // Low expense breeds remain
      expect(ids).toContain('dog-chihuahua');
    });
  });

  describe('Hard Constraints - Children Safety', () => {
    it('should filter out non-child-friendly breeds when family has young kids', async () => {
      const profile = createTestProfile({
        RelationshipProfile: { familyComposition: 'family_young_kids' }
      });

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      const results = await matchPromise;
      const ids = results.map(r => r.breed.id);

      // Non child-friendly filtered
      expect(ids).not.toContain('dog-chihuahua');

      // Child-friendly breeds remain
      expect(ids).toContain('dog-labrador');
      expect(ids).toContain('dog-cavalier');
    });
  });

  describe('Hard Constraints - Other Pets', () => {
    it('should filter out breeds not good with other pets', async () => {
      const profile = createTestProfile({
        LifestyleProfile: { hasOtherPets: true }
      });

      // Add a breed that's not good with other pets
      const breedsWithBadPet = [
        ...TEST_BREEDS,
        {
          id: 'dog-akita',
          name: 'Akita',
          species: 'dog',
          description: 'Dominant dog',
          attributes: {
            size: 'large',
            goodWithOtherPets: false
          } as BreedAttributes
        }
      ];

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(breedsWithBadPet);

      const results = await matchPromise;
      const ids = results.map(r => r.breed.id);

      expect(ids).not.toContain('dog-akita');
    });
  });

  describe('Rule Scoring', () => {
    it('should give higher scores to matching energy levels', async () => {
      const profile = createTestProfile({
        LifestyleProfile: { dailyTime: 'high' },
        EnvironmentProfile: { housingType: 'house_with_garden' }
      });

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      const results = await matchPromise;

      // Labrador (high energy) should score well for high time user
      const labrador = results.find(r => r.breed.id === 'dog-labrador');
      const cavalier = results.find(r => r.breed.id === 'dog-cavalier');

      expect(labrador).toBeDefined();
      expect(cavalier).toBeDefined();

      // High energy dog should score better for high time user
      expect(labrador!.ruleScore).toBeGreaterThan(cavalier!.ruleScore);
    });

    it('should give bonus for trainability to beginners', async () => {
      const profile = createTestProfile({
        LifestyleProfile: { experience: 'none' },
        EnvironmentProfile: { housingType: 'house_with_garden' }
      });

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      const results = await matchPromise;

      // High trainability breeds should score better for beginners
      const labrador = results.find(r => r.breed.id === 'dog-labrador');
      expect(labrador!.ruleScore).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Match Reasons', () => {
    it('should generate apartment-friendly reason', async () => {
      const profile = createTestProfile({
        EnvironmentProfile: { housingType: 'apartment_large' }
      });

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      const results = await matchPromise;

      const cavalier = results.find(r => r.breed.id === 'dog-cavalier');
      expect(cavalier).toBeDefined();

      const reasons = cavalier!.matchReasons;
      const apartmentReason = reasons.find(r => r.category === 'Abitazione');
      expect(apartmentReason).toBeDefined();
      expect(apartmentReason!.impact).toBe('positive');
    });

    it('should generate child-friendly reason', async () => {
      const profile = createTestProfile({
        RelationshipProfile: { familyComposition: 'family_young_kids' }
      });

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      const results = await matchPromise;

      const labrador = results.find(r => r.breed.id === 'dog-labrador');
      const reasons = labrador?.matchReasons || [];
      const familyReason = reasons.find(r => r.category === 'Famiglia');
      expect(familyReason).toBeDefined();
    });
  });

  describe('Tradeoffs', () => {
    it('should generate shedding tradeoff', async () => {
      const profile = createTestProfile({});

      // Add high shedding breed
      const breedsWithShedding = [
        ...TEST_BREEDS,
        {
          id: 'dog-husky',
          name: 'Siberian Husky',
          species: 'dog',
          description: 'Beautiful but sheds a lot',
          attributes: {
            size: 'medium',
            shedding: 'high',
            apartmentFriendly: true
          } as BreedAttributes
        }
      ];

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(breedsWithShedding);

      const results = await matchPromise;

      const husky = results.find(r => r.breed.id === 'dog-husky');
      expect(husky).toBeDefined();

      const tradeoffs = husky!.tradeoffs;
      const sheddingTradeoff = tradeoffs.find(t => t.aspect === 'Pelo');
      expect(sheddingTradeoff).toBeDefined();
    });

    it('should generate barking tradeoff for apartment users', async () => {
      const profile = createTestProfile({
        EnvironmentProfile: { housingType: 'apartment_large' }
      });

      const breedsWithBarking = [
        {
          id: 'dog-beagle',
          name: 'Beagle',
          species: 'dog',
          description: 'Friendly but loud',
          attributes: {
            size: 'medium',
            barkingLevel: 'high',
            apartmentFriendly: true
          } as BreedAttributes
        }
      ];

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(breedsWithBarking);

      const results = await matchPromise;

      const beagle = results.find(r => r.breed.id === 'dog-beagle');
      expect(beagle).toBeDefined();

      const tradeoffs = beagle!.tradeoffs;
      const noiseTradeoff = tradeoffs.find(t => t.aspect === 'Rumore');
      expect(noiseTradeoff).toBeDefined();
      expect(noiseTradeoff!.severity).toBe('high');
    });
  });

  describe('State Management', () => {
    it('should update state during processing', async () => {
      const profile = createTestProfile({});
      const states: string[] = [];

      // Subscribe to state changes
      const subscription = setInterval(() => {
        states.push(service.state().status);
      }, 10);

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      await matchPromise;

      clearInterval(subscription);

      // Should have gone through loading, filtering, scoring, done
      expect(service.state().status).toBe('done');
    });

    it('should provide top results', async () => {
      const profile = createTestProfile({
        EnvironmentProfile: { housingType: 'house_with_garden' }
      });

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      await matchPromise;

      const top = service.topResults();
      expect(top.length).toBeLessThanOrEqual(3);
    });

    it('should reset state', async () => {
      const profile = createTestProfile({});

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.flush(TEST_BREEDS);

      await matchPromise;

      expect(service.results().length).toBeGreaterThan(0);

      service.reset();

      expect(service.results().length).toBe(0);
      expect(service.state().status).toBe('idle');
    });
  });

  describe('Error Handling', () => {
    it('should handle API error gracefully', async () => {
      const profile = createTestProfile({});

      const matchPromise = service.computeMatchesLocal(profile);

      const req = httpMock.expectOne(req => req.url.includes('/catalogs/breeds'));
      req.error(new ProgressEvent('error'));

      const results = await matchPromise;

      // Should fall back to local breeds
      expect(results.length).toBeGreaterThan(0);
    });
  });
});

// Helper to create test profile with overrides
function createTestProfile(overrides: Partial<{
  LifestyleProfile: Partial<UserPreferenceProfile['LifestyleProfile']>;
  EnvironmentProfile: Partial<UserPreferenceProfile['EnvironmentProfile']>;
  FinanceProfile: Partial<UserPreferenceProfile['FinanceProfile']>;
  RelationshipProfile: Partial<UserPreferenceProfile['RelationshipProfile']>;
  CareRoutineProfile: Partial<UserPreferenceProfile['CareRoutineProfile']>;
}>): UserPreferenceProfile {
  const base = createEmptyProfile('A', '1.1');

  return {
    ...base,
    LifestyleProfile: {
      ...base.LifestyleProfile,
      ...overrides.LifestyleProfile
    },
    EnvironmentProfile: {
      ...base.EnvironmentProfile,
      ...overrides.EnvironmentProfile
    },
    FinanceProfile: {
      ...base.FinanceProfile,
      ...overrides.FinanceProfile
    },
    RelationshipProfile: {
      ...base.RelationshipProfile,
      ...overrides.RelationshipProfile
    },
    CareRoutineProfile: {
      ...base.CareRoutineProfile,
      ...overrides.CareRoutineProfile
    }
  };
}
