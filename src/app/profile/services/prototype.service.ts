import { Injectable } from '@angular/core';

/**
 * Prototype profile data from quiz result
 */
export interface PrototypeProfile {
  speciesId: string;
  speciesName: string;
  suggestedBreed: string;
  compatibility: number;
  icon: string;
  description: string;
}

const PROTOTYPE_STORAGE_KEY = 'prototypeProfile';

/**
 * PrototypeService - Manages prototype profile data for Path B users
 *
 * Stores and retrieves quiz result data for users who haven't
 * registered a pet yet but want to explore the prototype profile.
 */
@Injectable({
  providedIn: 'root',
})
export class PrototypeService {
  /**
   * Save prototype profile data to session storage
   */
  savePrototypeData(profile: PrototypeProfile): void {
    sessionStorage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify(profile));
  }

  /**
   * Get prototype profile data from session storage
   */
  getPrototypeData(): PrototypeProfile | null {
    const stored = sessionStorage.getItem(PROTOTYPE_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as PrototypeProfile;
    } catch {
      return null;
    }
  }

  /**
   * Clear prototype profile data
   */
  clearPrototypeData(): void {
    sessionStorage.removeItem(PROTOTYPE_STORAGE_KEY);
  }

  /**
   * Check if prototype data exists
   */
  hasPrototypeData(): boolean {
    return sessionStorage.getItem(PROTOTYPE_STORAGE_KEY) !== null;
  }
}
