import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * SignupComponent - User registration form
 *
 * Features:
 * - Email/password registration
 * - Password confirmation validation
 * - Form validation (email format, password strength, required fields)
 * - Social login options (Google, Facebook) via SocialLoginComponent
 * - Back navigation button
 *
 * Uses reactive forms with custom validators for password matching.
 * OAuth is handled entirely by SocialLoginComponent using @abacritt/angularx-social-login.
 */
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {
  @Output() signupSubmit = new EventEmitter<{ email: string; password: string }>();
  @Output() backClick = new EventEmitter<void>();
  @Output() socialLoginClick = new EventEmitter<'apple' | 'facebook' | 'google'>();

  signupForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      inviteCode: ['', [Validators.required, this.inviteCodeValidator]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

  get inviteCode() {
    return this.signupForm.get('inviteCode');
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

  getInviteCodeError(): string {
    if (this.inviteCode?.errors?.['required']) {
      return 'Codice invito obbligatorio';
    }
    if (this.inviteCode?.errors?.['invalidInviteCode']) {
      return 'Il codice invito deve essere ILOVEFIUTAMI';
    }
    return '';
  }

  getPasswordError(): string {
    if (this.password?.errors?.['required']) {
      return 'Password obbligatoria';
    }
    if (this.password?.errors?.['minlength']) {
      return 'Password minimo 8 caratteri';
    }
    if (this.password?.errors?.['passwordStrength']) {
      return 'Usa lettere e numeri';
    }
    return '';
  }

  getConfirmPasswordError(): string {
    if (this.confirmPassword?.touched) {
      if (this.confirmPassword?.errors?.['required']) {
        return 'Conferma password obbligatoria';
      }
      if (this.signupForm.errors?.['passwordMismatch']) {
        return 'Le password non corrispondono';
      }
    }
    return '';
  }

  /**
   * Custom validator for password strength
   * Requires at least one number and one letter
   */
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);

    const valid = hasNumber && hasLetter;
    return valid ? null : { passwordStrength: true };
  }

  /**
   * Custom validator for password confirmation matching
   */
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private inviteCodeValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value ?? '').trim();
    if (!value) {
      return null;
    }

    return value === 'ILOVEFIUTAMI' ? null : { invalidInviteCode: true };
  }

  onSubmit(): void {
    if (this.signupForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const { email, password, inviteCode } = this.signupForm.value;
      this.signupSubmit.emit({ email, password });
      const trimmedInviteCode = inviteCode.trim();
      const signupPayload = {
        email,
        password,
        firstName: '',
        lastName: '',
        inviteCode: trimmedInviteCode
      };

      // firstName and lastName are optional for now, user can complete profile later
      this.authService.signup(signupPayload).subscribe({
        next: () => {
          // New users always go to onboarding (no pets yet)
          this.router.navigate(['/onboarding/welcome']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Registrazione fallita. Riprova.';
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
