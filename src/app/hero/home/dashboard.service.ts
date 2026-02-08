import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap, forkJoin, map } from 'rxjs';
import { AuthService, User } from '../../core/services/auth.service';
import { PetService } from '../../core/services/pet.service';
import { SpeciesQuestionnaireService, QuestionnaireResultResponse } from '../species-questionnaire/species-questionnaire.service';
import { PetSummaryResponse } from '../../core/models/pet.models';
import { environment } from '../../../environments/environment';

// ============================================================
// Dashboard Models
// ============================================================

export interface Suggestion {
  id: string;
  type: 'walk' | 'health' | 'event' | 'discovery' | 'tip';
  icon: string;
  title: string;
  description?: string;
  actionUrl?: string;
  priority: number;
}

export interface DashboardData {
  user: {
    name: string;
    email: string;
  };
  pet?: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    photoUrl: string | null;
    age: string;
    weight?: number;
  };
  prototype?: {
    speciesId: string;
    speciesName: string;
    speciesCode: string;
    compatibility: number;
    description?: string;
  };
  suggestions: Suggestion[];
}

export type UserPath = 'A' | 'B' | 'unknown';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private petService = inject(PetService);
  private questionnaireService = inject(SpeciesQuestionnaireService);
  private readonly suggestionsApiUrl = `${environment.apiUrl}/suggestions`;

  // State signals
  private dashboardDataSignal = signal<DashboardData | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private userPathSignal = signal<UserPath>('unknown');

  // Public readonly signals
  readonly dashboardData = this.dashboardDataSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly userPath = this.userPathSignal.asReadonly();

  // Computed signals
  readonly isPathA = computed(() => this.userPathSignal() === 'A');
  readonly isPathB = computed(() => this.userPathSignal() === 'B');
  readonly hasPet = computed(() => !!this.dashboardDataSignal()?.pet);
  readonly hasPrototype = computed(() => !!this.dashboardDataSignal()?.prototype);

  /**
   * Load dashboard data for current user
   */
  loadDashboard(): Observable<DashboardData> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.loadingSignal.set(false);
      this.errorSignal.set('User not authenticated');
      return of(this.createEmptyDashboard());
    }

    // Load pets to determine path
    return this.petService.loadPets().pipe(
      map(petsResponse => {
        const hasPets = petsResponse.totalCount > 0;
        const primaryPet = petsResponse.pets[0];

        // Determine user path
        if (hasPets) {
          this.userPathSignal.set('A');
        } else {
          // Check if user completed questionnaire (Path B)
          const questionnaireResult = this.questionnaireService.result();
          if (questionnaireResult) {
            this.userPathSignal.set('B');
          } else {
            this.userPathSignal.set('unknown');
          }
        }

        const dashboardData = this.buildDashboardData(user, primaryPet);
        this.dashboardDataSignal.set(dashboardData);
        this.loadingSignal.set(false);
        return dashboardData;
      }),
      catchError(error => {
        console.error('Failed to load dashboard:', error);
        this.loadingSignal.set(false);
        this.errorSignal.set('Failed to load dashboard data');
        const emptyData = this.createEmptyDashboard(user);
        this.dashboardDataSignal.set(emptyData);
        return of(emptyData);
      })
    );
  }

  /**
   * Get AI-powered suggestions for the user
   */
  getSuggestions(): Observable<Suggestion[]> {
    const MOCK_SUGGESTIONS = this.getMockSuggestions();

    return this.http.get<Suggestion[]>(this.suggestionsApiUrl).pipe(
      tap(suggestions => {
        const current = this.dashboardDataSignal();
        if (current) {
          this.dashboardDataSignal.set({
            ...current,
            suggestions
          });
        }
      }),
      catchError(err => {
        console.warn('API failed, using fallback:', err);
        const mockSuggestions = MOCK_SUGGESTIONS;
        const current = this.dashboardDataSignal();
        if (current) {
          this.dashboardDataSignal.set({
            ...current,
            suggestions: mockSuggestions
          });
        }
        return of(mockSuggestions);
      })
    );
  }

  /**
   * Refresh dashboard data
   */
  refresh(): void {
    this.loadDashboard().subscribe();
  }

  // ============================================================
  // Private Methods
  // ============================================================

  private buildDashboardData(user: User, pet?: PetSummaryResponse): DashboardData {
    const questionnaireResult = this.questionnaireService.result();

    return {
      user: {
        name: user.firstName || 'Utente',
        email: user.email
      },
      pet: pet ? {
        id: pet.id,
        name: pet.name,
        species: pet.speciesName,
        photoUrl: pet.profilePhotoUrl,
        age: pet.calculatedAge
      } : undefined,
      prototype: questionnaireResult ? {
        speciesId: questionnaireResult.questionnaireId,
        speciesName: questionnaireResult.recommendedSpeciesName,
        speciesCode: questionnaireResult.recommendedSpeciesCode,
        compatibility: questionnaireResult.matchScore,
        description: questionnaireResult.description || undefined
      } : undefined,
      suggestions: this.getMockSuggestions()
    };
  }

  private createEmptyDashboard(user?: User | null): DashboardData {
    return {
      user: {
        name: user?.firstName || 'Utente',
        email: user?.email || ''
      },
      suggestions: this.getMockSuggestions()
    };
  }

  private getMockSuggestions(): Suggestion[] {
    const path = this.userPathSignal();

    if (path === 'A') {
      // Suggestions for pet owners
      return [
        {
          id: 'walk-1',
          type: 'walk',
          icon: 'directions_walk',
          title: 'Tempo di passeggiata!',
          description: 'Il meteo e perfetto per una passeggiata',
          priority: 1
        },
        {
          id: 'health-1',
          type: 'health',
          icon: 'vaccines',
          title: 'Vaccino in scadenza',
          description: 'Tra 7 giorni scade il vaccino',
          actionUrl: '/home/calendar',
          priority: 2
        },
        {
          id: 'discovery-1',
          type: 'discovery',
          icon: 'park',
          title: 'Nuovo parco dog-friendly',
          description: 'Scopri il parco vicino a te',
          actionUrl: '/home/map',
          priority: 3
        }
      ];
    } else {
      // Suggestions for potential pet owners (Path B)
      return [
        {
          id: 'tip-1',
          type: 'tip',
          icon: 'lightbulb',
          title: 'Prepara la tua casa',
          description: 'Consigli per accogliere il tuo nuovo amico',
          priority: 1
        },
        {
          id: 'discovery-2',
          type: 'discovery',
          icon: 'pets',
          title: 'Scopri le razze',
          description: 'Trova la razza perfetta per te',
          actionUrl: '/home/breeds',
          priority: 2
        },
        {
          id: 'event-1',
          type: 'event',
          icon: 'event',
          title: 'Fiera degli animali',
          description: 'Questo weekend nella tua citta',
          actionUrl: '/home/calendar',
          priority: 3
        }
      ];
    }
  }

  /**
   * Get species emoji for prototype card
   */
  getSpeciesEmoji(speciesCode: string): string {
    const emojiMap: Record<string, string> = {
      'cane_piccolo': '\uD83D\uDC36',
      'cane_medio': '\uD83D\uDC15',
      'cane_grande': '\uD83E\uDDAE',
      'gatto': '\uD83D\uDC31',
      'coniglio': '\uD83D\uDC30',
      'criceto': '\uD83D\uDC39',
      'pesce_rosso': '\uD83D\uDC20',
      'tartaruga': '\uD83D\uDC22',
      'pappagallo': '\uD83E\uDD9C',
      'canarino': '\uD83D\uDC26',
      'furetto': '\uD83E\uDDA8',
      'cavia': '\uD83D\uDC39'
    };
    return emojiMap[speciesCode] || '\uD83D\uDC3E';
  }
}
