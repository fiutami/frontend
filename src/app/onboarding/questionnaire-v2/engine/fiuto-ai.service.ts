/**
 * Fiuto AI Service - Questionnaire Wrapper
 *
 * Thin wrapper around FiutoAiGlobalService for backward compatibility.
 * Maps questionnaire-specific ChatContext → FiutoContext and delegates.
 *
 * @version 2.0
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserPreferenceProfile } from '../models/profile.models';
import { MatchResult } from './matching-engine.service';
import { FiutoAiGlobalService } from '../../../core/services/fiuto-ai-global.service';
import { FiutoContext, FiutoMode } from '../../../core/models/fiuto-ai.models';

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
  private readonly globalAi = inject(FiutoAiGlobalService);
  private readonly REQUEST_TIMEOUT_MS = 35000;

  // Delegate signals from global service
  readonly messages = computed(() =>
    this.globalAi.messages().map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      isStreaming: m.isStreaming,
    } as ChatMessage))
  );

  readonly isTyping = this.globalAi.isTyping;
  readonly error = this.globalAi.error;

  // Kept for API compat
  private streamingResponse$ = new Subject<string>();

  /**
   * Send a message to Fiuto AI (delegates to global service).
   */
  async sendMessage(message: string, context: ChatContext): Promise<void> {
    const fiutoContext = this.mapContext(context);
    await this.globalAi.sendMessage(message, fiutoContext);
  }

  /**
   * Send message without streaming (simpler).
   */
  async sendMessageSimple(message: string, context: ChatContext): Promise<string> {
    const fiutoContext = this.mapContext(context);
    return this.globalAi.sendMessage(message, fiutoContext);
  }

  /**
   * Get explanation for a breed recommendation.
   * This still calls the dedicated endpoint directly.
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
      ).toPromise();

      return response?.explanation ?? this.getDefaultExplanation(breed);
    } catch {
      return this.getDefaultExplanation(breed);
    }
  }

  clearHistory(): void {
    this.globalAi.clearHistory();
  }

  addSystemMessage(content: string): void {
    this.globalAi.addSystemMessage(content);
  }

  getHistory(): ChatMessage[] {
    return this.globalAi.getHistory().map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      isStreaming: m.isStreaming,
    }));
  }

  // ─── Private helpers ────────────────────────────────────────

  private mapContext(ctx: ChatContext): Partial<FiutoContext> {
    const modeMap: Record<string, FiutoMode> = {
      questionnaire: 'questionnaire',
      results: 'results',
      general: 'general',
    };

    return {
      route: 'onboarding',
      mode: modeMap[ctx.conversationPhase] ?? 'general',
      currentQuestionId: ctx.currentQuestionId,
      currentQuestionText: ctx.currentQuestionText,
      userProfile: this.compressProfile(ctx.userProfile) as unknown as Record<string, unknown>,
      matchResults: ctx.matchResults,
    };
  }

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

  private getDefaultExplanation(breed: MatchResult): string {
    const reasons = breed.matchReasons.map(r => r.reason).join('. ');
    const warnings = breed.tradeoffs.length > 0
      ? `\n\nDa considerare: ${breed.tradeoffs.map(t => t.description).join('. ')}`
      : '';

    return `${breed.breed.name} è consigliato perché: ${reasons}.${warnings}`;
  }
}
