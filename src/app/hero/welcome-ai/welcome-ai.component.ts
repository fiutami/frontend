import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

/**
 * WelcomeAiComponent - AI Onboarding Page (Legacy)
 *
 * This component is maintained for backward compatibility.
 * It automatically redirects to the new AI onboarding flow (welcome-ai/1).
 *
 * Previous behavior:
 * - Showed AI assistant with speech bubble for pet registration
 *
 * New behavior:
 * - Redirects to /home/welcome-ai/1 on init
 *
 * Based on Figma design: FxJsfOV7R7qoXBM2xTyXRE, node 12284:4265
 */
@Component({
  selector: 'app-welcome-ai',
  templateUrl: './welcome-ai.component.html',
  styleUrls: ['./welcome-ai.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WelcomeAiComponent implements OnInit {
  /** AI assistant message displayed in speech bubble */
  readonly aiMessage = 'Perfetto. Registriamo insieme il tuo animale così potremo entrare nel mondo di Fiutami.';

  /** CTA text shown in speech bubble near play button */
  readonly ctaText = 'Premi Play e iniziamo!!';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Note: This is legacy component, kept for backward compatibility
    // Does not auto-redirect anymore
  }

  /**
   * Navigate back to welcome/choice page
   */
  onBack(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Start the pet registration flow
   */
  onPlayStart(): void {
    this.router.navigate(['/home/pet-register']);
  }
}
