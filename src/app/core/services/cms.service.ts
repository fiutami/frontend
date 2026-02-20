import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CmsPage, CmsFaq, AppConfig, CmsSection } from '../models/cms.models';

@Injectable({ providedIn: 'root' })
export class CmsService {
  private readonly baseUrl = `${environment.apiUrl}/cms`;

  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getPage(slug: string, locale: string = 'it'): Observable<CmsPage | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<CmsPage>(`${this.baseUrl}/pages/${slug}`, {
      params: { locale }
    }).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError(() => {
        this.loadingSignal.set(false);
        this.errorSignal.set('cms.error');
        return of(null);
      })
    );
  }

  getFaq(locale: string = 'it', category?: string): Observable<CmsFaq[]> {
    const params: Record<string, string> = { locale };
    if (category) params['category'] = category;

    return this.http.get<CmsFaq[]>(`${this.baseUrl}/faq`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>(`${this.baseUrl}/config`).pipe(
      catchError(() => of({ maintenanceMode: false }))
    );
  }

  /**
   * Parse CMS page content (JSON array of sections) into CmsSection[].
   * Falls back to raw content as a single section if parsing fails.
   */
  parseSections(page: CmsPage): CmsSection[] {
    try {
      const parsed = JSON.parse(page.content);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Content is plain text, wrap in single section
    }
    return [{ id: 'content', title: page.title, content: page.content }];
  }
}
