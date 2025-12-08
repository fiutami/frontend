import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import {
  Species,
  Breed,
  BreedAnalysisResult,
  MOCK_SPECIES,
  MOCK_BREEDS
} from './models/breed.model';

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
   * Load all species - MVP uses mock data
   */
  loadSpecies(): Observable<Species[]> {
    this.isLoading.set(true);
    this.error.set(null);

    // MVP: Use mock data with simulated delay
    return of(MOCK_SPECIES).pipe(
      delay(300),
      map(species => {
        this.speciesList.set(species);
        this.isLoading.set(false);
        return species;
      })
    );

    // TODO: Real API integration
    // return this.http.get<Species[]>('/api/species').pipe(
    //   tap(species => this.speciesList.set(species)),
    //   catchError(err => {
    //     this.error.set('Errore nel caricamento delle specie');
    //     throw err;
    //   }),
    //   finalize(() => this.isLoading.set(false))
    // );
  }

  /**
   * Get breeds by species ID
   */
  getBreedsBySpecies(speciesId: string): Observable<Breed[]> {
    this.isLoading.set(true);
    this.error.set(null);

    // MVP: Filter mock data
    const filtered = MOCK_BREEDS.filter(b => b.speciesId === speciesId);
    return of(filtered).pipe(
      delay(200),
      map(breeds => {
        this.breedsList.set(breeds);
        this.isLoading.set(false);
        return breeds;
      })
    );

    // TODO: Real API
    // return this.http.get<Breed[]>(`/api/species/${speciesId}/breeds`);
  }

  /**
   * Get breed details by ID
   */
  getBreedDetails(breedId: string): Observable<Breed | null> {
    this.isLoading.set(true);
    this.error.set(null);

    // MVP: Find in mock data
    const breed = MOCK_BREEDS.find(b => b.id === breedId) || null;
    return of(breed).pipe(
      delay(200),
      map(result => {
        if (result) {
          this.selectedBreed.set(result);
        } else {
          this.error.set('Razza non trovata');
        }
        this.isLoading.set(false);
        return result;
      })
    );

    // TODO: Real API
    // return this.http.get<Breed>(`/api/breeds/${breedId}`);
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
   * Search breeds by query
   */
  searchBreeds(query: string): Observable<Breed[]> {
    this.searchQuery.set(query);

    if (!query.trim()) {
      return of(MOCK_BREEDS);
    }

    const filtered = MOCK_BREEDS.filter(b =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.origin.toLowerCase().includes(query.toLowerCase())
    );

    return of(filtered).pipe(delay(100));
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
