import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip auth endpoints
    if (this.isAuthEndpoint(request.url)) {
      return next.handle(request);
    }

    // Add token to request if available
    const token = this.authService.getAccessToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // In dev bypass mode, never trigger token refresh/logout on API errors
        if ((environment as any).devBypassAuth && !environment.production) {
          return throwError(() => error);
        }
        if (error.status === 401 && !this.isAuthEndpoint(request.url)) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/login') ||
           url.includes('/auth/register') ||
           url.includes('/auth/refresh');
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();
      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((response) => {
            this.refreshTokenSubject.next(response.accessToken);
            return next.handle(this.addToken(request, response.accessToken));
          }),
          catchError((err) => {
            this.authService.logout();
            return throwError(() => err);
          }),
          finalize(() => {
            this.isRefreshing = false;
          })
        );
      } else {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => new Error('No refresh token available'));
      }
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addToken(request, token!)))
    );
  }
}
