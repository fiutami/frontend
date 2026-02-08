import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to /login if user is not authenticated
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // DEV ONLY: Bypass authentication for local testing
    if ((environment as { devBypassAuth?: boolean }).devBypassAuth && !environment.production) {
      this.injectMockAuthData();
      return true;
    }

    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Store the attempted URL for redirecting after login
    const returnUrl = state.url;

    // Redirect to login page with return url
    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl }
    });
  }

  /**
   * DEV ONLY: Inject mock auth data for local testing
   */
  private injectMockAuthData(): void {
    const mockUser = {
      id: 'dev-user-001',
      email: 'dev@fiutami.local',
      firstName: 'Dev',
      lastName: 'Tester',
      provider: 'local',
      createdAt: new Date().toISOString(),
      hasCompletedOnboarding: true
    };

    // Build a valid JWT so isAuthenticated() won't clear it
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: 'dev-user-001',
      email: 'dev@fiutami.local',
      exp: Math.floor(Date.now() / 1000) + 86400 // 24h from now
    }));
    const mockToken = `${header}.${payload}.dev-signature`;

    // Only inject if not already present
    if (!localStorage.getItem('fiutami_access_token')) {
      localStorage.setItem('fiutami_access_token', mockToken);
      localStorage.setItem('fiutami_user', JSON.stringify(mockUser));
      console.warn('[DEV] Auth bypass enabled - mock user injected');
    }
  }
}
