import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FeatureFlag } from '../models/cms.models';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private readonly baseUrl = `${environment.apiUrl}/cms`;
  private flagsSignal = signal<Map<string, boolean>>(new Map());

  readonly flags = this.flagsSignal.asReadonly();

  constructor(private http: HttpClient) {}

  /**
   * Load all feature flags from the API. Call once at app startup.
   */
  loadFlags(): void {
    this.http.get<FeatureFlag[]>(`${this.baseUrl}/features`).pipe(
      tap(flags => {
        const map = new Map<string, boolean>();
        flags.forEach(f => map.set(f.name, f.isEnabled));
        this.flagsSignal.set(map);
      }),
      catchError(() => of([]))
    ).subscribe();
  }

  /**
   * Check if a feature flag is enabled. Returns false if flag doesn't exist.
   */
  isEnabled(name: string): boolean {
    return this.flagsSignal().get(name) ?? false;
  }
}
