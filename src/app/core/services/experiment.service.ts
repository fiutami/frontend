/**
 * ExperimentService - A/B/C Testing for Questionnaire
 *
 * Handles deterministic variant assignment with:
 * - Versioned storage (bump EXPERIMENT_VERSION to re-assign)
 * - SSR-safe localStorage access
 * - Stable seed from userId or deviceId
 * - 34/33/33 split to avoid modulo bias
 *
 * @version 1.0
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { QuestionnaireVariant } from '../models/analytics.models';

interface ExperimentData {
  variant: QuestionnaireVariant;
  version: number;
}

@Injectable({ providedIn: 'root' })
export class ExperimentService {
  private readonly STORAGE_KEY = 'fiutami_experiment';
  private readonly DEVICE_ID_KEY = 'fiutami_device_id';

  /**
   * CRITICO: Bump this version if you change split logic.
   * Users will be re-assigned on next visit.
   */
  private readonly EXPERIMENT_VERSION = 1;

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  /**
   * Get the assigned variant for this user/device.
   * Assignment is deterministic and persisted.
   */
  getVariant(): QuestionnaireVariant {
    if (!this.isStorageAvailable()) {
      return 'A'; // Default for SSR/pre-render
    }

    const stored = this.getStoredExperiment();
    if (stored && stored.version === this.EXPERIMENT_VERSION) {
      return stored.variant;
    }

    // Generate deterministic assignment
    const seed = this.getSeed();
    const hash = Math.abs(this.hashCode(seed)) % 100;

    // Split: 34/33/33 to avoid bias
    const variant: QuestionnaireVariant = hash < 34 ? 'A' : hash < 67 ? 'B' : 'C';

    this.saveExperiment({ variant, version: this.EXPERIMENT_VERSION });

    // TODO: Sync to backend when endpoint is ready
    // if (this.authService.isAuthenticated()) {
    //   this.syncVariantToBackend(variant);
    // }

    return variant;
  }

  /**
   * Get or generate a stable device ID.
   */
  getDeviceId(): string {
    if (!this.isStorageAvailable()) {
      return 'ssr-fallback';
    }

    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  /**
   * Get the current experiment version.
   */
  getExperimentVersion(): number {
    return this.EXPERIMENT_VERSION;
  }

  /**
   * Check if localStorage is available (SSR-safe).
   */
  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Get stored experiment data from localStorage.
   */
  private getStoredExperiment(): ExperimentData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save experiment data to localStorage.
   */
  private saveExperiment(data: ExperimentData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Get seed for deterministic hashing.
   * Uses userId if authenticated, otherwise deviceId.
   */
  private getSeed(): string {
    const userId = this.authService.getCurrentUser()?.id;
    if (userId) return userId;
    return this.getDeviceId();
  }

  /**
   * Simple string hash function.
   * Returns a 32-bit integer (can be negative, use Math.abs).
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   * Sync variant to backend.
   * TODO: Enable when POST /api/questionnaire/experiment endpoint is ready.
   */
  // private syncVariantToBackend(variant: QuestionnaireVariant): void {
  //   this.http.post(`${environment.apiUrl}/questionnaire/experiment`, {
  //     variant,
  //     experimentVersion: this.EXPERIMENT_VERSION
  //   }).subscribe({ error: () => {} });
  // }
}
