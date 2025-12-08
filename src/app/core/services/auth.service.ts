import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  hasCompletedOnboarding: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  provider: string;
  createdAt: string;
  hasCompletedOnboarding: boolean;
}

export interface ProfileData {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  dateOfBirth: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'fiutami_access_token';
  private readonly REFRESH_TOKEN_KEY = 'fiutami_refresh_token';
  private readonly USER_KEY = 'fiutami_user';

  private authStateSubject = new BehaviorSubject<boolean>(this.hasToken());
  public authState$ = this.authStateSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Login user with email and password
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => this.setAuthData(response))
    );
  }

  /**
   * Register new user
   */
  signup(data: SignupData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/register`,
      data
    ).pipe(
      tap(response => this.setAuthData(response))
    );
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/refresh`,
      { refreshToken }
    ).pipe(
      tap(response => this.setAuthData(response))
    );
  }

  /**
   * OAuth login
   */
  oauthLogin(provider: string, idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/oauth`,
      { provider, idToken }
    ).pipe(
      tap(response => this.setAuthData(response, provider))
    );
  }

  /**
   * Logout user and clear auth data
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/auth/revoke`, { refreshToken }).subscribe({
        error: () => {} // Ignore errors on revoke
      });
    }

    this.clearAuthData();
    this.router.navigate(['/']);
  }

  /**
   * Check if user is authenticated
   * Validates that token exists and hasn't expired
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    // Try to decode and validate token expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Convert to milliseconds

      if (Date.now() >= expiresAt) {
        // Token expired, clear auth data
        this.clearAuthData();
        return false;
      }

      return true;
    } catch {
      // Invalid token format, clear auth data
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Clear all auth data from localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.authStateSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get current user data
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get user profile
   */
  getProfile(): Observable<ProfileData> {
    return this.http.get<ProfileData>(`${environment.apiUrl}/profile`);
  }

  /**
   * Update user profile
   */
  updateProfile(data: Partial<ProfileData>): Observable<ProfileData> {
    return this.http.put<ProfileData>(`${environment.apiUrl}/profile`, data);
  }

  /**
   * Store authentication data
   */
  private setAuthData(response: AuthResponse, provider = 'email'): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    const user: User = {
      id: response.userId,
      email: response.email,
      firstName: response.firstName || '',
      lastName: response.lastName || '',
      provider: provider,
      createdAt: new Date().toISOString(),
      hasCompletedOnboarding: response.hasCompletedOnboarding
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.authStateSubject.next(true);
    this.currentUserSubject.next(user);
  }

  /**
   * Check if user has completed onboarding
   */
  hasCompletedOnboarding(): boolean {
    const user = this.getCurrentUser();
    return user?.hasCompletedOnboarding ?? false;
  }

  /**
   * Update onboarding status locally (called after pet creation)
   */
  markOnboardingComplete(): void {
    const user = this.getCurrentUser();
    if (user) {
      user.hasCompletedOnboarding = true;
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Check if token exists in localStorage
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
}
