/**
 * Fiuto AI Global Service
 *
 * Global AI concierge service available across the entire app.
 * Replaces the questionnaire-only FiutoAiService with a context-aware,
 * route-detecting AI assistant.
 *
 * Uses backend proxy for OpenRouter to protect API keys.
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter, catchError, of, timeout } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import {
  FiutoChatMessage,
  FiutoContext,
  FiutoMode,
  FiutoRoute,
  FiutoSuggestion,
} from '../models/fiuto-ai.models';
import {
  FIUTO_BASE_PERSONALITY,
  FIUTO_MODE_INSTRUCTIONS,
  FIUTO_ROUTE_CONTEXT,
  FIUTO_DEFAULT_MODE,
  FIUTO_SUGGESTIONS,
  FIUTO_GREETINGS,
} from '../config/fiuto-prompts.config';

/** Route segment → FiutoRoute mapping */
const ROUTE_MAP: Record<string, FiutoRoute> = {
  home: 'home',
  search: 'search',
  map: 'map',
  calendar: 'calendar',
  profile: 'profile',
  breeds: 'breeds',
  species: 'breeds',
  adoption: 'adoption',
  'lost-pets': 'lost-pets',
  onboarding: 'onboarding',
  questionnaire: 'onboarding',
  chat: 'chat',
  premium: 'premium',
  user: 'user',
  account: 'user',
  settings: 'user',
  notifications: 'user',
  saved: 'user',
  friends: 'user',
};

