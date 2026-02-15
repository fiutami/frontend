import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConsentResponse {
  id: string;
  consentType: string;
  consentVersion: string;
  isGranted: boolean;
  grantedAt: string | null;
  revokedAt: string | null;
}

export interface GrantConsentRequest {
  consentType: string;
  consentVersion: string;
}

const COOKIE_CONSENT_KEY = 'fiutami_cookie_consent';

export interface CookieConsentState {
  version: string;
  necessary: boolean;  // always true
  functional: boolean;
  analytics: boolean;
  grantedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/consent`;

  consents = signal<ConsentResponse[]>([]);
  cookieConsent = signal<CookieConsentState | null>(this.loadCookieConsent());

  getConsents(): Observable<ConsentResponse[]> {
    return this.http.get<ConsentResponse[]>(this.baseUrl).pipe(
      tap(consents => this.consents.set(consents))
    );
  }

  grantConsent(type: string, version: string): Observable<ConsentResponse> {
    return this.http.post<ConsentResponse>(this.baseUrl, { consentType: type, consentVersion: version });
  }

  revokeConsent(type: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${type}`);
  }

  // Cookie consent (local + backend sync)
  setCookieConsent(functional: boolean, analytics: boolean): void {
    const state: CookieConsentState = {
      version: '1.0',
      necessary: true,
      functional,
      analytics,
      grantedAt: new Date().toISOString()
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
    this.cookieConsent.set(state);

    // Sync to backend if authenticated
    if (functional) {
      this.grantConsent('cookie_functional', '1.0').subscribe({ error: () => {} });
    }
    if (analytics) {
      this.grantConsent('cookie_analytics', '1.0').subscribe({ error: () => {} });
    }
  }

  acceptAllCookies(): void {
    this.setCookieConsent(true, true);
  }

  acceptNecessaryOnly(): void {
    this.setCookieConsent(false, false);
  }

  hasCookieConsent(): boolean {
    return this.cookieConsent() !== null;
  }

  private loadCookieConsent(): CookieConsentState | null {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
