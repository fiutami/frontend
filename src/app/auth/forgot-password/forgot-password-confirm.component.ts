import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * ForgotPasswordConfirmComponent - New password form
 *
 * Features:
 * - New password input with confirmation
 * - Password strength validation
 * - Password matching validation
 * - Back navigation button
 * - Submits new password and navigates to login
 *
 * Uses reactive forms with custom validators for password validation.
 */
@Component({
  selector: 'app-forgot-password-confirm',
  templateUrl: './forgot-password-confirm.component.html',
  styleUrls: ['./forgot-password-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordConfirmComponent implements OnInit {
  confirmForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  email = '';
  code = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.confirmForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Get email and code from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.email = navigation.extras.state['email'] || '';
      this.code = navigation.extras.state['code'] || '';
    }
  }

  ngOnInit(): void {
    // If no email or code, redirect back to forgot-password
    if (!this.email || !this.code) {
      this.router.navigate(['/forgot-password']);
    }
  }

  get password() {
    return this.confirmForm.get('password');
  }

  get confirmPassword() {
    return this.confirmForm.get('confirmPassword');
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
      if (this.confirmForm.errors?.['passwordMismatch']) {
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

  onSubmit(): void {
    if (this.confirmForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const { password } = this.confirmForm.value;

      // TODO: Replace with actual API call when backend is ready
      console.log('Resetting password for email:', this.email, 'with code:', this.code);

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        // Navigate to login page
        this.router.navigate(['/login']);
        this.cdr.markForCheck();
      }, 1000);
    }
  }

  onBackClick(): void {
    this.router.navigate(['/forgot-password/code'], {
      state: { email: this.email }
    });
  }
}
