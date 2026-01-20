import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, shareReplay, switchMap, timeout } from 'rxjs';
import { BreedDetail, BreedCategory } from '../../breeds/breeds.models';

/**
 * Breed list item (lightweight for search/browse)
 */
export interface BreedListItem {
  id: string;
  name: string;
  image: string;
  category: string;
  species: string;
  path: string;
}

/**
 * Breeds index structure
 */
export interface BreedsIndex {
  generated: string;
  lang: string;
  stats: {
    categories: number;
    species: number;
    breeds: number;
  };
  categories: Record<string, {
    species: Record<string, Array<{ id: string; name: string; image: string }>>;
  }>;
}

/**
 * BreedsDataService - Loads breed data from static JSON files
 *
 * JSON files are built from MD content at build time.
 * Location: /assets/data/breeds/{lang}/
 */
@Injectable({ providedIn: 'root' })
export class BreedsDataService {
  private readonly http = inject(HttpClient);
  private readonly basePath = '/assets/data/breeds';

  // Cache
  private indexCache: Map<string, Observable<BreedsIndex>> = new Map();
  private listCache: Map<string, Observable<BreedListItem[]>> = new Map();
  private detailCache: Map<string, Observable<BreedDetail>> = new Map();

  /**
   * Get breeds index for a language
   */
  getIndex(lang = 'it'): Observable<BreedsIndex> {
    const cacheKey = `index-${lang}`;

    if (!this.indexCache.has(cacheKey)) {
      const request = this.http.get<BreedsIndex>(`${this.basePath}/${lang}/index.json`).pipe(
        timeout(5000),
        catchError(err => {
          console.warn('Failed to load breeds index:', err);
          return of(this.getEmptyIndex(lang));
        }),
        shareReplay(1)
      );
      this.indexCache.set(cacheKey, request);
    }

    return this.indexCache.get(cacheKey)!;
  }

  /**
   * Get flat breeds list for search/browse
   */
  getBreedsList(lang = 'it'): Observable<BreedListItem[]> {
    const cacheKey = `list-${lang}`;

    if (!this.listCache.has(cacheKey)) {
      const request = this.http.get<BreedListItem[]>(`${this.basePath}/${lang}/breeds-list.json`).pipe(
        timeout(5000),
        catchError(err => {
          console.warn('Failed to load breeds list:', err);
          return of([]);
        }),
        shareReplay(1)
      );
      this.listCache.set(cacheKey, request);
    }

    return this.listCache.get(cacheKey)!;
  }

  /**
   * Get breed detail by ID (finds path automatically from breeds list)
   */
  getBreedDetail(id: string, lang = 'it'): Observable<BreedDetail | null> {
    const cacheKey = `detail-${lang}-${id}`;

    if (this.detailCache.has(cacheKey)) {
      return this.detailCache.get(cacheKey)!;
    }

    // First find the breed path from the list, then load detail
    return this.getBreedsList(lang).pipe(
      map(breeds => breeds.find(b => b.id === id)),
      switchMap(breedItem => {
        if (!breedItem) {
          console.warn(`Breed not found in list: ${id}`);
          return of(null);
        }

        const detailPath = `${this.basePath}/${lang}/${breedItem.path}.json`;

        return this.http.get<BreedDetail>(detailPath).pipe(
          timeout(5000),
          catchError(err => {
            console.warn(`Failed to load breed detail: ${id}`, err);
            return of(null);
          })
        );
      }),
      shareReplay(1)
    );
  }

  /**
   * Get breed detail directly by path
   */
  getBreedDetailByPath(
    category: BreedCategory,
    species: string,
    breedId: string,
    lang = 'it'
  ): Observable<BreedDetail | null> {
    const cacheKey = `detail-${lang}-${breedId}`;

    if (this.detailCache.has(cacheKey)) {
      return this.detailCache.get(cacheKey)!;
    }

    const detailPath = `${this.basePath}/${lang}/${category}/${species}/${breedId}.json`;

    const request = this.http.get<BreedDetail>(detailPath).pipe(
      timeout(5000), // 5 second timeout
      catchError(err => {
        console.warn(`Failed to load breed detail: ${breedId}`, err);
        return of(null);
      }),
      shareReplay(1)
    );

    this.detailCache.set(cacheKey, request as Observable<BreedDetail>);
    return request;
  }

  /**
   * Search breeds by name
   */
  searchBreeds(query: string, lang = 'it'): Observable<BreedListItem[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    const lowerQuery = query.toLowerCase();

    return this.getBreedsList(lang).pipe(
      map(breeds => breeds.filter(b =>
        b.name.toLowerCase().includes(lowerQuery) ||
        b.id.includes(lowerQuery)
      )),
      map(results => results.slice(0, 20)) // Limit results
    );
  }

  /**
   * Get breeds by category
   */
  getBreedsByCategory(category: BreedCategory, lang = 'it'): Observable<BreedListItem[]> {
    return this.getBreedsList(lang).pipe(
      map(breeds => breeds.filter(b => b.category === category))
    );
  }

  /**
   * Get breeds by species
   */
  getBreedsBySpecies(species: string, lang = 'it'): Observable<BreedListItem[]> {
    return this.getBreedsList(lang).pipe(
      map(breeds => breeds.filter(b => b.species === species))
    );
  }

  /**
   * Get category statistics
   */
  getCategoryStats(lang = 'it'): Observable<Record<string, number>> {
    return this.getBreedsList(lang).pipe(
      map(breeds => {
        const stats: Record<string, number> = {};
        for (const breed of breeds) {
          stats[breed.category] = (stats[breed.category] || 0) + 1;
        }
        return stats;
      })
    );
  }

  /**
   * Get species statistics
   */
  getSpeciesStats(lang = 'it'): Observable<Record<string, number>> {
    return this.getBreedsList(lang).pipe(
      map(breeds => {
        const stats: Record<string, number> = {};
        for (const breed of breeds) {
          stats[breed.species] = (stats[breed.species] || 0) + 1;
        }
        return stats;
      })
    );
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.indexCache.clear();
    this.listCache.clear();
    this.detailCache.clear();
  }

  /**
   * Empty index for fallback
   */
  private getEmptyIndex(lang: string): BreedsIndex {
    return {
      generated: new Date().toISOString(),
      lang,
      stats: { categories: 0, species: 0, breeds: 0 },
      categories: {}
    };
  }
}
