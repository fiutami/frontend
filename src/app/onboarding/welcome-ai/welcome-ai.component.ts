import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SpeechBubbleComponent } from '../../shared/components/speech-bubble';
import { AiMessageBubbleComponent } from '../../shared/components/ai-message-bubble';
import { LanguageBottomSheetComponent } from '../../hero/language-bottom-sheet';

/**
 * WelcomeAiComponent - Onboarding welcome screen
 *
 * First screen after login/signup where users choose between:
 * - "Ho già un animale" (I have a pet) → routes to /onboarding/register-pet
 * - "Vorrei averne uno" (I want a pet) → routes to /onboarding/quiz
 *
 * Based on Figma design: node-id 12271-7531
 */
@Component({
  selector: 'app-onboarding-welcome-ai',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SpeechBubbleComponent,
    AiMessageBubbleComponent,
    LanguageBottomSheetComponent,
  ],
  templateUrl: './welcome-ai.component.html',
  styleUrls: ['./welcome-ai.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeAiComponent {
  private readonly router = inject(Router);

  /**
   * Whether the language bottom sheet is open
   */
  protected showLanguageSheet = signal(false);

  /**
   * Current selected language
   */
  protected currentLanguage = signal('it');

  /**
   * Fiuto's current message (Figma text)
   */
  protected fiutoMessage = signal(
    'Hai già un animale o vorresti averne uno?'
  );

  /**
   * Whether user has made a selection (shows response message)
   */
  protected hasSelected = signal(false);

  /**
   * Which option was selected
   */
  protected selectedOption = signal<'has-pet' | 'wants-pet' | null>(null);

  /**
   * Handle back button click - return to login
   */
  onBackClick(): void {
    this.router.navigate(['/']);
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
    // TODO: Implement actual language change logic
  }

  /**
   * Close language sheet
   */
  onLanguageSheetClosed(): void {
    this.showLanguageSheet.set(false);
  }

  /**
   * User selects "Ho già un animale"
   */
  onHasPetClick(): void {
    this.selectedOption.set('has-pet');
    this.hasSelected.set(true);
    this.fiutoMessage.set(
      'Perfetto! Registriamo insieme il tuo animale così potremo entrare nel mondo di Fiutami.'
    );

    // Navigate after a short delay to show the response
    setTimeout(() => {
      this.router.navigate(['/onboarding/register-pet']);
    }, 1500);
  }

  /**
   * User selects "Vorrei averne uno"
   */
  onWantsPetClick(): void {
    this.selectedOption.set('wants-pet');
    this.hasSelected.set(true);
    this.fiutoMessage.set(
      'Il mondo è pieno di animali meravigliosi. Per aiutarti a trovare quello giusto, iniziamo a conoscerti meglio.'
    );

    // Navigate after a short delay to show the response
    setTimeout(() => {
      this.router.navigate(['/onboarding/quiz']);
    }, 1500);
  }
}
