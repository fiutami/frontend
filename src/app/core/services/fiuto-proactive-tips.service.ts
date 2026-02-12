/**
 * Fiuto Proactive Tips Service
 *
 * Generates contextual greetings and tips based on
 * the current route and time of day.
 */
import { Injectable, inject, computed } from '@angular/core';
import { FiutoContextDetectorService } from './fiuto-context-detector.service';
import { FiutoRoute, FiutoSuggestion } from '../models/fiuto-ai.models';
import { FIUTO_GREETINGS, FIUTO_SUGGESTIONS } from '../config/fiuto-prompts.config';

@Injectable({ providedIn: 'root' })
export class FiutoProactiveTipsService {
  private readonly contextDetector = inject(FiutoContextDetectorService);

  readonly currentGreeting = computed<string>(() => {
    const route = this.contextDetector.currentRoute();
    const timeGreeting = this.getTimeGreeting();
    const routeGreeting = FIUTO_GREETINGS[route] ?? FIUTO_GREETINGS['unknown'];

    return `${timeGreeting} ${routeGreeting}`;
  });

  readonly currentSuggestions = computed<FiutoSuggestion[]>(() => {
    const route = this.contextDetector.currentRoute();
    return FIUTO_SUGGESTIONS[route] ?? [];
  });

  /**
   * Get a proactive tip for the current context.
   */
  getProactiveTip(): string | null {
    const route = this.contextDetector.currentRoute();
    return this.getRouteTip(route);
  }

  private getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno!';
    if (hour < 18) return 'Buon pomeriggio!';
    return 'Buonasera!';
  }

  private getRouteTip(route: FiutoRoute): string | null {
    const tips: Partial<Record<FiutoRoute, string>> = {
      map: 'Vuoi che ti mostri i parchi dog-friendly vicino a te?',
      breeds: 'Posso aiutarti a confrontare razze diverse!',
      adoption: 'Sapevi che puoi filtrare per taglia e età?',
      calendar: 'Ci sono eventi interessanti questa settimana!',
      'lost-pets': 'Puoi attivare le notifiche per segnalazioni nella tua zona.',
      search: 'Prova a cercare con la voce, è più veloce!',
    };
    return tips[route] ?? null;
  }
}