@Injectable({ providedIn: 'root' })
export class FiutoAiGlobalService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly REQUEST_TIMEOUT_MS = 35000;
  private readonly MAX_HISTORY = 20;

  // ─── State signals ─────────────────────────────────────────
  private readonly _messages = signal<FiutoChatMessage[]>([]);
  private readonly _isTyping = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _currentUrl = signal(this.router.url);

  readonly messages = this._messages.asReadonly();
  readonly isTyping = this._isTyping.asReadonly();
  readonly error = this._error.asReadonly();

  // ─── Route detection ───────────────────────────────────────
  readonly currentRoute = computed<FiutoRoute>(() => {
    const url = this._currentUrl();
    return this.urlToRoute(url);
  });

  readonly currentMode = computed<FiutoMode>(() => {
    return FIUTO_DEFAULT_MODE[this.currentRoute()] ?? 'general';
  });

  readonly contextualGreeting = computed<string>(() => {
    return FIUTO_GREETINGS[this.currentRoute()] ?? FIUTO_GREETINGS['unknown'];
  });

  readonly contextualSuggestions = computed<FiutoSuggestion[]>(() => {
    return FIUTO_SUGGESTIONS[this.currentRoute()] ?? [];
  });

  constructor() {
    // Track route changes
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this._currentUrl.set(event.urlAfterRedirects || event.url);
    });
  }

  // ─── Public API ────────────────────────────────────────────

  /**
   * Send a message to Fiuto AI with context.
   * Returns the assistant response text.
   */
  async sendMessage(message: string, context?: Partial<FiutoContext>): Promise<string> {
    const fullContext = this.buildContext(context);

    // Add user message
    const userMessage: FiutoChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
      isVoiceInput: context?.pageData?.['isVoiceInput'] as boolean | undefined,
    };

    this._messages.update(msgs => [...msgs, userMessage]);
    this._isTyping.set(true);
    this._error.set(null);

    // Create assistant placeholder
    const assistantMessage: FiutoChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    this._messages.update(msgs => [...msgs, assistantMessage]);

    try {
      const response = await this.chatStream(message, fullContext);

      // Update message with final response
      this._messages.update(msgs =>
        msgs.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: response, isStreaming: false }
            : m
        )
      );

      return response;
    } catch (err) {
      console.error('[FiutoAI Global] Chat error:', err);

      // Remove empty assistant message on error
      this._messages.update(msgs =>
        msgs.filter(m => m.id !== assistantMessage.id)
      );

      const fallback = this.getFallbackResponse(fullContext);
      this._error.set(fallback);
      return fallback;
    } finally {
      this._isTyping.set(false);
    }
  }

  /**
   * Get chat history (non-system messages).
   */
  getHistory(): FiutoChatMessage[] {
    return this._messages()
      .filter(m => m.role !== 'system')
      .slice(-this.MAX_HISTORY);
  }

  /**
   * Clear conversation history.
   */
  clearHistory(): void {
    this._messages.set([]);
    this._error.set(null);
  }

  /**
   * Add a system message for context injection.
   */
  addSystemMessage(content: string): void {
    const msg: FiutoChatMessage = {
      id: crypto.randomUUID(),
      role: 'system',
      content,
      timestamp: Date.now(),
    };
    this._messages.update(msgs => [...msgs, msg]);
  }

  /**
   * Build full context from partial override + auto-detection.
   */
  buildContext(override?: Partial<FiutoContext>): FiutoContext {
    return {
      route: override?.route ?? this.currentRoute(),
      mode: override?.mode ?? this.currentMode(),
      pageData: override?.pageData,
      currentQuestionId: override?.currentQuestionId,
      currentQuestionText: override?.currentQuestionText,
      userProfile: override?.userProfile,
      matchResults: override?.matchResults,
    };
  }

  /**
   * Build system prompt from context.
   */
  buildSystemPrompt(context: FiutoContext): string {
    const parts = [
      FIUTO_BASE_PERSONALITY,
      FIUTO_MODE_INSTRUCTIONS[context.mode] ?? '',
      FIUTO_ROUTE_CONTEXT[context.route] ?? '',
    ];

    if (context.currentQuestionText) {
      parts.push(`La domanda corrente del questionario è: "${context.currentQuestionText}"`);
    }

    return parts.filter(Boolean).join('\n\n');
  }

  // ─── Private methods ───────────────────────────────────────

  /**
   * Stream chat response from backend.
   */
  private async chatStream(message: string, context: FiutoContext): Promise<string> {
    const body = {
      message,
      systemPrompt: this.buildSystemPrompt(context),
      route: context.route,
      mode: context.mode,
      questionContext: context.currentQuestionId,
      questionText: context.currentQuestionText,
      phase: context.mode, // backward compat
      historyLength: Math.min(this._messages().length, this.MAX_HISTORY),
    };

    return new Promise((resolve, reject) => {
      let fullResponse = '';

      this.http.post(`${environment.apiUrl}/ai/chat`, body, {
        responseType: 'text',
        observe: 'events',
        reportProgress: true,
      }).pipe(
        timeout(this.REQUEST_TIMEOUT_MS),
        filter(event =>
          event.type === HttpEventType.DownloadProgress ||
          event.type === HttpEventType.Response
        ),
        catchError(err => {
          console.error('[FiutoAI Global] HTTP error:', err);
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
   * Map URL to FiutoRoute.
   */
  private urlToRoute(url: string): FiutoRoute {
    const path = url.split('?')[0].split('#')[0];
    const segments = path.split('/').filter(Boolean);

    // Try first segment, then second
    for (const segment of segments) {
      const route = ROUTE_MAP[segment];
      if (route) return route;
    }

    return 'unknown';
  }

  /**
   * Fallback response when API fails.
   */
  private getFallbackResponse(context: FiutoContext): string {
    if (context.mode === 'questionnaire') {
      return 'Capisco la tua domanda! Rispondi in base alla tua situazione attuale. Non esiste una risposta giusta o sbagliata.';
    }
    if (context.mode === 'results') {
      return 'Le razze suggerite sono basate sul tuo profilo. Considera di visitare un rifugio per conoscere il tuo futuro compagno!';
    }
    if (context.mode === 'search') {
      return 'Prova a riformulare la ricerca con parole diverse, oppure usa i filtri per categoria.';
    }
    return 'Sono qui per aiutarti! Riprova tra un momento.';
  }
}
