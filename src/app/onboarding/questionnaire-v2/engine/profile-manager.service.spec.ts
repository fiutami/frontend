/**
 * Profile Manager Service Tests
 *
 * Tests SetAction operations (set, inc, push, toggle, merge)
 * and profile persistence.
 *
 * @version 1.1
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProfileManagerService } from './profile-manager.service';
import { ExperimentService } from '../../../core/services/experiment.service';
import { AuthService } from '../../../core/services/auth.service';
import { SetAction } from '../models/question.models';
import { UserPreferenceProfile } from '../models/profile.models';

describe('ProfileManagerService', () => {
  let service: ProfileManagerService;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockExperimentService: jasmine.SpyObj<ExperimentService>;

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

    // Create mocks
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getCurrentUser']);
    mockAuthService.isAuthenticated.and.returnValue(false);
    mockAuthService.getCurrentUser.and.returnValue(null);

    mockExperimentService = jasmine.createSpyObj('ExperimentService', ['getVariant']);
    mockExperimentService.getVariant.and.returnValue('A');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProfileManagerService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: ExperimentService, useValue: mockExperimentService }
      ]
    });

    service = TestBed.inject(ProfileManagerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should create empty profile on initialize', () => {
      const profile = service.initialize();
      expect(profile).toBeTruthy();
      expect(profile.schemaVersion).toBe(1);
      expect(profile.variant).toBe('A');
    });

    it('should throw if getProfile called before initialize', () => {
      expect(() => service.getProfile()).toThrowError(/not initialized/);
    });

    it('should return profile after initialize', () => {
      service.initialize();
      expect(() => service.getProfile()).not.toThrow();
      expect(service.getProfile()).toBeTruthy();
    });
  });

  describe('SetAction - set operation', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should set a value at path', () => {
      const action: SetAction = {
        path: 'LifestyleProfile.dailyTime',
        op: 'set',
        value: 'high',
        valueType: 'enum'
      };

      service.applySetAction(action);

      const profile = service.getProfile();
      expect(profile.LifestyleProfile.dailyTime).toBe('high');
    });

    it('should set nested value', () => {
      const action: SetAction = {
        path: 'EnvironmentProfile.housingType',
        op: 'set',
        value: 'apartment_large',
        valueType: 'enum'
      };

      service.applySetAction(action);

      expect(service.getProfile().EnvironmentProfile.housingType).toBe('apartment_large');
    });

    it('should set boolean value', () => {
      const action: SetAction = {
        path: 'LifestyleProfile.worksFromHome',
        op: 'set',
        value: true,
        valueType: 'boolean'
      };

      service.applySetAction(action);

      expect(service.getProfile().LifestyleProfile.worksFromHome).toBe(true);
    });
  });

  describe('SetAction - inc operation', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should increment a numeric value', () => {
      // First set initial value
      service.applySetAction({
        path: 'LifestyleProfile.awayHoursPerDay',
        op: 'set',
        value: 5,
        valueType: 'number'
      });

      // Then increment
      service.applySetAction({
        path: 'LifestyleProfile.awayHoursPerDay',
        op: 'inc',
        value: 3,
        valueType: 'number'
      });

      expect(service.getProfile().LifestyleProfile.awayHoursPerDay).toBe(8);
    });

    it('should increment from 0 if not set', () => {
      const action: SetAction = {
        path: 'LifestyleProfile.awayHoursPerDay',
        op: 'inc',
        value: 5,
        valueType: 'number'
      };

      service.applySetAction(action);

      expect(service.getProfile().LifestyleProfile.awayHoursPerDay).toBe(5);
    });
  });

  describe('SetAction - push operation', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should push to array', () => {
      service.applySetAction({
        path: 'Route.pathTaken',
        op: 'push',
        value: 'Q01',
        valueType: 'string'
      });

      service.applySetAction({
        path: 'Route.pathTaken',
        op: 'push',
        value: 'Q02',
        valueType: 'string'
      });

      expect(service.getProfile().Route.pathTaken).toEqual(['Q01', 'Q02']);
    });

    it('should push to completedModules', () => {
      service.applySetAction({
        path: 'Route.completedModules',
        op: 'push',
        value: 'lifestyle',
        valueType: 'string'
      });

      expect(service.getProfile().Route.completedModules).toContain('lifestyle');
    });
  });

  describe('SetAction - toggle operation', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should toggle boolean value', () => {
      // Initial value should be false
      expect(service.getProfile().LifestyleProfile.hasOtherPets).toBe(false);

      // Toggle to true
      service.applySetAction({
        path: 'LifestyleProfile.hasOtherPets',
        op: 'toggle',
        value: null,
        valueType: 'boolean'
      });

      expect(service.getProfile().LifestyleProfile.hasOtherPets).toBe(true);

      // Toggle back to false
      service.applySetAction({
        path: 'LifestyleProfile.hasOtherPets',
        op: 'toggle',
        value: null,
        valueType: 'boolean'
      });

      expect(service.getProfile().LifestyleProfile.hasOtherPets).toBe(false);
    });
  });

  describe('SetAction - merge operation', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should merge object into SpeciesPreferences', () => {
      service.applySetAction({
        path: 'SpeciesPreferences',
        op: 'merge',
        value: { dog: { priority: 1 } },
        valueType: 'object'
      });

      expect(service.getProfile().SpeciesPreferences).toEqual(
        jasmine.objectContaining({ dog: { priority: 1 } })
      );
    });
  });

  describe('Multiple actions', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should apply multiple actions atomically', () => {
      const actions: SetAction[] = [
        { path: 'LifestyleProfile.dailyTime', op: 'set', value: 'high', valueType: 'enum' },
        { path: 'LifestyleProfile.experience', op: 'set', value: 'experienced', valueType: 'enum' },
        { path: 'EnvironmentProfile.housingType', op: 'set', value: 'house_with_garden', valueType: 'enum' }
      ];

      service.applySetActions(actions);

      const profile = service.getProfile();
      expect(profile.LifestyleProfile.dailyTime).toBe('high');
      expect(profile.LifestyleProfile.experience).toBe('experienced');
      expect(profile.EnvironmentProfile.housingType).toBe('house_with_garden');
    });
  });

  describe('Security - whitelist', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should block non-whitelisted paths', () => {
      const action: SetAction = {
        path: 'SomeRandomProfile.field',
        op: 'set',
        value: 'hacked',
        valueType: 'string'
      };

      // Should not throw, just log warning and ignore
      service.applySetAction(action);

      // Profile should not have the random field
      expect((service.getProfile() as any).SomeRandomProfile).toBeUndefined();
    });
  });

  describe('Persistence', () => {
    it('should save profile to localStorage', () => {
      service.initialize();
      service.applySetAction({
        path: 'LifestyleProfile.dailyTime',
        op: 'set',
        value: 'high',
        valueType: 'enum'
      });

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should mark profile dirty after change', () => {
      service.initialize();
      expect(service.isDirty()).toBe(false);

      service.applySetAction({
        path: 'LifestyleProfile.dailyTime',
        op: 'set',
        value: 'high',
        valueType: 'enum'
      });

      expect(service.isDirty()).toBe(true);
    });
  });

  describe('Reset', () => {
    it('should reset profile to empty state', () => {
      service.initialize();
      service.applySetAction({
        path: 'LifestyleProfile.dailyTime',
        op: 'set',
        value: 'high',
        valueType: 'enum'
      });

      service.reset();

      // After reset, dailyTime should be back to default
      const profile = service.getProfile();
      expect(profile.LifestyleProfile.dailyTime).not.toBe('high');
    });
  });

  describe('markCompleted', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should set completedAt timestamp', () => {
      expect(service.getProfile().completedAt).toBeUndefined();

      service.markCompleted();

      expect(service.getProfile().completedAt).toBeDefined();
    });
  });

  describe('updateLastQuestionId', () => {
    beforeEach(() => {
      service.initialize();
    });

    it('should update lastQuestionId', () => {
      service.updateLastQuestionId('Q05');
      expect(service.getProfile().lastQuestionId).toBe('Q05');
    });
  });
});
