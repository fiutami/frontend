import { Injectable, NgZone } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService, AuthResponse } from './auth.service';

// Global declarations for OAuth SDKs
interface GoogleAccounts {
  id: {
    initialize: (config: any) => void;
    prompt: (callback: (notification: any) => void) => void;
    renderButton: (element: HTMLElement, config: any) => void;
  };
  oauth2: {
    initTokenClient: (config: any) => any;
  };
}

interface FacebookSDK {
  init: (config: any) => void;
  login: (callback: (response: any) => void, options: any) => void;
}

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
    FB?: FacebookSDK;
    fbAsyncInit?: () => void;
  }
}

export type OAuthProvider = 'google' | 'facebook' | 'apple';

export interface OAuthConfig {
  google: { clientId: string };
  facebook: { appId: string };
}

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private googleInitialized = false;
  private facebookInitialized = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  /**
   * Initialize Google Identity Services
   */
  initializeGoogle(): Promise<void> {
    if (this.googleInitialized) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        this.setupGoogleClient();
        this.googleInitialized = true;
        resolve();
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.setupGoogleClient();
        this.googleInitialized = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  private setupGoogleClient(): void {
    const clientId = environment.oauth?.google?.clientId;
    if (!clientId || clientId.includes('YOUR_GOOGLE')) {
      console.warn('Google OAuth: Client ID not configured');
      return;
    }
    // Google client will be initialized on-demand in getGoogleToken
    // to ensure callback is properly set
  }

  /**
   * Initialize Facebook SDK
   */
  initializeFacebook(): Promise<void> {
    if (this.facebookInitialized) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const appId = environment.oauth?.facebook?.appId;
      if (!appId || appId.includes('YOUR_FACEBOOK')) {
        console.warn('Facebook OAuth: App ID not configured');
        reject(new Error('Facebook App ID not configured'));
        return;
      }

      if (window.FB) {
        this.facebookInitialized = true;
        resolve();
        return;
      }

      // Setup Facebook SDK async init
      window.fbAsyncInit = () => {
        window.FB!.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        this.facebookInitialized = true;
        resolve();
      };

      // Load Facebook SDK
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
      document.head.appendChild(script);
    });
  }

  /**
   * Login with specified OAuth provider
   */
  loginWithProvider(provider: OAuthProvider): Observable<AuthResponse> {
    switch (provider) {
      case 'google':
        return this.loginWithGoogle();
      case 'facebook':
        return this.loginWithFacebook();
      case 'apple':
        return throwError(() => new Error('Apple Sign-In non ancora supportato'));
      default:
        return throwError(() => new Error(`Provider non supportato: ${provider}`));
    }
  }

  /**
   * Login with Google
   */
  private loginWithGoogle(): Observable<AuthResponse> {
    return from(this.initializeGoogle()).pipe(
      switchMap(() => this.getGoogleToken()),
      switchMap(idToken => this.authService.oauthLogin('google', idToken)),
      tap(() => {
        this.ngZone.run(() => {
          this.router.navigate(['/dashboard']);
        });
      })
    );
  }

  private getGoogleToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const clientId = environment.oauth?.google?.clientId;
      if (!clientId || clientId.includes('YOUR_GOOGLE')) {
        reject(new Error('Configura il Google Client ID per abilitare il login'));
        return;
      }

      if (!window.google?.accounts) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      // Initialize Google Identity Services for ID token flow
      // This always returns ID tokens (JWT), not access tokens
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          console.log('Google ID callback received');
          if (response.credential) {
            console.log('Got ID token from Google');
            resolve(response.credential);
          } else {
            console.error('No credential in Google response');
            reject(new Error('Google login failed - no credential'));
          }
        },
        // Use FedCM if available (modern browsers)
        use_fedcm_for_prompt: true
      });

      // Try One-Tap first
      window.google.accounts.id.prompt((notification: any) => {
        console.log('Google prompt notification:', notification.getMomentType?.());

        if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
          // One-Tap not available or dismissed, create a hidden button and click it
          // This triggers the popup flow which also returns ID tokens
          console.log('One-Tap not available, using popup flow');

          const buttonDiv = document.createElement('div');
          buttonDiv.id = 'google-signin-button-hidden';
          buttonDiv.style.position = 'absolute';
          buttonDiv.style.left = '-9999px';
          document.body.appendChild(buttonDiv);

          window.google!.accounts.id.renderButton(buttonDiv, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            click_listener: () => {
              console.log('Google button clicked');
            }
          });

          // Click the button to trigger popup
          const button = buttonDiv.querySelector('div[role="button"]') as HTMLElement;
          if (button) {
            button.click();
          } else {
            // Cleanup and reject if button not found
            document.body.removeChild(buttonDiv);
            reject(new Error('Failed to create Google sign-in button'));
          }

          // Cleanup after a delay
          setTimeout(() => {
            const el = document.getElementById('google-signin-button-hidden');
            if (el) document.body.removeChild(el);
          }, 60000);
        }
      });
    });
  }

  /**
   * Login with Facebook
   */
  private loginWithFacebook(): Observable<AuthResponse> {
    return from(this.initializeFacebook()).pipe(
      switchMap(() => this.getFacebookToken()),
      switchMap(accessToken => this.authService.oauthLogin('facebook', accessToken)),
      tap(() => {
        this.ngZone.run(() => {
          this.router.navigate(['/dashboard']);
        });
      })
    );
  }

  private getFacebookToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const appId = environment.oauth?.facebook?.appId;
      if (!appId || appId.includes('YOUR_FACEBOOK')) {
        reject(new Error('Configura il Facebook App ID per abilitare il login'));
        return;
      }

      window.FB!.login((response: any) => {
        if (response.authResponse) {
          resolve(response.authResponse.accessToken);
        } else {
          reject(new Error('Facebook login cancelled or failed'));
        }
      }, { scope: 'email,public_profile' });
    });
  }

  /**
   * Check if provider is configured
   */
  isProviderConfigured(provider: OAuthProvider): boolean {
    switch (provider) {
      case 'google': {
        const googleId = environment.oauth?.google?.clientId;
        return !!googleId && !googleId.includes('YOUR_GOOGLE');
      }
      case 'facebook': {
        const fbId = environment.oauth?.facebook?.appId;
        return !!fbId && !fbId.includes('YOUR_FACEBOOK');
      }
      case 'apple':
        return false; // Not yet implemented
      default:
        return false;
    }
  }
}
