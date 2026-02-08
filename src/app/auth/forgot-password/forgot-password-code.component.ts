import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * ForgotPasswordCodeComponent - 6-digit code verification
 *
 * Features:
 * - 6-digit code input
 * - Code validation
 * - Resend code option
 * - Back navigation button
 * - Submits code and navigates to password reset
 *
 * Uses reactive forms with validators for code verification.
 */
@Component({
  selector: 'app-forgot-password-code',
  templateUrl: './forgot-password-code.component.html',
  styleUrls: ['./forgot-password-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordCodeComponent implements OnInit {
  codeForm: FormGroup;
  isSubmitting = false;
  isResending = false;
  errorMessage = '';
  email = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // Get email from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.email = navigation.extras.state['email'] || '';
    }
  }

  ngOnInit(): void {
    // If no email, redirect back to forgot-password
    if (!this.email) {
      this.router.navigate(['/forgot-password']);
    }
  }

  get code() {
    return this.codeForm.get('code');
  }

  getCodeError(): string {
    if (this.code?.errors?.['required']) {
      return 'Codice obbligatorio';
    }
    if (this.code?.errors?.['pattern']) {
      return 'Inserisci un codice a 6 cifre';
    }
    return '';
  }

  onSubmit(): void {
    if (this.codeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const { code } = this.codeForm.value;

      // TODO: Replace with actual API call when backend is ready
      console.log('Verifying code:', code, 'for email:', this.email);

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        // Navigate to password reset page
        this.router.navigate(['/forgot-password/confirm'], {
          state: { email: this.email, code }
        });
        this.cdr.markForCheck();
      }, 1000);
    }
  }

  onResendCode(): void {
    if (!this.isResending) {
      this.isResending = true;
      this.errorMessage = '';

      // TODO: Replace with actual API call when backend is ready
      console.log('Resending code to email:', this.email);

      // Simulate API call
      setTimeout(() => {
        this.isResending = false;
        this.cdr.markForCheck();
      }, 1000);
    }
  }

  onBackClick(): void {
    this.router.navigate(['/forgot-password']);
  }
}
