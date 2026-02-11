import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

/**
 * DevGuard - Blocks access to development/test routes in production
 * Use this guard on routes that should only be accessible in development mode.
 */
@Injectable({
  providedIn: 'root'
})
export class DevGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (environment.production) {
      // Redirect to home in production
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
