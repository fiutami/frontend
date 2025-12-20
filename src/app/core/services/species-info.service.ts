import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Insight section from backend
 */
export interface InsightSection {
  id: string;
  code: string;
  title: string;
  titleIt: string;
  titleEn: string;
  icon: string;
  description?: string;
  displayOrder: number;
}

/**
 * Age conversion entry
 */
export interface AgeConversion {
  petMonths: number;
  humanYears: number;
  stage: string;
  stageIt: string;
  stageEn: string;
}

/**
 * Dog age conversion with size category
 */
export interface DogAgeConversion extends AgeConversion {
  sizeCategory: 'small' | 'medium' | 'large' | 'giant';
}

/**
 * SpeciesInfoService - Provides species-related data from backend
 * - Insight sections (6 sections for breed info cards)
 * - Age conversion tables (cat, dog by size)
 */
@Injectable({ providedIn: 'root' })
export class SpeciesInfoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Cached data
  private insightSectionsCache: InsightSection[] | null = null;
  private catAgeConversionCache: AgeConversion[] | null = null;
  private dogAgeConversionCache: DogAgeConversion[] | null = null;

  /**
   * Get insight sections for breed info display
   */
  getInsightSections(): Observable<InsightSection[]> {
    if (this.insightSectionsCache) {
      return of(this.insightSectionsCache);
    }

    return this.http.get<InsightSection[]>(`${this.apiUrl}/species/insight-sections`).pipe(
      map(sections => {
        this.insightSectionsCache = sections;
        return sections;
      }),
      catchError(err => {
        console.warn('Failed to load insight sections, using defaults:', err);
        return of(this.getDefaultInsightSections());
      })
    );
  }

  /**
   * Get cat age conversion table
   */
  getCatAgeConversion(): Observable<AgeConversion[]> {
    if (this.catAgeConversionCache) {
      return of(this.catAgeConversionCache);
    }

    return this.http.get<AgeConversion[]>(`${this.apiUrl}/species/age-conversion/cat`).pipe(
      map(conversions => {
        this.catAgeConversionCache = conversions;
        return conversions;
      }),
      catchError(err => {
        console.warn('Failed to load cat age conversion:', err);
        return of([]);
      })
    );
  }

  /**
   * Get dog age conversion table (includes size categories)
   */
  getDogAgeConversion(): Observable<DogAgeConversion[]> {
    if (this.dogAgeConversionCache) {
      return of(this.dogAgeConversionCache);
    }

    return this.http.get<DogAgeConversion[]>(`${this.apiUrl}/species/age-conversion/dog`).pipe(
      map(conversions => {
        this.dogAgeConversionCache = conversions;
        return conversions;
      }),
      catchError(err => {
        console.warn('Failed to load dog age conversion:', err);
        return of([]);
      })
    );
  }

  /**
   * Calculate human-equivalent age for a pet
   */
  calculateHumanAge(
    speciesCode: string,
    petAgeMonths: number,
    sizeCategory?: 'small' | 'medium' | 'large' | 'giant'
  ): Observable<{ humanYears: number; stage: string }> {
    if (speciesCode === 'cat') {
      return this.getCatAgeConversion().pipe(
        map(conversions => this.findAgeConversion(conversions, petAgeMonths))
      );
    } else if (speciesCode === 'dog') {
      return this.getDogAgeConversion().pipe(
        map(conversions => {
          const filtered = sizeCategory
            ? conversions.filter(c => c.sizeCategory === sizeCategory)
            : conversions.filter(c => c.sizeCategory === 'medium');
          return this.findAgeConversion(filtered, petAgeMonths);
        })
      );
    }

    // For other species, use a simple approximation
    return of({
      humanYears: Math.round(petAgeMonths / 12 * 7), // Simple 7x multiplier
      stage: petAgeMonths < 12 ? 'cucciolo' : petAgeMonths < 84 ? 'adulto' : 'senior'
    });
  }

  /**
   * Find the closest age conversion entry
   */
  private findAgeConversion(
    conversions: AgeConversion[],
    petAgeMonths: number
  ): { humanYears: number; stage: string } {
    if (conversions.length === 0) {
      return { humanYears: 0, stage: 'sconosciuto' };
    }

    // Find the closest match
    let closest = conversions[0];
    let minDiff = Math.abs(conversions[0].petMonths - petAgeMonths);

    for (const conv of conversions) {
      const diff = Math.abs(conv.petMonths - petAgeMonths);
      if (diff < minDiff) {
        minDiff = diff;
        closest = conv;
      }
    }

    return {
      humanYears: closest.humanYears,
      stage: closest.stageIt || closest.stage
    };
  }

  /**
   * Default insight sections when API unavailable
   */
  private getDefaultInsightSections(): InsightSection[] {
    return [
      { id: '1', code: 'dna', title: 'DNA Bestiale', titleIt: 'DNA Bestiale', titleEn: 'Beast DNA', icon: 'biotech', displayOrder: 1 },
      { id: '2', code: 'size', title: 'Stazza & Pelliccia', titleIt: 'Stazza & Pelliccia', titleEn: 'Size & Coat', icon: 'straighten', displayOrder: 2 },
      { id: '3', code: 'temperament', title: 'Indole da Zampa', titleIt: 'Indole da Zampa', titleEn: 'Temperament', icon: 'pets', displayOrder: 3 },
      { id: '4', code: 'rituals', title: 'Rituali', titleIt: 'Rituali', titleEn: 'Rituals', icon: 'schedule', displayOrder: 4 },
      { id: '5', code: 'health', title: 'Rischi di salute', titleIt: 'Rischi di salute', titleEn: 'Health Risks', icon: 'healing', displayOrder: 5 },
      { id: '6', code: 'history', title: 'Oltre l\'aspetto', titleIt: 'Oltre l\'aspetto', titleEn: 'Beyond Appearance', icon: 'auto_stories', displayOrder: 6 },
    ];
  }

  /**
   * Clear cache (useful after language change)
   */
  clearCache(): void {
    this.insightSectionsCache = null;
    this.catAgeConversionCache = null;
    this.dogAgeConversionCache = null;
  }
}
