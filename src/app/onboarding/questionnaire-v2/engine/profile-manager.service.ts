/**
 * Profile Manager Service for Questionnaire v1.1
 *
 * Manages UserPreferenceProfile state with:
 * - Typed SetAction operations (set, inc, push, toggle, merge)
 * - localStorage persistence
 * - Backend sync (when authenticated)
 * - Schema migrations
 *
 * @version 1.1
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { ExperimentService } from '../../../core/services/experiment.service';
import {
  UserPreferenceProfile,
  createEmptyProfile,
  ALLOWED_PROFILE_ROOTS
} from '../models/profile.models';
import { SetAction, SetActionOp } from '../models/question.models';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'fiutami_questionnaire_profile';
const CURRENT_SCHEMA_VERSION = 1;
const QUESTIONNAIRE_VERSION = '1.1';

// ============================================================================
// Service
// ============================================================================

@Injectable({ providedIn: 'root' })
export class ProfileManagerService {

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly experimentService = inject(ExperimentService);

  // Reactive state using signals
  private readonly profileSignal = signal<UserPreferenceProfile | null>(null);
  private readonly dirtySignal = signal<boolean>(false);
  private readonly lastSyncedAtSignal = signal<number | null>(null);

  // Public computed values
  readonly profile = this.profileSignal.asReadonly();
  readonly isDirty = this.dirtySignal.asReadonly();
  readonly lastSyncedAt = this.lastSyncedAtSignal.asReadonly();

  readonly hasProfile = computed(() => this.profileSignal() !== null);

  /**
   * Initialize or load existing profile.
   * Call this when starting the questionnaire.
   */
  initialize(): UserPreferenceProfile {
    // Try to load from localStorage first
    const stored = this.loadFromStorage();

    if (stored && this.isSchemaValid(stored)) {
      this.profileSignal.set(stored);
      return stored;
    }

    // Create new profile
    const variant = this.experimentService.getVariant();
    const newProfile = createEmptyProfile(variant, QUESTIONNAIRE_VERSION);
    this.profileSignal.set(newProfile);
    this.saveToStorage(newProfile);

    return newProfile;
  }

  /**
   * Get current profile (throws if not initialized).
   */
  getProfile(): UserPreferenceProfile {
    const profile = this.profileSignal();
    if (!profile) {
      throw new Error('Profile not initialized. Call initialize() first.');
    }
    return profile;
  }

  /**
   * Apply a SetAction to the profile.
   * Handles all operation types: set, inc, push, toggle, merge.
   */
  applySetAction(action: SetAction): void {
    const profile = this.getProfile();
    const updatedProfile = this.applyActionToProfile(profile, action);

    this.profileSignal.set(updatedProfile);
    this.dirtySignal.set(true);
    this.saveToStorage(updatedProfile);
  }

  /**
   * Apply multiple SetActions atomically.
   */
  applySetActions(actions: SetAction[]): void {
    let profile = this.getProfile();

    for (const action of actions) {
      profile = this.applyActionToProfile(profile, action);
    }

    this.profileSignal.set(profile);
    this.dirtySignal.set(true);
    this.saveToStorage(profile);
  }

  /**
   * Update last question ID (for resume).
   */
  updateLastQuestionId(questionId: string): void {
    const profile = this.getProfile();
    const updated: UserPreferenceProfile = {
      ...profile,
      lastQuestionId: questionId
    };
    this.profileSignal.set(updated);
    this.saveToStorage(updated);
  }

  /**
   * Mark questionnaire as completed.
   */
  markCompleted(): void {
    const profile = this.getProfile();
    const updated: UserPreferenceProfile = {
      ...profile,
      completedAt: new Date().toISOString()
    };
    this.profileSignal.set(updated);
    this.saveToStorage(updated);
    this.syncToBackend();
  }

  /**
   * Reset profile (start over).
   */
  reset(): UserPreferenceProfile {
    const variant = this.experimentService.getVariant();
    const newProfile = createEmptyProfile(variant, QUESTIONNAIRE_VERSION);
    this.profileSignal.set(newProfile);
    this.dirtySignal.set(false);
    this.saveToStorage(newProfile);
    return newProfile;
  }

  /**
   * Sync profile to backend (if authenticated).
   */
  async syncToBackend(): Promise<boolean> {
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    const profile = this.profileSignal();
    if (!profile) return false;

    try {
      await this.http.post(
        `${environment.apiUrl}/questionnaire/profile`,
        profile
      ).toPromise();

      this.dirtySignal.set(false);
      this.lastSyncedAtSignal.set(Date.now());
      return true;
    } catch (error) {
      console.warn('[ProfileManager] Failed to sync to backend:', error);
      return false;
    }
  }

  /**
   * Load profile from backend (if authenticated).
   */
  async loadFromBackend(): Promise<UserPreferenceProfile | null> {
    if (!this.authService.isAuthenticated()) {
      return null;
    }

    try {
      const profile = await this.http.get<UserPreferenceProfile>(
        `${environment.apiUrl}/questionnaire/profile`
      ).toPromise();

      if (profile && this.isSchemaValid(profile)) {
        this.profileSignal.set(profile);
        this.saveToStorage(profile);
        return profile;
      }
      return null;
    } catch {
      return null;
    }
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Apply a single action to profile (immutably).
   */
  private applyActionToProfile(
    profile: UserPreferenceProfile,
    action: SetAction
  ): UserPreferenceProfile {
    const segments = action.path.split('.');
    const [rootKey, ...rest] = segments;

    // Validate root key
    if (!ALLOWED_PROFILE_ROOTS.includes(rootKey as any)) {
      console.warn(`[ProfileManager] Blocked action on non-whitelisted root: "${rootKey}"`);
      return profile;
    }

    // Deep clone profile for immutability
    const updated = JSON.parse(JSON.stringify(profile)) as UserPreferenceProfile;

    // Navigate to target and apply operation
    let current: Record<string, unknown> = updated as unknown as Record<string, unknown>;
    for (let i = 0; i < rest.length - 1; i++) {
      const key = rest[i];
      if (current[key] == null || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    // Apply operation at final key (or root if no rest)
    const finalKey = rest.length > 0 ? rest[rest.length - 1] : rootKey;
    const targetObj = rest.length > 0 ? current : updated as unknown as Record<string, unknown>;

    this.applyOperation(targetObj, finalKey, action.op, action.value);

    return updated;
  }

  /**
   * Apply operation to object property.
   */
  private applyOperation(
    obj: Record<string, unknown>,
    key: string,
    op: SetActionOp,
    value: unknown
  ): void {
    switch (op) {
      case 'set':
        obj[key] = value;
        break;

      case 'inc':
        const current = typeof obj[key] === 'number' ? obj[key] as number : 0;
        obj[key] = current + (typeof value === 'number' ? value : 1);
        break;

      case 'push':
        if (!Array.isArray(obj[key])) {
          obj[key] = [];
        }
        (obj[key] as unknown[]).push(value);
        break;

      case 'toggle':
        obj[key] = !obj[key];
        break;

      case 'merge':
        if (typeof obj[key] !== 'object' || obj[key] === null) {
          obj[key] = {};
        }
        if (typeof value === 'object' && value !== null) {
          obj[key] = { ...(obj[key] as object), ...value };
        }
        break;

      default:
        console.warn(`[ProfileManager] Unknown operation: "${op}"`);
    }
  }

  /**
   * Check if stored profile schema is valid and up-to-date.
   */
  private isSchemaValid(profile: UserPreferenceProfile): boolean {
    // Check schema version
    if (profile.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      // Could apply migrations here
      console.info(`[ProfileManager] Schema migration needed: ${profile.schemaVersion} -> ${CURRENT_SCHEMA_VERSION}`);
      return this.migrateProfile(profile);
    }
    return true;
  }

  /**
   * Migrate profile to current schema version.
   */
  private migrateProfile(profile: UserPreferenceProfile): boolean {
    // Future migrations go here
    // For now, if version mismatch, just return false to create new
    if (profile.schemaVersion < CURRENT_SCHEMA_VERSION) {
      console.info('[ProfileManager] Profile too old, will create new');
      return false;
    }
    return true;
  }

  /**
   * SSR-safe check for localStorage availability.
   */
  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Load profile from localStorage.
   */
  private loadFromStorage(): UserPreferenceProfile | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as UserPreferenceProfile;
    } catch {
      return null;
    }
  }

  /**
   * Save profile to localStorage.
   */
  private saveToStorage(profile: UserPreferenceProfile): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.warn('[ProfileManager] Failed to save to localStorage:', error);
    }
  }

  /**
   * Clear profile from localStorage.
   */
  clearStorage(): void {
    if (!this.isStorageAvailable()) return;
    localStorage.removeItem(STORAGE_KEY);
  }
}
