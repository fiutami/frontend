import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserSession {
  id: string;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  deviceName: string;
  city: string | null;
  country: string | null;
  createdAt: string;
  lastActivityAt: string;
  isCurrent: boolean;
}

export interface ActiveSessionsResponse {
  sessions: UserSession[];
  totalCount: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  data?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionsSignal = signal<UserSession[]>([]);
  private loadingSignal = signal<boolean>(false);

  readonly sessions = this.sessionsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadSessions(): Observable<ActiveSessionsResponse> {
    this.loadingSignal.set(true);
    return this.http.get<ActiveSessionsResponse>(`${environment.apiUrl}/session`).pipe(
      tap(response => {
        this.sessionsSignal.set(response.sessions);
        this.loadingSignal.set(false);
      })
    );
  }

  getCurrentSession(): Observable<UserSession> {
    return this.http.get<UserSession>(`${environment.apiUrl}/session/current`);
  }

  revokeSession(sessionId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${environment.apiUrl}/session/${sessionId}`).pipe(
      tap(() => {
        const updated = this.sessionsSignal().filter(s => s.id !== sessionId);
        this.sessionsSignal.set(updated);
      })
    );
  }

  revokeAllSessions(keepCurrent = true): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${environment.apiUrl}/session/all`,
      { params: { keepCurrent: keepCurrent.toString() } }
    ).pipe(
      tap(() => {
        if (keepCurrent) {
          const current = this.sessionsSignal().filter(s => s.isCurrent);
          this.sessionsSignal.set(current);
        } else {
          this.sessionsSignal.set([]);
        }
      })
    );
  }
}
