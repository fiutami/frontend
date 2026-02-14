import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import {
  QuestionnaireAnswers,
  QuestionKey,
  EMPTY_QUESTIONNAIRE,
  QUESTIONNAIRE_STORAGE_KEY,
} from './species-questionnaire.models';

/**
 * API Response interfaces
 */
interface QuestionnaireResponse {
  id: string;
  currentStep: number;
  status: string;
  q1_Time: string | null;
  q2_Presence: string | null;
  q3_Space: string | null;
  q4_Allergies: string | null;
  q5_Desire: string | null;
  q6_Care: string | null;
}

export interface QuestionnaireResultResponse {
  questionnaireId: string;
  recommendedSpeciesCode: string;
  recommendedSpeciesName: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  matchScore: number;
}

export interface SpeciesDto {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  breedPolicy: 'None' | 'Optional' | 'Required';
}

/**
 * SpeciesQuestionnaireService - Manages questionnaire state
 *
 * Signal-based service for managing the species questionnaire answers.
 * Syncs with backend API when user is authenticated, falls back to sessionStorage otherwise.
 */
@Injectable({ providedIn: 'root' })
export class SpeciesQuestionnaireService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/questionnaire`;

  /** Internal signal for answers state */
  private answersSignal = signal<QuestionnaireAnswers>(EMPTY_QUESTIONNAIRE);

  /** Internal signal for questionnaire ID */
  private questionnaireIdSignal = signal<string | null>(null);

  /** Internal signal for result */
  private resultSignal = signal<QuestionnaireResultResponse | null>(null);

  /** Public readonly signal for answers */
  readonly answers = this.answersSignal.asReadonly();

  /** Public readonly signal for result */
  readonly result = this.resultSignal.asReadonly();

  /** Computed signal: count of answered questions */
  readonly answeredCount = computed(() => {
    const answers = this.answersSignal();
    return Object.values(answers).filter((v) => v !== null).length;
  });

  /** Computed signal: total questions */
  readonly totalQuestions = computed(() => {
    return Object.keys(this.answersSignal()).length;
  });

  /** Computed signal: is questionnaire complete */
  readonly isComplete = computed(() => {
    return this.answeredCount() === this.totalQuestions();
  });

  /** Computed signal: current progress percentage */
  readonly progressPercentage = computed(() => {
    return Math.round((this.answeredCount() / this.totalQuestions()) * 100);
  });

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Start or resume questionnaire
   */
  async startQuestionnaire(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      // Fallback to sessionStorage if not logged in
      return;
    }

    try {
      const res = await firstValueFrom(
        this.http.post<QuestionnaireResponse>(`${this.apiUrl}/start`, {})
      );
      this.questionnaireIdSignal.set(res.id);
      this.syncFromResponse(res);
    } catch (error) {
      console.warn('Failed to start questionnaire on server, using local storage:', error);
    }
  }

  /**
   * Set answer for a specific question
   */
  async setAnswer(questionId: QuestionKey, value: string): Promise<void> {
    // Update local state immediately
    const updated = { ...this.answersSignal(), [questionId]: value };
    this.answersSignal.set(updated);
    this.saveToStorage(updated);

    // Sync with server if authenticated
    if (this.auth.isAuthenticated()) {
      try {
        await firstValueFrom(
          this.http.post<QuestionnaireResponse>(`${this.apiUrl}/answer`, {
            questionKey: questionId,
            value: value
          })
        );
      } catch (error) {
        console.warn('Failed to save answer to server:', error);
      }
    }
  }

  /**
   * Complete questionnaire and get result
   */
  async completeQuestionnaire(): Promise<QuestionnaireResultResponse> {
    if (this.auth.isAuthenticated()) {
      try {
        const res = await firstValueFrom(
          this.http.post<QuestionnaireResultResponse>(`${this.apiUrl}/complete`, {})
        );
        this.resultSignal.set(res);
        return res;
      } catch (error) {
        console.warn('Failed to complete questionnaire on server:', error);
      }
    }

    // Fallback: return mock result based on local answers
    const answers = this.answersSignal();
    const mockResult = this.calculateLocalResult(answers);
    this.resultSignal.set(mockResult);
    return mockResult;
  }

  /**
   * Get answer for a specific question
   */
  getAnswer(questionId: QuestionKey): string | null {
    return this.answersSignal()[questionId];
  }

  /**
   * Check if a specific question is answered
   */
  isQuestionAnswered(questionId: QuestionKey): boolean {
    return this.answersSignal()[questionId] !== null;
  }

  /**
   * Get all species from server
   * Tries /api/species first, falls back to /api/questionnaire/species
   */
  async getAllSpecies(): Promise<SpeciesDto[]> {
    try {
      // Try main species endpoint first
      return await firstValueFrom(
        this.http.get<SpeciesDto[]>(`${environment.apiUrl}/species`)
      );
    } catch (error) {
      console.warn('Failed to get species from /api/species, trying questionnaire endpoint:', error);
      try {
        // Fallback to questionnaire endpoint
        return await firstValueFrom(
          this.http.get<SpeciesDto[]>(`${this.apiUrl}/species`)
        );
      } catch (fallbackError) {
        console.warn('Failed to get species list:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Reset all answers
   */
  reset(): void {
    this.answersSignal.set(EMPTY_QUESTIONNAIRE);
    this.questionnaireIdSignal.set(null);
    this.resultSignal.set(null);
    sessionStorage.removeItem(QUESTIONNAIRE_STORAGE_KEY);
  }

  /**
   * Sync local state from API response
   */
  private syncFromResponse(res: QuestionnaireResponse): void {
    this.answersSignal.set({
      q1_time: res.q1_Time,
      q2_presence: res.q2_Presence,
      q3_space: res.q3_Space,
      q4_allergies: res.q4_Allergies,
      q5_desire: res.q5_Desire,
      q6_care: res.q6_Care
    });
  }

  /**
   * Load answers from sessionStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(QUESTIONNAIRE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as QuestionnaireAnswers;
        this.answersSignal.set({ ...EMPTY_QUESTIONNAIRE, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load questionnaire from storage:', error);
      this.reset();
    }
  }

  /**
   * Save answers to sessionStorage
   */
  private saveToStorage(answers: QuestionnaireAnswers): void {
    try {
      sessionStorage.setItem(QUESTIONNAIRE_STORAGE_KEY, JSON.stringify(answers));
    } catch (error) {
      console.warn('Failed to save questionnaire to storage:', error);
    }
  }

  /**
   * Calculate local result when server is not available
   */
  private calculateLocalResult(answers: QuestionnaireAnswers): QuestionnaireResultResponse {
    // Simple local matching logic
    let recommendedSpecies = 'gatto';
    let speciesName = 'Gatto';
    let category = 'mammifero';
    let description = 'Un compagno indipendente ma affettuoso, perfetto per chi cerca compagnia senza troppo impegno.';

    // Basic matching based on answers
    if (answers.q1_time === 'molto' && answers.q3_space === 'giardino') {
      recommendedSpecies = 'cane_medio';
      speciesName = 'Cane media taglia';
      description = 'Equilibrato e versatile, adatto a famiglie attive.';
    } else if (answers.q1_time === 'poco' && answers.q4_allergies === 'si') {
      recommendedSpecies = 'pesce_rosso';
      speciesName = 'Pesce rosso';
      category = 'pesce';
      description = 'Classico e rilassante, perfetto per iniziare.';
    } else if (answers.q5_desire === 'tranquillita') {
      recommendedSpecies = 'tartaruga';
      speciesName = 'Tartaruga';
      category = 'rettile';
      description = 'Longeva e tranquilla, richiede poche cure.';
    } else if (answers.q5_desire === 'indipendente') {
      recommendedSpecies = 'gatto';
      speciesName = 'Gatto';
      description = 'Un compagno indipendente ma affettuoso.';
    }

    return {
      questionnaireId: '',
      recommendedSpeciesCode: recommendedSpecies,
      recommendedSpeciesName: speciesName,
      category: category,
      description: description,
      imageUrl: null,
      matchScore: 75
    };
  }
}
