/**
 * Fiuto AI Service - OpenRouter Integration
 *
 * Provides AI-powered chat assistance during questionnaire.
 * Uses backend proxy for OpenRouter to protect API keys.
 *
 * @version 1.1
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, Subject, catchError, filter, map, of, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserPreferenceProfile } from '../models/profile.models';
import { MatchResult } from './matching-engine.service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChatContext {
  currentQuestionId?: string;
  currentQuestionText?: string;
  userProfile: Partial<UserPreferenceProfile>;
  matchResults?: MatchResult[];
  conversationPhase: 'questionnaire' | 'results' | 'general';
}

export interface ProfileSummary {
  lifestyle?: string;
  space?: string;
  budget?: string;
  experience?: string;
  hasChildren?: boolean;
  hasOtherPets?: boolean;
  selectedSpecies?: string;
}

@Injectable({ providedIn: 'root' })
export class FiutoAiService {
  private readonly http = inject(HttpClient);
  private readonly REQUEST_TIMEOUT_MS = 35000;
  private readonly MAX_HISTORY = 10;

  // State
  private readonly _messages = signal<ChatMessage[]>([]);
  private readonly _isTyping = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly messages = this._messages.asReadonly();
  readonly isTyping = this._isTyping.asReadonly();
  readonly error = this._error.asReadonly();

  // Current streaming response
  private streamingResponse$ = new Subject<string>();

  /**
   * Send a message to Fiuto AI.
   */
  async sendMessage(message: string, context: ChatContext): Promise<void> {
    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    this._messages.update(msgs => [...msgs, userMessage]);
    this._isTyping.set(true);
    this._error.set(null);

    // Create assistant placeholder
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };

    this._messages.update(msgs => [...msgs, assistantMessage]);

    try {
      // Stream response
      const response = await this.chatStream(message, context);

      // Update message with final response
      this._messages.update(msgs =>
        msgs.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: response, isStreaming: false }
            : m
        )
      );
    } catch (err) {
      console.error('[FiutoAI] Chat error:', err);

      // Remove empty assistant message on error
      this._messages.update(msgs =>
        msgs.filter(m => m.id !== assistantMessage.id)
      );

      this._error.set('Mi dispiace, riprova tra poco.');
    } finally {
      this._isTyping.set(false);
    }
  }

  /**
   * Get streaming response from backend.
   */
  private async chatStream(message: string, context: ChatContext): Promise<string> {
    const profileSummary = this.compressProfile(context.userProfile);

    const body = {
      message,
      profileSummary,
      questionContext: context.currentQuestionId,
      questionText: context.currentQuestionText,
      phase: context.conversationPhase,
      historyLength: Math.min(this._messages().length, this.MAX_HISTORY)
    };

    return new Promise((resolve, reject) => {
      let fullResponse = '';

      this.http.post(`${environment.apiUrl}/ai/chat`, body, {
        responseType: 'text',
        observe: 'events',
        reportProgress: true
      }).pipe(
        timeout(this.REQUEST_TIMEOUT_MS),
        filter(event => event.type === HttpEventType.DownloadProgress || event.type === HttpEventType.Response),
        catchError(err => {
          console.error('[FiutoAI] HTTP error:', err);
          return of(null);
        })
      ).subscribe({
        next: (event) => {
          if (!event) {
            reject(new Error('Request failed'));
            return;
          }

          if (event.type === HttpEventType.Response) {
            fullResponse = (event.body as string) || fullResponse;
            resolve(fullResponse);
          }
        },
        error: (err) => reject(err),
        complete: () => {
          if (!fullResponse) {
            resolve(this.getFallbackResponse(context));
          }
        }
      });
    });
  }

  /**
   * Send message without streaming (simpler).
   */
  async sendMessageSimple(message: string, context: ChatContext): Promise<string> {
    const profileSummary = this.compressProfile(context.userProfile);

    try {
      const response = await this.http.post<{ response: string }>(
        `${environment.apiUrl}/ai/chat`,
        {
          message,
          profileSummary,
          questionContext: context.currentQuestionId,
          phase: context.conversationPhase
        }
      ).pipe(
        timeout(this.REQUEST_TIMEOUT_MS)
      ).toPromise();

      return response?.response ?? this.getFallbackResponse(context);
    } catch {
      return this.getFallbackResponse(context);
    }
  }

  /**
   * Get explanation for a breed recommendation.
   */
  async explainBreed(breed: MatchResult, profile: Partial<UserPreferenceProfile>): Promise<string> {
    const profileSummary = this.compressProfile(profile);

    try {
      const response = await this.http.post<{ explanation: string }>(
        `${environment.apiUrl}/ai/explain`,
        {
          breedId: breed.breed.id,
          breedName: breed.breed.name,
          score: breed.score,
          matchReasons: breed.matchReasons.map(r => r.reason),
          tradeoffs: breed.tradeoffs.map(t => t.description),
          profileSummary
        }
      ).pipe(
        timeout(this.REQUEST_TIMEOUT_MS)
      ).toPromise();

      return response?.explanation ?? this.getDefaultExplanation(breed);
    } catch {
      return this.getDefaultExplanation(breed);
    }
  }

  /**
   * Compress profile for API (never send PII).
   */
  private compressProfile(profile: Partial<UserPreferenceProfile>): ProfileSummary {
    const family = profile.RelationshipProfile?.familyComposition;
    const hasChildren = family === 'family_young_kids' || family === 'family_teens';

    return {
      lifestyle: profile.LifestyleProfile?.dailyTime,
      space: profile.EnvironmentProfile?.housingType,
      budget: profile.FinanceProfile?.monthlyBudget,
      experience: profile.LifestyleProfile?.experience,
      hasChildren,
      hasOtherPets: profile.LifestyleProfile?.hasOtherPets,
      selectedSpecies: profile.Route?.selectedSpecies
    };
  }

  /**
   * Get fallback response when API fails.
   */
  private getFallbackResponse(context: ChatContext): string {
    if (context.conversationPhase === 'questionnaire') {
      return 'Capisco la tua domanda! Rispondi in base alla tua situazione attuale. ' +
        'Non esiste una risposta giusta o sbagliata: l\'importante è essere sinceri. 🐾';
    }

    if (context.conversationPhase === 'results') {
      return 'Le razze suggerite sono basate sul tuo profilo. ' +
        'Ricorda che ogni animale è unico: considera di visitare un rifugio per conoscere il tuo futuro compagno! 💙';
    }

    return 'Sono qui per aiutarti a trovare l\'animale perfetto per te! ' +
      'Hai qualche domanda specifica? 🐕';
  }

  /**
   * Generate default explanation for a breed.
   */
  private getDefaultExplanation(breed: MatchResult): string {
    const reasons = breed.matchReasons.map(r => r.reason).join('. ');
    const warnings = breed.tradeoffs.length > 0
      ? `\n\nDa considerare: ${breed.tradeoffs.map(t => t.description).join('. ')}`
      : '';

    return `${breed.breed.name} è consigliato perché: ${reasons}.${warnings}`;
  }

  /**
   * Clear conversation history.
   */
  clearHistory(): void {
    this._messages.set([]);
    this._error.set(null);
  }

  /**
   * Add a system message (for context).
   */
  addSystemMessage(content: string): void {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'system',
      content,
      timestamp: Date.now()
    };
    this._messages.update(msgs => [...msgs, msg]);
  }

  /**
   * Get conversation history for context.
   */
  getHistory(): ChatMessage[] {
    return this._messages()
      .filter(m => m.role !== 'system')
      .slice(-this.MAX_HISTORY);
  }
}
