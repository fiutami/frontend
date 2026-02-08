import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * ForgotPasswordComponent - Email input for password reset flow
 *
 * Features:
 * - Email validation
 * - Form validation (email format, required field)
 * - Back navigation button
 * - Submits email and navigates to code verification
 *
 * Uses reactive forms with validators for email validation.
 */
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
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

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const { email } = this.forgotPasswordForm.value;

      // TODO: Replace with actual API call when backend is ready
      console.log('Forgot password request for email:', email);

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        // Navigate to code verification page
        this.router.navigate(['/forgot-password/code'], {
          state: { email }
        });
        this.cdr.markForCheck();
      }, 1000);
    }
  }

  onBackClick(): void {
    this.router.navigate(['/login']);
  }
}
