/**
 * Embedding Service - Transformers.js Integration
 *
 * Browser-side embeddings for matching profiles with breed catalog.
 * Model is loaded ONLY after quiz completion to avoid UX impact.
 *
 * @version 1.1
 */

import { Injectable, signal, computed } from '@angular/core';
import { UserPreferenceProfile } from '../models/profile.models';

// Types for Transformers.js
interface TensorOutput {
  data: Float32Array;
  dims: number[];
}

// Pipeline type - actual import is dynamic
type Pipeline = (text: string, options?: { pooling?: string; normalize?: boolean }) => Promise<TensorOutput>;

export interface EmbeddingResult {
  embedding: Float32Array;
  dimensions: number;
}

export interface ModelLoadProgress {
  status: 'idle' | 'loading' | 'ready' | 'error';
  progress: number; // 0-100
  message: string;
}

@Injectable({ providedIn: 'root' })
export class EmbeddingService {
  // Model config - using smaller multilingual model (~25MB)
  private readonly MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

  // State signals
  private readonly _loadState = signal<ModelLoadProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  readonly loadState = this._loadState.asReadonly();
  readonly isReady = computed(() => this._loadState().status === 'ready');
  readonly isLoading = computed(() => this._loadState().status === 'loading');
  readonly hasError = computed(() => this._loadState().status === 'error');

  // Pipeline instance
  private embedder: Pipeline | null = null;

