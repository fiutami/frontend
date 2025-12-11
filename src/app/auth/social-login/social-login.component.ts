import { Component, ChangeDetectionStrategy, Output, EventEmitter, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  SocialAuthService,
  SocialUser,
  FacebookLoginProvider
} from '@abacritt/angularx-social-login';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

/**
 * SocialLoginComponent - Social authentication buttons
 *
 * Provides buttons for third-party authentication:
 * - Apple Sign In (placeholder - requires additional setup)
 * - Facebook Login
 * - Google Sign In (uses native Google button via asl-google-signin-button)
 *
 * Uses @abacritt/angularx-social-login for OAuth flow.
 */
@Component({
  selector: 'app-social-login',
  templateUrl: './social-login.component.html',
  styleUrls: ['./social-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialLoginComponent implements OnInit, OnDestroy {
  @Output() providerSelected = new EventEmitter<'apple' | 'facebook' | 'google'>();
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() loginError = new EventEmitter<string>();

  isLoading = false;
  loadingProvider: 'apple' | 'facebook' | 'google' | null = null;
  errorMessage = '';

  private authSubscription?: Subscription;
  private isProcessingAuth = false; // Guard against duplicate auth events

  constructor(
    private socialAuthService: SocialAuthService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state changes (handles Google sign-in via native button)
    this.authSubscription = this.socialAuthService.authState.subscribe((user: SocialUser | null) => {
      if (user && !this.isProcessingAuth) {
        console.log('Social user authenticated:', user.provider);
        this.providerSelected.emit(user.provider.toLowerCase() as 'google' | 'facebook');
        this.handleSocialUser(user);
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  clearError(): void {
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  private async handleSocialUser(user: SocialUser): Promise<void> {
    // Guard against duplicate auth events
    if (this.isProcessingAuth) {
      console.log('Already processing auth, skipping duplicate event');
      return;
    }
    this.isProcessingAuth = true;

    this.setLoading(user.provider.toLowerCase() as any, true);

    // Debug: log what tokens are available
    console.log('SocialUser received:', {
      provider: user.provider,
      hasIdToken: !!user.idToken,
      hasAuthToken: !!user.authToken,
      idTokenLength: user.idToken?.length,
      authTokenLength: user.authToken?.length
    });

    // Prefer idToken (JWT) over authToken (access token)
    const token = user.idToken || user.authToken;

    if (!token) {
      this.errorMessage = 'Authentication failed: no token received';
      this.loginError.emit(this.errorMessage);
      this.setLoading(null, false);
      this.isProcessingAuth = false;
      return;
    }

    console.log('Sending OAuth request with token type:', user.idToken ? 'idToken' : 'authToken');

    this.authService.oauthLogin(user.provider.toLowerCase(), token).subscribe({
      next: () => {
        this.loginSuccess.emit();
        this.setLoading(null, false);
        this.isProcessingAuth = false;
        // Ha pet → home principale, No pet → onboarding AI
        if (this.authService.hasCompletedOnboarding()) {
          this.router.navigate(['/home/main']);
        } else {
          this.router.navigate(['/home/welcome-ai/1']);
        }
      },
      error: (err) => {
        console.error('Backend OAuth error:', err);
        this.errorMessage = 'Authentication failed. Please try again.';
        this.loginError.emit(this.errorMessage);
        this.setLoading(null, false);
        this.isProcessingAuth = false;
      }
    });
  }

  onProviderClick(provider: 'apple' | 'facebook'): void {
    this.providerSelected.emit(provider);
    this.errorMessage = '';
    this.cdr.markForCheck();

    switch (provider) {
      case 'facebook':
        this.loginWithFacebook();
        break;
      case 'apple':
        this.loginWithApple();
        break;
    }
  }

  private async loginWithFacebook(): Promise<void> {
    this.setLoading('facebook', true);

    try {
      await this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
      // Facebook auth is handled via authState subscription
    } catch (error: any) {
      console.error('Facebook login error:', error);
      this.errorMessage = error?.message || 'Facebook login failed. Please try again.';
      this.loginError.emit(this.errorMessage);
      this.setLoading('facebook', false);
    }
  }

  // Google login is handled automatically by <asl-google-signin-button>
  // via the authState subscription in ngOnInit()

  private loginWithApple(): void {
    // Apple Sign In requires additional setup with Apple Developer account
    console.warn('Apple Sign In not yet implemented');
    this.errorMessage = 'Apple Sign In coming soon!';
    this.loginError.emit(this.errorMessage);
    this.cdr.markForCheck();
  }

  private setLoading(provider: 'apple' | 'facebook' | 'google' | null, loading: boolean): void {
    this.isLoading = loading;
    this.loadingProvider = loading ? provider : null;
    this.cdr.markForCheck();
  }

  isProviderLoading(provider: 'apple' | 'facebook' | 'google'): boolean {
    return this.loadingProvider === provider;
  }
}
