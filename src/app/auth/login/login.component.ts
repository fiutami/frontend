import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * LoginComponent - User login form
 *
 * Features:
 * - Email/password authentication
 * - Form validation (email format, required fields)
 * - "Forgot password" link
 * - Social login options (Google, Facebook) via SocialLoginComponent
 * - Back navigation button
 *
 * Uses reactive forms with validators for robust input handling.
 * OAuth is handled entirely by SocialLoginComponent using @abacritt/angularx-social-login.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  @Output() loginSubmit = new EventEmitter<{ email: string; password: string }>();
  @Output() backClick = new EventEmitter<void>();
  @Output() forgotPasswordClick = new EventEmitter<void>();
  @Output() socialLoginClick = new EventEmitter<'apple' | 'facebook' | 'google'>();

  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  getEmailError(): string {
    if (this.email?.errors?.['required']) {
      return 'Email obbligatoria';
    }
    if (this.email?.errors?.['email']) {
      return "Inserisci un'email valida";
    }
    return '';
  }

  getPasswordError(): string {
    if (this.password?.errors?.['required']) {
      return 'Password obbligatoria';
    }
    if (this.password?.errors?.['minlength']) {
      return 'Password minimo 6 caratteri';
    }
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;
      this.loginSubmit.emit({ email, password });

      this.authService.login({ email, password }).subscribe({
        next: () => {
          // Navigate based on onboarding status
          // Ha pet → home principale, No pet → onboarding
          if (this.authService.hasCompletedOnboarding()) {
            this.router.navigate(['/home/main']);
          } else {
            this.router.navigate(['/onboarding/welcome']);
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Login fallito. Riprova.';
          this.cdr.markForCheck();
        }
      });
    }
  }

  onBackClick(): void {
    this.backClick.emit();
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  onForgotPasswordClick(): void {
    this.forgotPasswordClick.emit();
  }

  /**
   * Handler for social login provider selection.
   * Note: The actual OAuth flow is handled by SocialLoginComponent,
   * this method just emits the event for parent components if needed.
   */
  onSocialLoginClick(provider: 'apple' | 'facebook' | 'google'): void {
    this.socialLoginClick.emit(provider);
    // OAuth flow is handled by SocialLoginComponent internally
  }
}
