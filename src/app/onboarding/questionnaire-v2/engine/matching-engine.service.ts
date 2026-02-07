/**
 * Matching Engine Service
 *
 * Orchestrates breed matching using:
 * 1. Hard constraint filtering (species, legal, space)
 * 2. Transformers.js embeddings for semantic similarity
 * 3. Rule-based scoring for fine-tuning
 *
 * @version 1.1
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserPreferenceProfile } from '../models/profile.models';
import { EmbeddingService } from './embedding.service';
import { environment } from '../../../../environments/environment';

export interface BreedCandidate {
  id: string;
  name: string;
  species: string;
  description: string;
  imageUrl?: string;
  attributes: BreedAttributes;
}

export interface BreedAttributes {
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'giant';
  energyLevel?: 'low' | 'medium' | 'high' | 'very_high';
  groomingNeeds?: 'low' | 'medium' | 'high';
  trainability?: 'low' | 'medium' | 'high';
  shedding?: 'low' | 'medium' | 'high';
  barkingLevel?: 'low' | 'medium' | 'high';
  goodWithChildren?: boolean;
  goodWithOtherPets?: boolean;
  apartmentFriendly?: boolean;
  exerciseNeeds?: 'low' | 'medium' | 'high';
  monthlyExpense?: 'low' | 'medium' | 'high';
}

export interface MatchResult {
  breed: BreedCandidate;
  score: number; // 0-100
  semanticScore: number;
  ruleScore: number;
  matchReasons: MatchReason[];
  tradeoffs: Tradeoff[];
}

export interface MatchReason {
  category: string;
  reason: string;
  impact: 'positive' | 'neutral' | 'warning';
}

export interface Tradeoff {
  aspect: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface MatchingState {
  status: 'idle' | 'loading' | 'filtering' | 'embedding' | 'scoring' | 'done' | 'error';
  progress: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class MatchingEngineService {
  private readonly http = inject(HttpClient);
  private readonly embeddingService = inject(EmbeddingService);

  // State
  private readonly _state = signal<MatchingState>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  private readonly _results = signal<MatchResult[]>([]);

  readonly state = this._state.asReadonly();
  readonly results = this._results.asReadonly();
  readonly isProcessing = computed(() =>
    ['loading', 'filtering', 'embedding', 'scoring'].includes(this._state().status)
  );
  readonly topResults = computed(() => this._results().slice(0, 3));

  // Cache for breed embeddings
  private breedEmbeddingsCache = new Map<string, Float32Array>();

  /**
   * Run the full matching pipeline.
   */
  async computeMatches(profile: UserPreferenceProfile): Promise<MatchResult[]> {
    try {
      // Step 1: Load candidates
      this.updateState('loading', 10, 'Caricando catalogo razze...');
      const candidates = await this.loadCandidates(profile);

      if (candidates.length === 0) {
        this.updateState('done', 100, 'Nessuna razza compatibile trovata');
        this._results.set([]);
        return [];
      }

      // Step 2: Filter by hard constraints
      this.updateState('filtering', 25, 'Applicando filtri...');
      const filtered = this.applyHardConstraints(candidates, profile);

      if (filtered.length === 0) {
        this.updateState('done', 100, 'Nessuna razza supera i vincoli');
        this._results.set([]);
        return [];
      }

      // Step 3: Compute semantic scores (if embeddings available)
      this.updateState('embedding', 40, 'Analizzando compatibilità semantica...');
      const withSemanticScores = await this.computeSemanticScores(filtered, profile);

      // Step 4: Compute rule-based scores
      this.updateState('scoring', 70, 'Calcolando punteggi...');
      const withAllScores = this.computeRuleScores(withSemanticScores, profile);

      // Step 5: Sort and return top results
      const sorted = withAllScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      this.updateState('done', 100, `${sorted.length} razze compatibili trovate`);
      this._results.set(sorted);

      return sorted;
    } catch (err) {
      console.error('[MatchingEngine] Error:', err);
      this.updateState('error', 0, 'Errore nel calcolo delle compatibilità');
      return [];
    }
  }

  /**
   * Get matches without AI (fallback mode).
   */
  async computeMatchesLocal(profile: UserPreferenceProfile): Promise<MatchResult[]> {
    try {
      this.updateState('loading', 10, 'Caricando catalogo...');
      const candidates = await this.loadCandidates(profile);

      this.updateState('filtering', 40, 'Filtrando razze...');
      const filtered = this.applyHardConstraints(candidates, profile);

      this.updateState('scoring', 70, 'Calcolando punteggi...');
      const results = filtered.map(breed => {
        const ruleScore = this.calculateRuleScore(breed, profile);
        return {
          breed,
          score: ruleScore,
          semanticScore: 0,
          ruleScore,
          matchReasons: this.generateMatchReasons(breed, profile),
          tradeoffs: this.generateTradeoffs(breed, profile)
        };
      });

      const sorted = results
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      this.updateState('done', 100, `${sorted.length} razze trovate`);
      this._results.set(sorted);

      return sorted;
    } catch (err) {
      console.error('[MatchingEngine] Local error:', err);
      this.updateState('error', 0, 'Errore nel calcolo');
      return [];
    }
  }

  /**
   * Load breed candidates from API or local data.
   */
  private async loadCandidates(profile: UserPreferenceProfile): Promise<BreedCandidate[]> {
    const species = profile.Route?.selectedSpecies;

    if (!species) {
      // Load all species
      return this.loadAllBreeds();
    }

    return this.loadBreedsBySpecies(species);
  }

  private async loadAllBreeds(): Promise<BreedCandidate[]> {
    try {
      const breeds = await firstValueFrom(
        this.http.get<BreedCandidate[]>(`${environment.apiUrl}/catalogs/breeds`)
      );
      return breeds ?? [];
    } catch {
      // Fallback to local data
      return this.getLocalBreeds();
    }
  }

  private async loadBreedsBySpecies(species: string): Promise<BreedCandidate[]> {
    try {
      const breeds = await firstValueFrom(
        this.http.get<BreedCandidate[]>(`${environment.apiUrl}/catalogs/breeds?species=${species}`)
      );
      return breeds ?? [];
    } catch {
      return this.getLocalBreeds().filter(b => b.species === species);
    }
  }

  /**
   * Apply hard constraints that must be satisfied.
   */
  private applyHardConstraints(
    candidates: BreedCandidate[],
    profile: UserPreferenceProfile
  ): BreedCandidate[] {
    return candidates.filter(breed => {
      // Apartment constraint
      const housing = profile.EnvironmentProfile?.housingType;
      const isApartment = housing === 'apartment_small' || housing === 'apartment_large';
      if (isApartment) {
        if (breed.attributes.size === 'giant') return false;
        if (breed.attributes.apartmentFriendly === false) return false;
      }

      // Energy vs time constraint
      const dailyTime = profile.LifestyleProfile?.dailyTime;
      if (dailyTime === 'low' || dailyTime === 'minimal') {
        if (breed.attributes.energyLevel === 'very_high') return false;
        if (breed.attributes.exerciseNeeds === 'high') return false;
      }

      // Budget constraint
      if (profile.FinanceProfile?.monthlyBudget === 'low') {
        if (breed.attributes.monthlyExpense === 'high') return false;
        if (breed.attributes.size === 'giant') return false;
      }

      // Children safety - check family composition
      const family = profile.RelationshipProfile?.familyComposition;
      const hasChildren = family === 'family_young_kids' || family === 'family_teens';
      if (hasChildren) {
        if (breed.attributes.goodWithChildren === false) return false;
      }

      // Other pets compatibility
      if (profile.LifestyleProfile?.hasOtherPets) {
        if (breed.attributes.goodWithOtherPets === false) return false;
      }

      return true;
    });
  }

  /**
   * Compute semantic similarity scores using embeddings.
   */
  private async computeSemanticScores(
    candidates: BreedCandidate[],
    profile: UserPreferenceProfile
  ): Promise<Array<{ breed: BreedCandidate; semanticScore: number }>> {
    // Try to load embedding model
    const modelLoaded = await this.embeddingService.loadModel();

    if (!modelLoaded) {
      // Fallback: no semantic scoring
      return candidates.map(breed => ({ breed, semanticScore: 50 }));
    }

    // Embed user profile
    const profileEmbedding = await this.embeddingService.embedProfile(profile);
    if (!profileEmbedding) {
      return candidates.map(breed => ({ breed, semanticScore: 50 }));
    }

    // Embed each breed and compute similarity
    const results: Array<{ breed: BreedCandidate; semanticScore: number }> = [];

    for (const breed of candidates) {
      let breedEmbedding = this.breedEmbeddingsCache.get(breed.id);

      if (!breedEmbedding) {
        const embedded = await this.embeddingService.embedBreed(breed.description);
        if (embedded) {
          breedEmbedding = embedded.embedding;
          this.breedEmbeddingsCache.set(breed.id, breedEmbedding);
        }
      }

      if (breedEmbedding) {
        const similarity = this.embeddingService.cosineSimilarity(
          profileEmbedding.embedding,
          breedEmbedding
        );
        // Convert from -1..1 to 0..100
        const score = Math.round((similarity + 1) * 50);
        results.push({ breed, semanticScore: score });
      } else {
        results.push({ breed, semanticScore: 50 });
      }
    }

    return results;
  }

  /**
   * Compute rule-based scores and combine with semantic.
   */
  private computeRuleScores(
    candidates: Array<{ breed: BreedCandidate; semanticScore: number }>,
    profile: UserPreferenceProfile
  ): MatchResult[] {
    return candidates.map(({ breed, semanticScore }) => {
      const ruleScore = this.calculateRuleScore(breed, profile);

      // Weighted combination: 40% semantic, 60% rules
      const combinedScore = Math.round(semanticScore * 0.4 + ruleScore * 0.6);

      return {
        breed,
        score: combinedScore,
        semanticScore,
        ruleScore,
        matchReasons: this.generateMatchReasons(breed, profile),
        tradeoffs: this.generateTradeoffs(breed, profile)
      };
    });
  }

  /**
   * Calculate score based on rules matching profile.
   */
  private calculateRuleScore(breed: BreedCandidate, profile: UserPreferenceProfile): number {
    let score = 50; // Base score
    const attrs = breed.attributes;

    // Time alignment (+/- 15)
    if (profile.LifestyleProfile?.dailyTime) {
      const time = profile.LifestyleProfile.dailyTime;
      const energy = attrs.energyLevel ?? 'medium';

      if ((time === 'high' || time === 'flexible') && (energy === 'high' || energy === 'very_high')) score += 15;
      else if ((time === 'low' || time === 'minimal') && energy === 'low') score += 15;
      else if (time === 'medium' && energy === 'medium') score += 10;
      else if ((time === 'low' || time === 'minimal') && (energy === 'high' || energy === 'very_high')) score -= 15;
    }

    // Experience alignment (+/- 10)
    if (profile.LifestyleProfile?.experience) {
      const exp = profile.LifestyleProfile.experience;
      const trainability = attrs.trainability ?? 'medium';

      // Beginners benefit from high trainability
      if ((exp === 'none' || exp === 'some') && trainability === 'high') score += 10;
      if (exp === 'none' && trainability === 'low') score -= 10;
      // Experienced owners can handle difficult breeds
      if ((exp === 'experienced' || exp === 'professional') && trainability === 'low') score += 5;
    }

    // Housing alignment (+/- 10)
    if (profile.EnvironmentProfile?.housingType) {
      const housing = profile.EnvironmentProfile.housingType;
      const isApartment = housing === 'apartment_small' || housing === 'apartment_large';
      const hasGarden = housing === 'house_with_garden' || housing === 'rural' || housing === 'farm';

      if (isApartment && attrs.apartmentFriendly) score += 10;
      if (hasGarden && attrs.size === 'large') score += 5;
      if ((housing === 'farm' || housing === 'rural') && (attrs.size === 'large' || attrs.size === 'giant')) score += 5;
    }

    // Budget alignment (+/- 10)
    if (profile.FinanceProfile?.monthlyBudget) {
      const budget = profile.FinanceProfile.monthlyBudget;
      const expense = attrs.monthlyExpense ?? 'medium';

      if ((budget === 'high' || budget === 'unlimited') && expense === 'high') score += 5;
      if (budget === 'low' && expense === 'low') score += 10;
      if (budget === 'low' && expense === 'high') score -= 15;
    }

    // Grooming willingness (+/- 5)
    if (profile.CareRoutineProfile?.groomingWillingness) {
      const willingness = profile.CareRoutineProfile.groomingWillingness;
      const needs = attrs.groomingNeeds ?? 'medium';

      if ((willingness === 'daily' || willingness === 'professional') && needs === 'high') score += 5;
      if (willingness === 'minimal' && needs === 'low') score += 5;
      if (willingness === 'minimal' && needs === 'high') score -= 10;
    }

    // Family bonuses - derive hasChildren from familyComposition
    const family = profile.RelationshipProfile?.familyComposition;
    const hasChildren = family === 'family_young_kids' || family === 'family_teens';
    if (hasChildren && attrs.goodWithChildren) {
      score += 10;
    }
    // hasOtherPets is in LifestyleProfile
    if (profile.LifestyleProfile?.hasOtherPets && attrs.goodWithOtherPets) {
      score += 5;
    }

    // Clamp to 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate human-readable match reasons.
   */
  private generateMatchReasons(breed: BreedCandidate, profile: UserPreferenceProfile): MatchReason[] {
    const reasons: MatchReason[] = [];
    const attrs = breed.attributes;

    // Housing check
    const housing = profile.EnvironmentProfile?.housingType;
    const isApartment = housing === 'apartment_small' || housing === 'apartment_large';

    if (attrs.apartmentFriendly && isApartment) {
      reasons.push({
        category: 'Abitazione',
        reason: 'Adatto alla vita in appartamento',
        impact: 'positive'
      });
    }

    // Family check - derive hasChildren from familyComposition
    const family = profile.RelationshipProfile?.familyComposition;
    const hasChildren = family === 'family_young_kids' || family === 'family_teens';

    if (attrs.goodWithChildren && hasChildren) {
      reasons.push({
        category: 'Famiglia',
        reason: 'Ottimo con i bambini',
        impact: 'positive'
      });
    }

    // Experience check - use correct enum values
    const experience = profile.LifestyleProfile?.experience;
    if (attrs.trainability === 'high' && (experience === 'none' || experience === 'some')) {
      reasons.push({
        category: 'Esperienza',
        reason: 'Facile da addestrare, ideale per principianti',
        impact: 'positive'
      });
    }

    // Time check
    const dailyTime = profile.LifestyleProfile?.dailyTime;
    if (attrs.exerciseNeeds === 'low' && (dailyTime === 'low' || dailyTime === 'minimal')) {
      reasons.push({
        category: 'Tempo',
        reason: 'Basse esigenze di esercizio',
        impact: 'positive'
      });
    }

    if (attrs.groomingNeeds === 'low') {
      reasons.push({
        category: 'Cura',
        reason: 'Manutenzione del pelo ridotta',
        impact: 'positive'
      });
    }

    return reasons;
  }

  /**
   * Generate potential tradeoffs.
   */
  private generateTradeoffs(breed: BreedCandidate, profile: UserPreferenceProfile): Tradeoff[] {
    const tradeoffs: Tradeoff[] = [];
    const attrs = breed.attributes;

    if (attrs.shedding === 'high') {
      tradeoffs.push({
        aspect: 'Pelo',
        description: 'Perdita di pelo elevata, richiede pulizia frequente',
        severity: 'medium'
      });
    }

    // Housing check - use correct apartment detection
    const housing = profile.EnvironmentProfile?.housingType;
    const isApartment = housing === 'apartment_small' || housing === 'apartment_large';

    if (attrs.barkingLevel === 'high' && isApartment) {
      tradeoffs.push({
        aspect: 'Rumore',
        description: 'Tende ad abbaiare molto, potrebbero esserci problemi con i vicini',
        severity: 'high'
      });
    }

    if (attrs.size === 'giant') {
      tradeoffs.push({
        aspect: 'Spazio',
        description: 'Taglia grande, richiede spazio adeguato',
        severity: 'medium'
      });
    }

    // Budget check - use correct enum value 'medium'
    if (attrs.monthlyExpense === 'high' && profile.FinanceProfile?.monthlyBudget === 'medium') {
      tradeoffs.push({
        aspect: 'Costi',
        description: 'Spese mensili superiori alla media',
        severity: 'medium'
      });
    }

    return tradeoffs;
  }

  /**
   * Local fallback breed data.
   */
  private getLocalBreeds(): BreedCandidate[] {
    // Minimal local data for offline/error scenarios
    return [
      {
        id: 'dog-labrador',
        name: 'Labrador Retriever',
        species: 'dog',
        description: 'Cane amichevole, energico, ottimo con bambini. Facile da addestrare, adatto a famiglie attive.',
        attributes: {
          size: 'large',
          energyLevel: 'high',
          groomingNeeds: 'medium',
          trainability: 'high',
          goodWithChildren: true,
          goodWithOtherPets: true,
          apartmentFriendly: false,
          exerciseNeeds: 'high'
        }
      },
      {
        id: 'dog-cavalier',
        name: 'Cavalier King Charles Spaniel',
        species: 'dog',
        description: 'Cane affettuoso, tranquillo, perfetto per appartamento. Ama le coccole.',
        attributes: {
          size: 'small',
          energyLevel: 'medium',
          groomingNeeds: 'medium',
          trainability: 'medium',
          goodWithChildren: true,
          goodWithOtherPets: true,
          apartmentFriendly: true,
          exerciseNeeds: 'low'
        }
      },
      {
        id: 'cat-europeo',
        name: 'Gatto Europeo',
        species: 'cat',
        description: 'Gatto indipendente, robusto, adatto a qualsiasi ambiente.',
        attributes: {
          size: 'medium',
          energyLevel: 'medium',
          groomingNeeds: 'low',
          goodWithChildren: true,
          goodWithOtherPets: true,
          apartmentFriendly: true
        }
      }
    ];
  }

  private updateState(status: MatchingState['status'], progress: number, message: string): void {
    this._state.set({ status, progress, message });
  }

  /**
   * Reset state.
   */
  reset(): void {
    this._state.set({ status: 'idle', progress: 0, message: '' });
    this._results.set([]);
  }

  /**
   * Clear embedding cache to free memory.
   */
  clearCache(): void {
    this.breedEmbeddingsCache.clear();
    this.embeddingService.unload();
  }
}
