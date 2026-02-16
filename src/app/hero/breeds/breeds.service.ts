import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, tap, catchError, finalize, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Species,
  Breed,
  BreedAnalysisResult,
} from './models/breed.model';

/**
 * Backend API response interfaces
 */
export interface SpeciesApiResponse {
  id: string;
  code: string;
  name: string;
  category: string;
  scientificName?: string;
  description?: string;
  imageUrl?: string;
  emoji?: string;
  isPopular: boolean;
  displayOrder: number;
  breedPolicy?: 'None' | 'Optional' | 'Required';
  taxonRank?: string;
  parentSpeciesId?: string | null;
}

/** List endpoint response shape: GET /api/breed?speciesId=... */
export interface BreedListApiResponse {
  breeds: BreedApiResponse[];
  totalCount: number;
}

/** Single breed (from list or detail) */
export interface BreedApiResponse {
  id: string;
  speciesId: string;
  speciesName?: string;
  name: string;
  nameOriginal?: string;
  origin?: string | null;
  description?: string;
  imageUrl?: string | null;
  popularity?: number;
  breedType?: 'Pure' | 'Mixed' | 'Hybrid';
  allowsUserVariantLabel?: boolean;
  // Detail-only fields
  dna?: {
    geneticsInfo?: string;
    groupFCI?: string;
    ancestralBreeds?: string[];
  };
  size?: {
    heightMinCm?: number;
    heightMaxCm?: number;
    weightMinKg?: number;
    weightMaxKg?: number;
    coatType?: string;
    colors?: string[];
    lifespanMinYears?: number;
    lifespanMaxYears?: number;
  };
  temperament?: string[];
}

/**
 * BreedsService - State management and API calls for Breeds module
 * Uses signals for reactive state management.
 * DB is the single source of truth - no mock fallbacks.
 */
@Injectable({ providedIn: 'root' })
export class BreedsService {
  private readonly http = inject(HttpClient);

  // In-flight request cache for race-condition protection
  private speciesRequest$: Observable<Species[]> | null = null;

  // State signals
  readonly speciesList = signal<Species[]>([]);
  readonly breedsList = signal<Breed[]>([]);
  readonly selectedSpecies = signal<Species | null>(null);
  readonly selectedBreed = signal<Breed | null>(null);
  readonly searchQuery = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed values
  readonly filteredBreeds = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const species = this.selectedSpecies();
    let breeds = this.breedsList();

    if (species) {
      breeds = breeds.filter(b => b.speciesId === species.id);
    }

    if (query) {
      breeds = breeds.filter(b =>
        b.name.toLowerCase().includes(query) ||
        b.origin.toLowerCase().includes(query)
      );
    }

