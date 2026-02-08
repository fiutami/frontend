import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * WelcomeComponent - Pet Onboarding Page (Legacy)
 *
 * This component is maintained for backward compatibility.
 * It automatically redirects to the new AI onboarding flow (welcome-ai/1).
 *
 * Previous behavior:
 * - Allowed users to choose between "Ho un animale" / "Vorrei un animale"
 *
 * New behavior:
 * - Redirects to /home/welcome-ai/1 on init
 *
 * Based on Figma design: efeCViDvpZvRQx7sVM8UWy, node 2002:6621
 */
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WelcomeComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Note: Removed auto-redirect to /home/welcome-ai/1
    // User should see the welcome page and choose their path
  }

  onHavePet(): void {
    this.router.navigate(['/home/welcome-ai']);
  }

  onWantPet(): void {
    // Navigate to species questionnaire flow
    this.router.navigate(['/home/welcome-ai/2b']);
  }

  onBack(): void {
    // Logout and return to landing page
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
