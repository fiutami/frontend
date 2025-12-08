import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

/**
 * HomeStartComponent - Landing page with authentication options
 *
 * Features:
 * - Full-screen hero image with overlay
 * - FiutaMi branding (logo + mascot)
 * - Primary CTA buttons (Accedi/Registrati)
 * - Language switcher
 * - Terms & Privacy notice
 *
 * This is the entry point for unauthenticated users.
 * Social login options are available on the login/signup pages.
 */
@Component({
  selector: 'app-home-start',
  templateUrl: './home-start.component.html',
  styleUrls: ['./home-start.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeStartComponent {
  @Output() loginClick = new EventEmitter<void>();
  @Output() signupClick = new EventEmitter<void>();
  @Output() languageClick = new EventEmitter<void>();

  constructor(private router: Router) {}

  onLoginClick(): void {
    this.loginClick.emit();
    this.router.navigate(['/login']);
  }

  onSignupClick(): void {
    this.signupClick.emit();
    this.router.navigate(['/signup']);
  }

  onLanguageClick(): void {
    this.languageClick.emit();
  }
}