  /**
   * Load the embedding model.
   * Call this ONLY after quiz completion.
   */
  async loadModel(): Promise<boolean> {
    if (this.embedder) {
      return true;
    }

    if (this._loadState().status === 'loading') {
      // Wait for ongoing load
      return this.waitForLoad();
    }

    this._loadState.set({
      status: 'loading',
      progress: 0,
      message: 'Inizializzando modello AI...'
    });

    try {
      // Dynamic import to avoid loading 25MB on app start
      const { pipeline, env } = await import('@huggingface/transformers');

      // Configure for browser
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      // Load with progress callback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.embedder = await (pipeline as any)(
        'feature-extraction',
        this.MODEL_ID,
        {
          progress_callback: (progress: { progress?: number; status?: string }) => {
            const pct = progress.progress ?? 0;
            this._loadState.set({
              status: 'loading',
              progress: Math.round(pct),
              message: progress.status ?? `Caricamento ${Math.round(pct)}%...`
            });
          }
        }
      );

      this._loadState.set({
        status: 'ready',
        progress: 100,
        message: 'Modello pronto'
      });

      return true;
    } catch (err) {
      console.error('[EmbeddingService] Failed to load model:', err);

      this._loadState.set({
        status: 'error',
        progress: 0,
        message: 'Modello AI non disponibile'
      });

      return false;
    }
  }

  /**
   * Generate embedding for a user profile.
   * Converts profile to text, then embeds.
   */
  async embedProfile(profile: UserPreferenceProfile): Promise<EmbeddingResult | null> {
    if (!this.embedder) {
      const loaded = await this.loadModel();
      if (!loaded) {
        return null;
      }
    }

    try {
      const text = this.profileToText(profile);
      const output = await this.embedder!(text, {
        pooling: 'mean',
        normalize: true
      });

      return {
        embedding: output.data as Float32Array,
        dimensions: output.dims[1] as number
      };
    } catch (err) {
      console.error('[EmbeddingService] Embedding failed:', err);
      return null;
    }
  }

  /**
   * Generate embedding for a breed description.
   */
  async embedBreed(description: string): Promise<EmbeddingResult | null> {
    if (!this.embedder) {
      const loaded = await this.loadModel();
      if (!loaded) {
        return null;
      }
    }

    try {
      const output = await this.embedder!(description, {
        pooling: 'mean',
        normalize: true
      });

      return {
        embedding: output.data as Float32Array,
        dimensions: output.dims[1] as number
      };
    } catch (err) {
      console.error('[EmbeddingService] Breed embedding failed:', err);
      return null;
    }
  }

  /**
   * Compute cosine similarity between two embeddings.
   */
  cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error('Embedding dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    if (magnitude === 0) return 0;

    return dotProduct / magnitude;
  }

  /**
   * Convert profile to natural language text for embedding.
   */
  private profileToText(profile: UserPreferenceProfile): string {
    const parts: string[] = [];

    // Lifestyle
    if (profile.LifestyleProfile) {
      const lp = profile.LifestyleProfile;
      if (lp.dailyTime) {
        parts.push(`Tempo giornaliero: ${this.translateValue(lp.dailyTime)}`);
      }
      if (lp.experience) {
        parts.push(`Esperienza: ${this.translateValue(lp.experience)}`);
      }
      if (lp.activityLevel) {
        parts.push(`Livello attività: ${this.translateValue(lp.activityLevel)}`);
      }
    }

    // Environment
    if (profile.EnvironmentProfile) {
      const ep = profile.EnvironmentProfile;
      if (ep.housingType) {
        parts.push(`Abitazione: ${this.translateValue(ep.housingType)}`);
      }
      if (ep.outdoorAccess && ep.outdoorAccess !== 'none') {
        parts.push(`Spazio esterno: ${this.translateValue(ep.outdoorAccess)}`);
      }
      if (ep.climate) {
        parts.push(`Clima: ${this.translateValue(ep.climate)}`);
      }
    }

    // Finance
    if (profile.FinanceProfile) {
      const fp = profile.FinanceProfile;
      if (fp.monthlyBudget) {
        parts.push(`Budget mensile: ${this.translateValue(fp.monthlyBudget)}`);
      }
    }

    // Family
    if (profile.RelationshipProfile) {
      const rp = profile.RelationshipProfile;
      const family = rp.familyComposition;
      const hasChildren = family === 'family_young_kids' || family === 'family_teens';
      parts.push(`Bambini in casa: ${hasChildren ? 'sì' : 'no'}`);
    }

    // Other pets (from LifestyleProfile)
    if (profile.LifestyleProfile?.hasOtherPets !== undefined) {
      parts.push(`Altri animali: ${profile.LifestyleProfile.hasOtherPets ? 'sì' : 'no'}`);
    }

    // Care
    if (profile.CareRoutineProfile) {
      const cp = profile.CareRoutineProfile;
      if (cp.groomingWillingness) {
        parts.push(`Disponibilità toelettatura: ${this.translateValue(cp.groomingWillingness)}`);
      }
      if (cp.dailyWalks !== undefined) {
        parts.push(`Passeggiate giornaliere: ${cp.dailyWalks ? 'sì' : 'no'}`);
      }
    }

    // Route selection
    if (profile.Route?.selectedSpecies) {
      parts.push(`Specie preferita: ${this.translateValue(profile.Route.selectedSpecies)}`);
    }

    return parts.join('. ') || 'Profilo utente generico';
  }

  /**
   * Translate enum values to Italian text for better embedding.
   */
  private translateValue(value: string): string {
    const translations: Record<string, string> = {
      // Time / Budget / General
      'minimal': 'pochissimo',
      'low': 'poco',
      'medium': 'medio',
      'high': 'molto',
      'flexible': 'flessibile',
      'unlimited': 'illimitato',

      // Experience
      'none': 'nessuna esperienza',
      'some': 'qualche esperienza',
      'experienced': 'esperto',
      'professional': 'professionista',

      // Housing
      'apartment_small': 'appartamento piccolo',
      'apartment_large': 'appartamento grande',
      'house_no_garden': 'casa senza giardino',
      'house_with_garden': 'casa con giardino',
      'rural': 'campagna',
      'farm': 'fattoria',

      // Species
      'dog': 'cane',
      'cat': 'gatto',
      'bird': 'uccello',
      'small_mammal': 'piccolo mammifero',
      'fish': 'pesce',
      'reptile': 'rettile',

      // Activity
      'sedentary': 'sedentario',
      'moderate': 'moderato',
      'active': 'attivo',
      'very_active': 'molto attivo',
      'athletic': 'atletico',

      // Grooming
      'weekly': 'settimanale',
      'daily': 'giornaliera'
    };

    return translations[value] ?? value;
  }

  /**
   * Wait for ongoing model load to complete.
   */
  private waitForLoad(): Promise<boolean> {
    return new Promise((resolve) => {
      const check = () => {
        const state = this._loadState();
        if (state.status === 'ready') {
          resolve(true);
        } else if (state.status === 'error') {
          resolve(false);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  /**
   * Unload model to free memory.
   */
  unload(): void {
    this.embedder = null;
    this._loadState.set({
      status: 'idle',
      progress: 0,
      message: ''
    });
  }
}
