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
import { PageBackgroundComponent } from '../../../shared/components/page-background/page-background.component';

/**
 * WelcomeAi2bComponent - Pet seeker introduction
 *
 * Introduction screen for users who want to find a pet.
 * Shows a message from Fiuto and a CTA that opens "Coming Soon" modal.
 *
 * Route: /home/welcome-ai/2b
 * Trigger: User selected "Vorrei un animale" in welcome-ai-1
 */
@Component({
  selector: 'app-welcome-ai-2b',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SpeechBubbleComponent,
    LanguageBottomSheetComponent,
    PageBackgroundComponent,
  ],
  templateUrl: './welcome-ai-2b.component.html',
  styleUrls: ['./welcome-ai-2b.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeAi2bComponent {
  private readonly router = inject(Router);

  /**
   * AI assistant message displayed in speech bubble
   */
  readonly aiMessage =
    'Il mondo è pieno di animali meravigliosi. Per aiutarti a trovare quello giusto, iniziamo a conoscerti meglio.';

  /**
   * CTA text shown in speech bubble
   */
  readonly ctaText = 'Trova il tuo amico!';

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
   * Navigate to species questionnaire
   */
  onCtaClick(): void {
    this.router.navigate(['/home/species-questionnaire/q1']);
  }

}
