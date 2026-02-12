/**
 * Fiuto Context Detector Service
 *
 * Subscribes to Router events and aggregates contextual data
 * from the current page for the AI service.
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import {
  FiutoContext,
  FiutoRoute,
  FiutoMode,
} from '../models/fiuto-ai.models';
import { FIUTO_DEFAULT_MODE } from '../config/fiuto-prompts.config';

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
export class FiutoContextDetectorService {
  private readonly router = inject(Router);

  private readonly _currentUrl = signal(this.router.url);
  private readonly _pageData = signal<Record<string, unknown>>({});

  readonly currentRoute = computed<FiutoRoute>(() => {
    const url = this._currentUrl();
    return this.urlToRoute(url);
  });

  readonly currentMode = computed<FiutoMode>(() => {
    return FIUTO_DEFAULT_MODE[this.currentRoute()] ?? 'general';
  });

  readonly currentContext = computed<FiutoContext>(() => ({
    route: this.currentRoute(),
    mode: this.currentMode(),
    pageData: this._pageData(),
  }));

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this._currentUrl.set(event.urlAfterRedirects || event.url);
      // Reset page data on navigation
      this._pageData.set({});
    });
  }

  /**
   * Set page-specific data (called by page components).
   * E.g., search query, pet info, breed being viewed.
   */
  setPageData(data: Record<string, unknown>): void {
    this._pageData.update(current => ({ ...current, ...data }));
  }

  /**
   * Clear page data.
   */
  clearPageData(): void {
    this._pageData.set({});
  }

  private urlToRoute(url: string): FiutoRoute {
    const path = url.split('?')[0].split('#')[0];
    const segments = path.split('/').filter(Boolean);

    for (const segment of segments) {
      const route = ROUTE_MAP[segment];
      if (route) return route;
    }

    return 'unknown';
  }
}