    return breeds;
  });

  readonly speciesByCategory = computed(() => {
    const grouped: Record<string, Species[]> = {};
    this.speciesList().forEach(species => {
      if (!grouped[species.category]) {
        grouped[species.category] = [];
      }
      grouped[species.category].push(species);
    });
    return grouped;
  });

  /**
   * Load all species from backend API.
   * Idempotent: returns cached data if already loaded (unless forced).
   * Race-condition safe: concurrent calls share the same in-flight request.
   */
  loadSpecies(force = false): Observable<Species[]> {
    // Already loaded and not forced -> return cached
    if (!force && this.speciesList().length > 0) {
      return of(this.speciesList());
    }

    // Already loading -> return in-flight request
    if (this.speciesRequest$) {
      return this.speciesRequest$;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.speciesRequest$ = this.http.get<SpeciesApiResponse[]>(`${environment.apiUrl}/species`).pipe(
      map(response => this.mapSpeciesResponse(response)),
      tap(species => this.speciesList.set(species)),
      catchError(err => {
        console.error('Failed to load species:', err);
        this.error.set('Errore nel caricamento delle specie');
        return of([]);
      }),
      finalize(() => {
        this.isLoading.set(false);
        this.speciesRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.speciesRequest$;
  }

  /**
   * Map API response to frontend Species model
   */
  private mapSpeciesResponse(response: SpeciesApiResponse[]): Species[] {
    return response.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      icon: s.emoji || 'pets',
      imageUrl: s.imageUrl || `/assets/species/${s.code}.jpg`,
      category: s.category,
      description: s.description,
      breedPolicy: s.breedPolicy,
      taxonRank: s.taxonRank,
      parentSpeciesId: s.parentSpeciesId,
    }));
  }

  /**
   * Get breeds by species ID from backend API
   * Endpoint: GET /api/breed?speciesId={id} → { breeds: [...] }
   */
  getBreedsBySpecies(speciesId: string): Observable<Breed[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<BreedListApiResponse>(`${environment.apiUrl}/breed`, {
      params: { speciesId, take: '200' }
    }).pipe(
      map(response => this.mapBreedsResponse(response.breeds || [])),
      tap(breeds => this.breedsList.set(breeds)),
      catchError(err => {
        console.error('Failed to load breeds:', err);
        this.error.set('Errore nel caricamento delle razze');
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Get breed details by ID from backend API
   */
  getBreedDetails(breedId: string): Observable<Breed | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<BreedApiResponse>(`${environment.apiUrl}/breed/${breedId}`).pipe(
      map(response => this.mapBreedResponse(response)),
      tap(breed => {
        if (breed) {
          this.selectedBreed.set(breed);
        } else {
          this.error.set('Razza non trovata');
        }
      }),
      catchError(err => {
        console.error('Failed to load breed details:', err);
        this.error.set('Razza non trovata');
        return of(null);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Map API response to frontend Breed model
   */
  private mapBreedsResponse(response: BreedApiResponse[]): Breed[] {
    return response.map(b => this.mapBreedResponse(b));
  }

  /**
   * Map single API response to frontend Breed model
   */
  private mapBreedResponse(b: BreedApiResponse): Breed {
    return {
      id: b.id,
      speciesId: b.speciesId,
      name: b.name,
      origin: b.origin || '',
      recognition: '',
      imageUrl: b.imageUrl || '/assets/images/breeds/placeholder-breed.png',
      breedType: b.breedType,
      allowsUserVariantLabel: b.allowsUserVariantLabel ?? false,
      dna: b.dna ? {
        genetics: b.dna.geneticsInfo || '',
        ancestralBreeds: b.dna.ancestralBreeds || [],
        groupFCI: b.dna.groupFCI,
      } : undefined,
      size: b.size ? {
        height: { min: b.size.heightMinCm || 0, max: b.size.heightMaxCm || 0, unit: 'cm' },
        weight: { min: b.size.weightMinKg || 0, max: b.size.weightMaxKg || 0, unit: 'kg' },
        coat: b.size.coatType || '',
        colors: b.size.colors || [],
        lifespan: (b.size.lifespanMinYears && b.size.lifespanMaxYears)
          ? { min: b.size.lifespanMinYears, max: b.size.lifespanMaxYears }
          : undefined,
      } : undefined,
      temperament: b.temperament ? {
        energy: 'media',
        sociality: 'media',
        trainability: 'media',
        traits: b.temperament,
      } : undefined,
      history: b.description,
    };
  }

  /**
   * Analyze photo to identify breed (AI feature)
   * MVP: Returns mock result after simulated delay
   */
  analyzePhoto(file: File, description: string): Observable<BreedAnalysisResult> {
    this.isLoading.set(true);
    this.error.set(null);

    // MVP: Simulate AI analysis with inline mock result
    const mockBreed: Breed = {
      id: 'mock-analysis',
      speciesId: 'dog',
      name: 'Razza rilevata',
      origin: '',
      recognition: '',
      imageUrl: '/assets/breeds/placeholder.jpg',
    };

    const mockResult: BreedAnalysisResult = {
      breed: mockBreed,
      confidence: 0.87,
      alternativeBreeds: [],
      analysisDetails: 'Analisi basata su caratteristiche fisiche: muso corto, orecchie piccole, corporatura compatta.'
    };

    return of(mockResult).pipe(
      delay(2000),
      map(result => {
        this.selectedBreed.set(result.breed);
        this.isLoading.set(false);
        return result;
      })
    );
  }

  /**
   * Search breeds by query - client-side only (no backend search endpoint)
   */
  searchBreeds(query: string): Observable<Breed[]> {
    this.searchQuery.set(query);

    if (!query.trim()) {
      return of(this.breedsList());
    }

    const filtered = this.breedsList().filter(b =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.origin.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered);
  }

  /**
   * Select a species (state only, no pre-fetch - breeds-list loads on its own)
   */
  selectSpecies(species: Species | null): void {
    this.selectedSpecies.set(species);
    if (!species) {
      this.breedsList.set([]);
    }
  }

  /**
   * Select a breed
   */
  selectBreed(breed: Breed | null): void {
    this.selectedBreed.set(breed);
  }

  /**
   * Clear selection and search
   */
  clearSelection(): void {
    this.selectedSpecies.set(null);
    this.selectedBreed.set(null);
    this.searchQuery.set('');
    this.breedsList.set([]);
    this.error.set(null);
  }

  /**
   * Get species by ID (from signal only)
   */
  getSpeciesById(id: string): Species | undefined {
    return this.speciesList().find(s => s.id === id);
  }

  /**
   * Get breed by ID (from signal only)
   */
  getBreedById(id: string): Breed | undefined {
    return this.breedsList().find(b => b.id === id);
  }
}
