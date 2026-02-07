/**
 * AnalyticsService - Questionnaire Event Tracking
 *
 * Features:
 * - Batched event sending (max 25 events or 5 seconds)
 * - Beacon API on unload for reliable delivery
 * - Session tracking
 * - Automatic versioning (variant, experimentVersion, questionnaireVersion)
 *
 * Privacy:
 * - NO free text logging
 * - Only metadata: variant, questionId, time, outcome
 *
 * @version 1.0
 */

import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  QuestionnaireEventEnvelope,
  QuestionnaireEventType
} from '../models/analytics.models';
import { ExperimentService } from './experiment.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService implements OnDestroy {
  /**
   * Current questionnaire version.
   * Update this when questions/flow changes significantly.
   */
  private readonly QUESTIONNAIRE_VERSION = '1.1';

  /**
   * Maximum events to buffer before auto-flush.
   */
  private readonly MAX_BATCH = 25;

  /**
   * Flush interval in milliseconds.
   */
  private readonly FLUSH_INTERVAL_MS = 5000;

  private buffer: QuestionnaireEventEnvelope[] = [];
  private sessionId: string | null = null;
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  private readonly http = inject(HttpClient);
  private readonly experimentService = inject(ExperimentService);

  constructor() {
    if (typeof window !== 'undefined') {
      this.flushInterval = setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS);
      window.addEventListener('beforeunload', this.handleUnload);
    }
  }

  ngOnDestroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleUnload);
    }
    // Final flush on destroy
    this.flush(true);
  }

  /**
   * Start a new analytics session.
   * Called at questionnaire start.
   */
  startSession(): string {
    this.sessionId = crypto.randomUUID();
    return this.sessionId;
  }

  /**
   * Get current session ID, creating one if needed.
   */
  getSessionId(): string {
    if (!this.sessionId) {
      return this.startSession();
    }
    return this.sessionId;
  }

  /**
   * Track a questionnaire event.
   *
   * @param eventType - Type of event (questionnaire_started, question_answered, etc.)
   * @param payload - Additional data (NO free text, only structured metadata)
   */
  track(eventType: QuestionnaireEventType, payload: Record<string, unknown> = {}): void {
    const event: QuestionnaireEventEnvelope = {
      eventType,
      timestamp: Date.now(),
      variant: this.experimentService.getVariant(),
      experimentVersion: this.experimentService.getExperimentVersion(),
      questionnaireVersion: this.QUESTIONNAIRE_VERSION,
      sessionId: this.getSessionId(),
      deviceId: this.experimentService.getDeviceId(),
      payload
    };

    this.buffer.push(event);

    if (this.buffer.length >= this.MAX_BATCH) {
      this.flush();
    }
  }

  /**
   * Convenience methods for common events
   */
  trackLoaded(): void {
    this.track('questionnaire_loaded');
  }

  trackStarted(): void {
    this.track('questionnaire_started');
  }

  trackQuestionViewed(questionId: string): void {
    this.track('question_viewed', { questionId });
  }

  trackQuestionAnswered(questionId: string, optionId: string, timeSpentMs: number): void {
    this.track('question_answered', { questionId, optionId, timeSpentMs });
  }

  trackBackNavigation(fromQuestionId: string, toQuestionId: string): void {
    this.track('back_navigation_used', { fromQuestionId, toQuestionId });
  }

  trackCompleted(totalTimeMs: number, completedModules: string[]): void {
    this.track('questionnaire_completed', { totalTimeMs, completedModules });
  }

  trackAbandoned(lastQuestionId: string): void {
    this.track('questionnaire_abandoned', { lastQuestionId });
  }

  trackFiutoChatOpened(questionContext: string): void {
    this.track('fiuto_chat_opened', { questionContext });
  }

  trackFiutoChatMessageSent(questionContext: string): void {
    // Note: NO message content logged for privacy
    this.track('fiuto_chat_message_sent', { questionContext });
  }

  trackRecommendationViewed(breedId: string, rank: number): void {
    this.track('recommendation_viewed', { breedId, rank });
  }

  trackRecommendationClicked(breedId: string, rank: number): void {
    this.track('recommendation_clicked', { breedId, rank });
  }

  /**
   * Flush buffered events to backend.
   *
   * @param sync - Use sendBeacon for reliable delivery (e.g., on unload)
   */
  flush(sync = false): void {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0, this.buffer.length);
    const url = `${environment.apiUrl}/questionnaire/events`;

    if (sync && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(batch)], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }

    this.http.post(url, batch).subscribe({
      error: () => {
        // On error, put events back in buffer for retry
        this.buffer.unshift(...batch);
      }
    });
  }

  /**
   * Handler for beforeunload event.
   */
  private handleUnload = (): void => {
    this.flush(true);
  };
}
