import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserSettings {
  id: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  profilePublic: boolean;
  showEmail: boolean;
  showPhone: boolean;
  allowSearchByEmail: boolean;
  language: string;
  timezone: string;
  theme: string;
  updatedAt: string;
}

export interface UpdateNotificationSettingsRequest {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  weeklyDigest?: boolean;
}

export interface UpdatePrivacySettingsRequest {
  profilePublic?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  allowSearchByEmail?: boolean;
}

export interface UpdatePreferencesRequest {
  language?: string;
  timezone?: string;
  theme?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSignal = signal<UserSettings | null>(null);
  private loadingSignal = signal<boolean>(false);

  readonly settings = this.settingsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadSettings(): Observable<UserSettings> {
    this.loadingSignal.set(true);
    return this.http.get<UserSettings>(`${environment.apiUrl}/settings`).pipe(
      tap(settings => {
        this.settingsSignal.set(settings);
        this.loadingSignal.set(false);
      })
    );
  }

  updateNotifications(request: UpdateNotificationSettingsRequest): Observable<UserSettings> {
    return this.http.patch<UserSettings>(
      `${environment.apiUrl}/settings/notifications`,
      request
    ).pipe(
      tap(settings => this.settingsSignal.set(settings))
    );
  }

  updatePrivacy(request: UpdatePrivacySettingsRequest): Observable<UserSettings> {
    return this.http.patch<UserSettings>(
      `${environment.apiUrl}/settings/privacy`,
      request
    ).pipe(
      tap(settings => this.settingsSignal.set(settings))
    );
  }

  updatePreferences(request: UpdatePreferencesRequest): Observable<UserSettings> {
    return this.http.patch<UserSettings>(
      `${environment.apiUrl}/settings/preferences`,
      request
    ).pipe(
      tap(settings => this.settingsSignal.set(settings))
    );
  }
}
