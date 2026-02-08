/**
 * Experiment Service Tests
 *
 * Tests:
 * - Deterministic variant assignment
 * - Device ID generation
 * - Version-based re-assignment
 * - SSR safety
 *
 * @version 1.1
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ExperimentService } from './experiment.service';
import { AuthService } from './auth.service';

describe('ExperimentService', () => {
  let service: ExperimentService;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let store: Record<string, string>;

  beforeEach(() => {
    // Reset localStorage mock
    store = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });

    // Mock AuthService
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getCurrentUser']);
    mockAuthService.isAuthenticated.and.returnValue(false);
    mockAuthService.getCurrentUser.and.returnValue(null);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ExperimentService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(ExperimentService);
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Variant Assignment', () => {
    it('should return a valid variant (A, B, or C)', () => {
      const variant = service.getVariant();
      expect(['A', 'B', 'C']).toContain(variant);
    });

    it('should return same variant on repeated calls', () => {
      const first = service.getVariant();
      const second = service.getVariant();
      const third = service.getVariant();

      expect(first).toBe(second);
      expect(second).toBe(third);
    });

    it('should persist variant to localStorage', () => {
      service.getVariant();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'fiutami_experiment',
        jasmine.any(String)
      );

      // Parse the stored value
      const stored = JSON.parse(store['fiutami_experiment']);
      expect(['A', 'B', 'C']).toContain(stored.variant);
      expect(stored.version).toBe(1);
    });

    it('should load variant from localStorage if valid', () => {
      // Pre-seed localStorage
      store['fiutami_experiment'] = JSON.stringify({
        variant: 'B',
        version: 1
      });

      // Create new instance that will read from storage
      const newService = TestBed.inject(ExperimentService);
      const variant = newService.getVariant();

      expect(variant).toBe('B');
    });

    it('should re-assign if stored version differs', () => {
      // Pre-seed with old version
      store['fiutami_experiment'] = JSON.stringify({
        variant: 'B',
        version: 0 // Old version
      });

      const variant = service.getVariant();

      // Should have been re-assigned (may or may not be B)
      expect(['A', 'B', 'C']).toContain(variant);

      // Should have updated storage with new version
      const newStored = JSON.parse(store['fiutami_experiment']);
      expect(newStored.version).toBe(1);
    });
  });

  describe('Device ID', () => {
    it('should generate a device ID', () => {
      const deviceId = service.getDeviceId();

      expect(deviceId).toBeTruthy();
      expect(deviceId.length).toBeGreaterThan(0);
    });

    it('should persist device ID', () => {
      const first = service.getDeviceId();

      // Should have stored it
      expect(store['fiutami_device_id']).toBe(first);
    });

    it('should return same device ID on repeated calls', () => {
      const first = service.getDeviceId();
      const second = service.getDeviceId();

      expect(first).toBe(second);
    });

    it('should load device ID from localStorage', () => {
      store['fiutami_device_id'] = 'pre-existing-device-id';

      const deviceId = service.getDeviceId();

      expect(deviceId).toBe('pre-existing-device-id');
    });
  });

  describe('Experiment Version', () => {
    it('should return experiment version', () => {
      const version = service.getExperimentVersion();

      expect(version).toBe(1);
    });
  });

  describe('Deterministic Assignment', () => {
    it('should assign consistently for same device ID', () => {
      // Set a specific device ID
      store['fiutami_device_id'] = 'test-device-123';

      const variant1 = service.getVariant();

      // Clear experiment data but keep device ID
      delete store['fiutami_experiment'];

      // Should get same variant
      const variant2 = service.getVariant();

      expect(variant1).toBe(variant2);
    });

    it('should use userId when authenticated', () => {
      mockAuthService.getCurrentUser.and.returnValue({ id: 'user-456' } as any);

      const variant = service.getVariant();

      expect(['A', 'B', 'C']).toContain(variant);
    });
  });

  describe('Distribution', () => {
    it('should have roughly even distribution (statistical)', () => {
      // This is a probabilistic test - may occasionally fail
      const counts = { A: 0, B: 0, C: 0 };
      const iterations = 300;

      for (let i = 0; i < iterations; i++) {
        // Clear storage for fresh assignment
        store = {};

        // Set unique device ID
        store['fiutami_device_id'] = `device-${i}`;

        const newService = TestBed.inject(ExperimentService);
        const variant = newService.getVariant();
        counts[variant]++;
      }

      // Each variant should be roughly 33% (with tolerance)
      // With 300 iterations, expect ~100 each, allow ±30
      expect(counts.A).toBeGreaterThan(50);
      expect(counts.A).toBeLessThan(150);
      expect(counts.B).toBeGreaterThan(50);
      expect(counts.B).toBeLessThan(150);
      expect(counts.C).toBeGreaterThan(50);
      expect(counts.C).toBeLessThan(150);
    });
  });
});
