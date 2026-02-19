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
import { TranslateService } from '@ngx-translate/core';
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
  private readonly translate = inject(TranslateService);
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
      this.updateState('loading', 10, this.translate.instant('onboarding.matching.loadingBreeds'));
      const candidates = await this.loadCandidates(profile);

      if (candidates.length === 0) {
        this.updateState('done', 100, this.translate.instant('onboarding.matching.noCompatibleBreeds'));
        this._results.set([]);
        return [];
      }

      // Step 2: Filter by hard constraints
      this.updateState('filtering', 25, this.translate.instant('onboarding.matching.applyingFilters'));
      const filtered = this.applyHardConstraints(candidates, profile);

      if (filtered.length === 0) {
        this.updateState('done', 100, this.translate.instant('onboarding.matching.noBreedsPassConstraints'));
        this._results.set([]);
        return [];
      }

      // Step 3: Compute semantic scores (if embeddings available)
      this.updateState('embedding', 40, this.translate.instant('onboarding.matching.analyzingCompatibility'));
      const withSemanticScores = await this.computeSemanticScores(filtered, profile);

      // Step 4: Compute rule-based scores
      this.updateState('scoring', 70, this.translate.instant('onboarding.matching.calculatingScores'));
      const withAllScores = this.computeRuleScores(withSemanticScores, profile);

      // Step 5: Sort and return top results
      const sorted = withAllScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      this.updateState('done', 100, this.translate.instant('onboarding.matching.compatibleBreedsFound', { count: sorted.length }));
      this._results.set(sorted);

      return sorted;
    } catch (err) {
      console.error('[MatchingEngine] Error:', err);
      this.updateState('error', 0, this.translate.instant('onboarding.matching.calculationError'));
      return [];
    }
  }

  /**
   * Get matches without AI (fallback mode).
   */
  async computeMatchesLocal(profile: UserPreferenceProfile): Promise<MatchResult[]> {
    try {
      this.updateState('loading', 10, this.translate.instant('onboarding.matching.loadingCatalog'));
      const candidates = await this.loadCandidates(profile);

      this.updateState('filtering', 40, this.translate.instant('onboarding.matching.filteringBreeds'));
      const filtered = this.applyHardConstraints(candidates, profile);

      this.updateState('scoring', 70, this.translate.instant('onboarding.matching.calculatingScores'));
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

      this.updateState('done', 100, this.translate.instant('onboarding.matching.breedsFound', { count: sorted.length }));
      this._results.set(sorted);

      return sorted;
    } catch (err) {
      console.error('[MatchingEngine] Local error:', err);
      this.updateState('error', 0, this.translate.instant('onboarding.matching.calculationErrorShort'));
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
        category: this.translate.instant('onboarding.matching.category_housing'),
        reason: this.translate.instant('onboarding.matching.reason_apartmentFriendly'),
        impact: 'positive'
      });
    }

    // Family check - derive hasChildren from familyComposition
    const family = profile.RelationshipProfile?.familyComposition;
    const hasChildren = family === 'family_young_kids' || family === 'family_teens';

    if (attrs.goodWithChildren && hasChildren) {
      reasons.push({
        category: this.translate.instant('onboarding.matching.category_family'),
        reason: this.translate.instant('onboarding.matching.reason_goodWithChildren'),
        impact: 'positive'
      });
    }

    // Experience check - use correct enum values
    const experience = profile.LifestyleProfile?.experience;
    if (attrs.trainability === 'high' && (experience === 'none' || experience === 'some')) {
      reasons.push({
        category: this.translate.instant('onboarding.matching.category_experience'),
        reason: this.translate.instant('onboarding.matching.reason_easyToTrain'),
        impact: 'positive'
      });
    }

    // Time check
    const dailyTime = profile.LifestyleProfile?.dailyTime;
    if (attrs.exerciseNeeds === 'low' && (dailyTime === 'low' || dailyTime === 'minimal')) {
      reasons.push({
        category: this.translate.instant('onboarding.matching.category_time'),
        reason: this.translate.instant('onboarding.matching.reason_lowExercise'),
        impact: 'positive'
      });
    }

    if (attrs.groomingNeeds === 'low') {
      reasons.push({
        category: this.translate.instant('onboarding.matching.category_care'),
        reason: this.translate.instant('onboarding.matching.reason_lowGrooming'),
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
        aspect: this.translate.instant('onboarding.matching.category_coat'),
        description: this.translate.instant('onboarding.matching.tradeoff_highShedding'),
        severity: 'medium'
      });
    }

    // Housing check - use correct apartment detection
    const housing = profile.EnvironmentProfile?.housingType;
    const isApartment = housing === 'apartment_small' || housing === 'apartment_large';

    if (attrs.barkingLevel === 'high' && isApartment) {
      tradeoffs.push({
        aspect: this.translate.instant('onboarding.matching.category_noise'),
        description: this.translate.instant('onboarding.matching.tradeoff_highBarking'),
        severity: 'high'
      });
    }

    if (attrs.size === 'giant') {
      tradeoffs.push({
        aspect: this.translate.instant('onboarding.matching.category_space'),
        description: this.translate.instant('onboarding.matching.tradeoff_giantSize'),
        severity: 'medium'
      });
    }

    // Budget check - use correct enum value 'medium'
    if (attrs.monthlyExpense === 'high' && profile.FinanceProfile?.monthlyBudget === 'medium') {
      tradeoffs.push({
        aspect: this.translate.instant('onboarding.matching.category_cost'),
        description: this.translate.instant('onboarding.matching.tradeoff_highExpense'),
        severity: 'medium'
      });
    }

    return tradeoffs;
  }

  /**
   * Local fallback breed data (40+ breeds for offline matching).
   */
  private getLocalBreeds(): BreedCandidate[] {
    return LOCAL_BREED_CATALOG;
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

// ============================================================================
// Local Breed Catalog (42 breeds for offline/fallback matching)
// ============================================================================

const LOCAL_BREED_CATALOG: BreedCandidate[] = [

  // ── DOGS (22 breeds) ──────────────────────────────────────────────────

  {
    id: 'dog-labrador',
    name: 'Labrador Retriever',
    species: 'dog',
    description: 'Cane amichevole, energico, ottimo con bambini. Facile da addestrare, ideale per famiglie attive con spazi ampi.',
    imageUrl: 'assets/images/breeds/dog-labrador.webp',
    attributes: {
      size: 'large', energyLevel: 'high', groomingNeeds: 'medium', trainability: 'high',
      shedding: 'high', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: false, exerciseNeeds: 'high', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-golden-retriever',
    name: 'Golden Retriever',
    species: 'dog',
    description: 'Dolce, paziente e intelligente. Perfetto per famiglie. Richiede esercizio quotidiano e adora nuotare.',
    imageUrl: 'assets/images/breeds/dog-golden.webp',
    attributes: {
      size: 'large', energyLevel: 'high', groomingNeeds: 'high', trainability: 'high',
      shedding: 'high', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: false, exerciseNeeds: 'high', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-pastore-tedesco',
    name: 'Pastore Tedesco',
    species: 'dog',
    description: 'Intelligente, leale e protettivo. Eccellente cane da lavoro e da guardia. Richiede addestramento coerente.',
    imageUrl: 'assets/images/breeds/dog-pastore-tedesco.webp',
    attributes: {
      size: 'large', energyLevel: 'high', groomingNeeds: 'medium', trainability: 'high',
      shedding: 'high', barkingLevel: 'high', goodWithChildren: true, goodWithOtherPets: false,
      apartmentFriendly: false, exerciseNeeds: 'high', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-bulldog-francese',
    name: 'Bulldog Francese',
    species: 'dog',
    description: 'Compatto, giocoso e affettuoso. Perfetto per appartamento. Basso fabbisogno di esercizio, adora stare sul divano.',
    imageUrl: 'assets/images/breeds/dog-bulldog-francese.webp',
    attributes: {
      size: 'small', energyLevel: 'low', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'low', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'high'
    }
  },
  {
    id: 'dog-cavalier',
    name: 'Cavalier King Charles Spaniel',
    species: 'dog',
    description: 'Affettuoso, tranquillo, perfetto compagno da appartamento. Ama le coccole e si adatta facilmente.',
    imageUrl: 'assets/images/breeds/dog-cavalier.webp',
    attributes: {
      size: 'small', energyLevel: 'medium', groomingNeeds: 'medium', trainability: 'medium',
      shedding: 'medium', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-border-collie',
    name: 'Border Collie',
    species: 'dog',
    description: 'Il cane più intelligente del mondo. Instancabile, richiede stimolazione mentale e fisica costante. Non adatto a sedentari.',
    imageUrl: 'assets/images/breeds/dog-border-collie.webp',
    attributes: {
      size: 'medium', energyLevel: 'very_high', groomingNeeds: 'medium', trainability: 'high',
      shedding: 'high', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: false, exerciseNeeds: 'high', monthlyExpense: 'low'
    }
  },
  {
    id: 'dog-beagle',
    name: 'Beagle',
    species: 'dog',
    description: 'Allegro, curioso e socievole. Ottimo con i bambini. Tende a seguire gli odori e abbaiare.',
    imageUrl: 'assets/images/breeds/dog-beagle.webp',
    attributes: {
      size: 'medium', energyLevel: 'high', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'medium', barkingLevel: 'high', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: false, exerciseNeeds: 'high', monthlyExpense: 'low'
    }
  },
  {
    id: 'dog-barboncino',
    name: 'Barboncino (Poodle)',
    species: 'dog',
    description: 'Elegante, ipoallergenico e molto intelligente. Disponibile in varie taglie. Ottimo per chi ha allergie.',
    imageUrl: 'assets/images/breeds/dog-barboncino.webp',
    attributes: {
      size: 'medium', energyLevel: 'medium', groomingNeeds: 'high', trainability: 'high',
      shedding: 'low', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'medium', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-chihuahua',
    name: 'Chihuahua',
    species: 'dog',
    description: 'Il cane più piccolo del mondo. Coraggioso, vivace e devoto al padrone. Perfetto per spazi ridotti.',
    imageUrl: 'assets/images/breeds/dog-chihuahua.webp',
    attributes: {
      size: 'tiny', energyLevel: 'medium', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'low', barkingLevel: 'high', goodWithChildren: false, goodWithOtherPets: false,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  },
  {
    id: 'dog-jack-russell',
    name: 'Jack Russell Terrier',
    species: 'dog',
    description: 'Piccolo ma pieno di energia. Intelligente, atletico e determinato. Ha bisogno di molto esercizio.',
    imageUrl: 'assets/images/breeds/dog-jack-russell.webp',
    attributes: {
      size: 'small', energyLevel: 'very_high', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'medium', barkingLevel: 'high', goodWithChildren: true, goodWithOtherPets: false,
      apartmentFriendly: false, exerciseNeeds: 'high', monthlyExpense: 'low'
    }
  },
  {
    id: 'dog-shiba-inu',
    name: 'Shiba Inu',
    species: 'dog',
    description: 'Indipendente, pulito e riservato. Simile a una volpe. Adatto a proprietari esperti.',
    imageUrl: 'assets/images/breeds/dog-shiba-inu.webp',
    attributes: {
      size: 'medium', energyLevel: 'medium', groomingNeeds: 'medium', trainability: 'low',
      shedding: 'high', barkingLevel: 'medium', goodWithChildren: false, goodWithOtherPets: false,
      apartmentFriendly: true, exerciseNeeds: 'medium', monthlyExpense: 'low'
    }
  },
  {
    id: 'dog-cocker-spaniel',
    name: 'Cocker Spaniel Inglese',
    species: 'dog',
    description: 'Allegro, affettuoso e sempre in movimento. Ottimo cane da famiglia con pelo setoso.',
    imageUrl: 'assets/images/breeds/dog-cocker.webp',
    attributes: {
      size: 'medium', energyLevel: 'high', groomingNeeds: 'high', trainability: 'high',
      shedding: 'medium', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'medium', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-bassotto',
    name: 'Bassotto (Dachshund)',
    species: 'dog',
    description: 'Coraggioso e testardo con zampe corte. Buon cane da appartamento, leale e divertente.',
    imageUrl: 'assets/images/breeds/dog-bassotto.webp',
    attributes: {
      size: 'small', energyLevel: 'medium', groomingNeeds: 'low', trainability: 'low',
      shedding: 'low', barkingLevel: 'high', goodWithChildren: false, goodWithOtherPets: false,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  },
  {
    id: 'dog-yorkshire',
    name: 'Yorkshire Terrier',
    species: 'dog',
    description: 'Piccolo, elegante e pieno di personalità. Ipoallergenico. Perfetto compagno da borsetta e da divano.',
    imageUrl: 'assets/images/breeds/dog-yorkshire.webp',
    attributes: {
      size: 'tiny', energyLevel: 'medium', groomingNeeds: 'high', trainability: 'medium',
      shedding: 'low', barkingLevel: 'high', goodWithChildren: false, goodWithOtherPets: false,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-husky',
    name: 'Siberian Husky',
    species: 'dog',
    description: 'Maestoso e indipendente. Nato per correre. Richiede tantissimo esercizio e spazi aperti.',
    imageUrl: 'assets/images/breeds/dog-husky.webp',
    attributes: {
      size: 'large', energyLevel: 'very_high', groomingNeeds: 'high', trainability: 'low',
      shedding: 'high', barkingLevel: 'high', goodWithChildren: true, goodWithOtherPets: false,
      apartmentFriendly: false, exerciseNeeds: 'high', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-maltese',
    name: 'Maltese',
    species: 'dog',
    description: 'Dolce, giocoso e ipoallergenico. Pelo lungo e setoso. Ideale per anziani e vita in appartamento.',
    imageUrl: 'assets/images/breeds/dog-maltese.webp',
    attributes: {
      size: 'tiny', energyLevel: 'low', groomingNeeds: 'high', trainability: 'medium',
      shedding: 'low', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-boxer',
    name: 'Boxer',
    species: 'dog',
    description: 'Giocherellone, energico e protettivo. Ottimo con i bambini, leale alla famiglia.',
    imageUrl: 'assets/images/breeds/dog-boxer.webp',
    attributes: {
      size: 'large', energyLevel: 'high', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'low', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: false, exerciseNeeds: 'high', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-carlino',
    name: 'Carlino (Pug)',
    species: 'dog',
    description: 'Buffo, affettuoso e pigro. Adora il divano e le coccole. Perfetto per chi ha poco tempo.',
    imageUrl: 'assets/images/breeds/dog-carlino.webp',
    attributes: {
      size: 'small', energyLevel: 'low', groomingNeeds: 'low', trainability: 'low',
      shedding: 'high', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-setter-irlandese',
    name: 'Setter Irlandese',
    species: 'dog',
    description: 'Elegante, atletico e socievole. Pelo rosso mogano. Ottimo per proprietari attivi con giardino.',
    imageUrl: 'assets/images/breeds/dog-setter.webp',
    attributes: {
      size: 'large', energyLevel: 'very_high', groomingNeeds: 'high', trainability: 'medium',
      shedding: 'medium', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: false, exerciseNeeds: 'high', monthlyExpense: 'medium'
    }
  },
  {
    id: 'dog-corso',
    name: 'Cane Corso',
    species: 'dog',
    description: 'Potente guardiano italiano. Leale e protettivo. Solo per proprietari esperti con spazio.',
    imageUrl: 'assets/images/breeds/dog-corso.webp',
    attributes: {
      size: 'giant', energyLevel: 'medium', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'medium', barkingLevel: 'low', goodWithChildren: false, goodWithOtherPets: false,
      apartmentFriendly: false, exerciseNeeds: 'medium', monthlyExpense: 'high'
    }
  },
  {
    id: 'dog-whippet',
    name: 'Whippet',
    species: 'dog',
    description: 'Veloce ma sorprendentemente calmo in casa. Elegante, silenzioso, perfetto per appartamento.',
    imageUrl: 'assets/images/breeds/dog-whippet.webp',
    attributes: {
      size: 'medium', energyLevel: 'medium', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'low', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'medium', monthlyExpense: 'low'
    }
  },
  {
    id: 'dog-schnauzer-nano',
    name: 'Schnauzer Nano',
    species: 'dog',
    description: 'Vivace, coraggioso e ipoallergenico. Ottimo cane da guardia in formato compatto.',
    imageUrl: 'assets/images/breeds/dog-schnauzer.webp',
    attributes: {
      size: 'small', energyLevel: 'high', groomingNeeds: 'high', trainability: 'high',
      shedding: 'low', barkingLevel: 'high', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'medium', monthlyExpense: 'medium'
    }
  },

  // ── CATS (10 breeds) ──────────────────────────────────────────────────

  {
    id: 'cat-europeo',
    name: 'Gatto Europeo',
    species: 'cat',
    description: 'Indipendente, robusto e adattabile. Il gatto per eccellenza, equilibrato e facile da gestire.',
    imageUrl: 'assets/images/breeds/cat-europeo.webp',
    attributes: {
      size: 'medium', energyLevel: 'medium', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'medium', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  },
  {
    id: 'cat-persiano',
    name: 'Persiano',
    species: 'cat',
    description: 'Elegante e tranquillo. Pelo lungo che richiede cura quotidiana. Ama la vita sedentaria.',
    imageUrl: 'assets/images/breeds/cat-persiano.webp',
    attributes: {
      size: 'medium', energyLevel: 'low', groomingNeeds: 'high', trainability: 'low',
      shedding: 'high', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'medium'
    }
  },
  {
    id: 'cat-maine-coon',
    name: 'Maine Coon',
    species: 'cat',
    description: 'Il gigante gentile. Socievole, giocherellone e intelligente. Ama l\'acqua e la compagnia.',
    imageUrl: 'assets/images/breeds/cat-maine-coon.webp',
    attributes: {
      size: 'large', energyLevel: 'medium', groomingNeeds: 'high', trainability: 'high',
      shedding: 'high', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'medium', monthlyExpense: 'medium'
    }
  },
  {
    id: 'cat-siamese',
    name: 'Siamese',
    species: 'cat',
    description: 'Vocale, affettuoso e molto sociale. Crea un legame forte con il proprietario. Molto intelligente.',
    imageUrl: 'assets/images/breeds/cat-siamese.webp',
    attributes: {
      size: 'medium', energyLevel: 'high', groomingNeeds: 'low', trainability: 'high',
      shedding: 'low', barkingLevel: 'high', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'medium', monthlyExpense: 'low'
    }
  },
  {
    id: 'cat-british-shorthair',
    name: 'British Shorthair',
    species: 'cat',
    description: 'Tranquillo, indipendente e robusto. Il classico gatto da compagnia, poco esigente.',
    imageUrl: 'assets/images/breeds/cat-british.webp',
    attributes: {
      size: 'medium', energyLevel: 'low', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'medium', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  },
  {
    id: 'cat-ragdoll',
    name: 'Ragdoll',
    species: 'cat',
    description: 'Docile e rilassato, si lascia coccolare come un peluche. Pelo semi-lungo, molto affettuoso.',
    imageUrl: 'assets/images/breeds/cat-ragdoll.webp',
    attributes: {
      size: 'large', energyLevel: 'low', groomingNeeds: 'medium', trainability: 'medium',
      shedding: 'medium', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'medium'
    }
  },
  {
    id: 'cat-bengala',
    name: 'Bengala',
    species: 'cat',
    description: 'Selvaggio nell\'aspetto, domestico nel cuore. Energico, atletico e giocherellone. Ama arrampicarsi.',
    imageUrl: 'assets/images/breeds/cat-bengala.webp',
    attributes: {
      size: 'medium', energyLevel: 'very_high', groomingNeeds: 'low', trainability: 'high',
      shedding: 'low', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: false,
      apartmentFriendly: false, exerciseNeeds: 'high', monthlyExpense: 'medium'
    }
  },
  {
    id: 'cat-sphynx',
    name: 'Sphynx',
    species: 'cat',
    description: 'Senza pelo, ipoallergenico e molto affettuoso. Cerca sempre il calore umano. Estroverso.',
    imageUrl: 'assets/images/breeds/cat-sphynx.webp',
    attributes: {
      size: 'medium', energyLevel: 'high', groomingNeeds: 'medium', trainability: 'high',
      shedding: 'low', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'medium', monthlyExpense: 'medium'
    }
  },
  {
    id: 'cat-scottish-fold',
    name: 'Scottish Fold',
    species: 'cat',
    description: 'Orecchie piegate caratteristiche. Dolce, calmo e adattabile. Perfetto per appartamento tranquillo.',
    imageUrl: 'assets/images/breeds/cat-scottish.webp',
    attributes: {
      size: 'medium', energyLevel: 'low', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'medium', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  },
  {
    id: 'cat-certosino',
    name: 'Certosino',
    species: 'cat',
    description: 'Silenzioso, dolce e indipendente. Pelo grigio-blu. Ottimo per chi lavora fuori casa.',
    imageUrl: 'assets/images/breeds/cat-certosino.webp',
    attributes: {
      size: 'medium', energyLevel: 'low', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'medium', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  },

  // ── SMALL MAMMALS (5 breeds) ──────────────────────────────────────────

  {
    id: 'small-coniglio-nano',
    name: 'Coniglio Nano',
    species: 'small_mammal',
    description: 'Dolce, silenzioso e socievole. Vive 8-12 anni. Può essere addestrato alla lettiera.',
    imageUrl: 'assets/images/breeds/small-coniglio.webp',
    attributes: {
      size: 'small', energyLevel: 'medium', groomingNeeds: 'medium', trainability: 'medium',
      shedding: 'medium', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'medium', monthlyExpense: 'low'
    }
  },
  {
    id: 'small-criceto-dorato',
    name: 'Criceto Dorato',
    species: 'small_mammal',
    description: 'Piccolo, notturno e indipendente. Facile da gestire. Vive 2-3 anni. Ideale come primo animale.',
    imageUrl: 'assets/images/breeds/small-criceto.webp',
    attributes: {
      size: 'tiny', energyLevel: 'medium', groomingNeeds: 'low', trainability: 'low',
      shedding: 'low', barkingLevel: 'low', goodWithChildren: true, goodWithOtherPets: false,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  },
  {
    id: 'small-cavia',
    name: 'Cavia Peruviana',
    species: 'small_mammal',
    description: 'Socievole e vocale. Ama la compagnia, meglio in coppia. Vive 5-7 anni. Facile da curare.',
    imageUrl: 'assets/images/breeds/small-cavia.webp',
    attributes: {
      size: 'small', energyLevel: 'low', groomingNeeds: 'low', trainability: 'low',
      shedding: 'low', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  },
  {
    id: 'small-furetto',
    name: 'Furetto',
    species: 'small_mammal',
    description: 'Giocherellone, curioso e molto sociale. Richiede ore di gioco fuori dalla gabbia. Vive 6-10 anni.',
    imageUrl: 'assets/images/breeds/small-furetto.webp',
    attributes: {
      size: 'small', energyLevel: 'high', groomingNeeds: 'medium', trainability: 'medium',
      shedding: 'low', barkingLevel: 'low', goodWithChildren: false, goodWithOtherPets: false,
      apartmentFriendly: true, exerciseNeeds: 'medium', monthlyExpense: 'medium'
    }
  },
  {
    id: 'small-cincilla',
    name: 'Cincillà',
    species: 'small_mammal',
    description: 'Pelo morbidissimo, notturno e delicato. Vive 10-15 anni. Sensibile al calore. Silenzioso.',
    imageUrl: 'assets/images/breeds/small-cincilla.webp',
    attributes: {
      size: 'small', energyLevel: 'medium', groomingNeeds: 'medium', trainability: 'low',
      shedding: 'high', barkingLevel: 'low', goodWithChildren: false, goodWithOtherPets: false,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  },

  // ── BIRDS (5 breeds) ──────────────────────────────────────────────────

  {
    id: 'bird-canarino',
    name: 'Canarino',
    species: 'bird',
    description: 'Canto melodioso, facile da curare. Ideale per principianti. Non richiede interazione costante.',
    imageUrl: 'assets/images/breeds/bird-canarino.webp',
    attributes: {
      size: 'tiny', energyLevel: 'low', groomingNeeds: 'low', trainability: 'low',
      shedding: 'low', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  },
  {
    id: 'bird-pappagallino',
    name: 'Pappagallino Ondulato',
    species: 'bird',
    description: 'Piccolo, colorato e socievole. Può imparare a parlare. Perfetto per chi vuole interazione.',
    imageUrl: 'assets/images/breeds/bird-pappagallino.webp',
    attributes: {
      size: 'tiny', energyLevel: 'medium', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'low', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  },
  {
    id: 'bird-inseparabile',
    name: 'Inseparabile (Agapornis)',
    species: 'bird',
    description: 'Affettuoso e legato al padrone. Meglio in coppia. Colorato e vivace, richiede attenzione quotidiana.',
    imageUrl: 'assets/images/breeds/bird-inseparabile.webp',
    attributes: {
      size: 'small', energyLevel: 'high', groomingNeeds: 'low', trainability: 'medium',
      shedding: 'low', barkingLevel: 'high', goodWithChildren: true, goodWithOtherPets: false,
      apartmentFriendly: true, exerciseNeeds: 'medium', monthlyExpense: 'low'
    }
  },
  {
    id: 'bird-cenerino',
    name: 'Pappagallo Cenerino',
    species: 'bird',
    description: 'Il più intelligente dei pappagalli. Parla fluentemente, empatico. Impegno di 40-60 anni.',
    imageUrl: 'assets/images/breeds/bird-cenerino.webp',
    attributes: {
      size: 'medium', energyLevel: 'medium', groomingNeeds: 'medium', trainability: 'high',
      shedding: 'medium', barkingLevel: 'high', goodWithChildren: false, goodWithOtherPets: false,
      apartmentFriendly: false, exerciseNeeds: 'medium', monthlyExpense: 'high'
    }
  },
  {
    id: 'bird-calopsita',
    name: 'Calopsitta',
    species: 'bird',
    description: 'Dolce, fischietta melodie e ama le coccole sulla testa. Taglia media, vive 15-25 anni.',
    imageUrl: 'assets/images/breeds/bird-calopsita.webp',
    attributes: {
      size: 'small', energyLevel: 'medium', groomingNeeds: 'low', trainability: 'high',
      shedding: 'medium', barkingLevel: 'medium', goodWithChildren: true, goodWithOtherPets: true,
      apartmentFriendly: true, exerciseNeeds: 'low', monthlyExpense: 'low'
    }
  }
];
