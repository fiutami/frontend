import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, tap, catchError, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Species,
  Breed,
  BreedAnalysisResult,
  MOCK_SPECIES,
  MOCK_BREEDS
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
}

export interface BreedApiResponse {
  id: string;
  speciesId: string;
  name: string;
  origin?: string;
  description?: string;
  imageUrl?: string;
  size?: string;
  weight?: { min: number; max: number };
  lifespan?: { min: number; max: number };
  temperament?: string[];
  isPopular: boolean;
  breedType?: 'Pure' | 'Mixed' | 'Hybrid';
  allowsUserVariantLabel?: boolean;
}

/**
 * BreedsService - State management and API calls for Breeds module
 * Uses signals for reactive state management
 */
@Injectable({ providedIn: 'root' })
export class BreedsService {
  private readonly http = inject(HttpClient);

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
   * Load all species from backend API
   */
  loadSpecies(): Observable<Species[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<SpeciesApiResponse[]>(`${environment.apiUrl}/species`).pipe(
      map(response => this.mapSpeciesResponse(response)),
      tap(species => this.speciesList.set(species)),
      catchError(err => {
        console.error('Failed to load species from API, using fallback:', err);
        this.error.set('Errore nel caricamento delle specie');
        // Fallback to mock data if API fails
        this.speciesList.set(MOCK_SPECIES);
        return of(MOCK_SPECIES);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Map API response to frontend Species model
   */
  private mapSpeciesResponse(response: SpeciesApiResponse[]): Species[] {
    return response.map(s => ({
      id: s.id,
      name: s.name,
      icon: s.emoji || 'pets',
      imageUrl: s.imageUrl || `/assets/species/${s.code}.jpg`,
      category: s.category as any,
      description: s.description
    }));
  }

  /**
   * Get breeds by species ID from backend API
   */
  getBreedsBySpecies(speciesId: string): Observable<Breed[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<BreedApiResponse[]>(`${environment.apiUrl}/species/${speciesId}/breeds`).pipe(
      map(response => this.mapBreedsResponse(response)),
      tap(breeds => this.breedsList.set(breeds)),
      catchError(err => {
        console.error('Failed to load breeds from API, using fallback:', err);
        // Fallback to mock data filtered by speciesId
        const filtered = MOCK_BREEDS.filter(b => b.speciesId === speciesId);
        this.breedsList.set(filtered);
        return of(filtered);
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

    return this.http.get<BreedApiResponse>(`${environment.apiUrl}/breeds/${breedId}`).pipe(
      map(response => this.mapBreedResponse(response)),
      tap(breed => {
        if (breed) {
          this.selectedBreed.set(breed);
        } else {
          this.error.set('Razza non trovata');
        }
      }),
      catchError(err => {
        console.error('Failed to load breed details from API:', err);
        // Fallback to mock data
        const breed = MOCK_BREEDS.find(b => b.id === breedId) || null;
        if (breed) {
          this.selectedBreed.set(breed);
        } else {
          this.error.set('Razza non trovata');
        }
        return of(breed);
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
      imageUrl: b.imageUrl || `/assets/breeds/${b.id}.jpg`,
      breedType: b.breedType,
      allowsUserVariantLabel: b.allowsUserVariantLabel ?? false,
      size: b.size ? {
        height: { min: 0, max: 0, unit: 'cm' },
        weight: b.weight ? { min: b.weight.min, max: b.weight.max, unit: 'kg' } : { min: 0, max: 0, unit: 'kg' },
        coat: '',
        colors: [],
        lifespan: b.lifespan
      } : undefined,
      temperament: b.temperament ? {
        energy: 'media',
        sociality: 'media',
        trainability: 'media',
        traits: b.temperament
      } : undefined,
      history: b.description
    };
  }

  /**
   * Analyze photo to identify breed (AI feature)
   * MVP: Returns mock result after simulated delay
   */
  analyzePhoto(file: File, description: string): Observable<BreedAnalysisResult> {
    this.isLoading.set(true);
    this.error.set(null);

    // MVP: Simulate AI analysis with mock result
    const mockResult: BreedAnalysisResult = {
      breed: MOCK_BREEDS.find(b => b.id === 'pug') || MOCK_BREEDS[0],
      confidence: 0.87,
      alternativeBreeds: [
        {
          breed: MOCK_BREEDS.find(b => b.id === 'labrador') || MOCK_BREEDS[1],
          confidence: 0.45
        }
      ],
      analysisDetails: 'Analisi basata su caratteristiche fisiche: muso corto, orecchie piccole, corporatura compatta.'
    };

    return of(mockResult).pipe(
      delay(2000), // Simulate AI processing time
      map(result => {
        this.selectedBreed.set(result.breed);
        this.isLoading.set(false);
        return result;
      })
    );

    // TODO: Real API
    // const formData = new FormData();
    // formData.append('photo', file);
    // formData.append('description', description);
    // return this.http.post<BreedAnalysisResult>('/api/breeds/analyze', formData);
  }

  /**
   * Search breeds by query - uses backend search API
   */
  searchBreeds(query: string): Observable<Breed[]> {
    this.searchQuery.set(query);

    if (!query.trim()) {
      return of(this.breedsList());
    }

    return this.http.get<BreedApiResponse[]>(`${environment.apiUrl}/breeds/search`, {
      params: { q: query }
    }).pipe(
      map(response => this.mapBreedsResponse(response)),
      catchError(err => {
        console.error('Failed to search breeds:', err);
        // Fallback to local filtering
        const filtered = this.breedsList().filter(b =>
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          b.origin.toLowerCase().includes(query.toLowerCase())
        );
        return of(filtered);
      })
    );
  }

  /**
   * Select a species
   */
  selectSpecies(species: Species | null): void {
    this.selectedSpecies.set(species);
    if (species) {
      this.getBreedsBySpecies(species.id).subscribe();
    } else {
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
   * Get species by ID
   */
  getSpeciesById(id: string): Species | undefined {
    return this.speciesList().find(s => s.id === id) || MOCK_SPECIES.find(s => s.id === id);
  }

  /**
   * Get breed by ID (sync)
   */
  getBreedById(id: string): Breed | undefined {
    return this.breedsList().find(b => b.id === id) || MOCK_BREEDS.find(b => b.id === id);
  }
}
