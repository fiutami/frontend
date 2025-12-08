import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { SpeechBubbleComponent } from '../../../shared/components/speech-bubble';
import { LanguageBottomSheetComponent } from '../../language-bottom-sheet';

/**
 * WelcomeAi2aComponent - Pet owner introduction
 *
 * Introduction screen for users who have a pet.
 * Shows a message from Fiuto and a CTA to start pet registration.
 *
 * Route: /home/welcome-ai/2a
 * Trigger: User selected "Ho un animale" in welcome-ai-1
 */
@Component({
  selector: 'app-welcome-ai-2a',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SpeechBubbleComponent,
    LanguageBottomSheetComponent,
  ],
  templateUrl: './welcome-ai-2a.component.html',
  styleUrls: ['./welcome-ai-2a.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeAi2aComponent {
  private readonly router = inject(Router);

  /**
   * AI assistant message displayed in speech bubble
   */
  readonly aiMessage =
    'Perfetto. Registriamo insieme il tuo animale così potremo entrare nel mondo di Fiutami.';

  /**
   * CTA text shown in speech bubble
   */
  readonly ctaText = 'Premi e iniziamo!!';

  /**
   * Whether the language bottom sheet is open
   */
  protected showLanguageSheet = signal(false);

  /**
   * Current selected language
   */
  protected currentLanguage = signal('it');

  /**
   * Navigate back to welcome-ai-1
   */
  onBack(): void {
    this.router.navigate(['/home/welcome-ai/1']);
  }

  /**
   * Handle language icon click
   */
  onLanguageClick(): void {
    this.showLanguageSheet.set(true);
  }

  /**
   * Handle language selection
   */
  onLanguageSelected(code: string): void {
    this.currentLanguage.set(code);
  }

  /**
   * Close language sheet
   */
  onLanguageSheetClosed(): void {
    this.showLanguageSheet.set(false);
  }

  /**
   * Start the pet registration flow
   */
  onCtaClick(): void {
    this.router.navigate(['/home/pet-register']);
  }
}
