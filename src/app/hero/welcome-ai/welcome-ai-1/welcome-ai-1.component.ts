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
import { AiMessageBubbleComponent } from '../../../shared/components/ai-message-bubble';
import { LanguageBottomSheetComponent } from '../../language-bottom-sheet';

/**
 * WelcomeAi1Component - Initial AI onboarding question
 *
 * First screen in the AI onboarding flow where users choose between:
 * - "Ho un animale" (I have a pet) → routes to welcome-ai/2a
 * - "Vorrei un animale" (I want a pet) → routes to welcome-ai/2b
 *
 * After selection, Fiuto responds with an appropriate message before navigating.
 */
@Component({
  selector: 'app-welcome-ai-1',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SpeechBubbleComponent,
    AiMessageBubbleComponent,
    LanguageBottomSheetComponent,
  ],
  templateUrl: './welcome-ai-1.component.html',
  styleUrls: ['./welcome-ai-1.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeAi1Component {
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
   * Fiuto's current message
   */
  protected fiutoMessage = signal(
    'Ciao! Sono Fiuto, il tuo assistente peloso. Dimmi, hai già un amico a quattro zampe?'
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
   * User selects "Ho un animale"
   */
  onHasPetClick(): void {
    this.selectedOption.set('has-pet');
    this.hasSelected.set(true);
    this.fiutoMessage.set(
      'Perfetto! Registriamo insieme il tuo animale così potremo entrare nel mondo di Fiutami.'
    );

    // Navigate after a short delay to show the response
    setTimeout(() => {
      this.router.navigate(['/home/welcome-ai/2a']);
    }, 1500);
  }

  /**
   * User selects "Vorrei un animale"
   */
  onWantsPetClick(): void {
    this.selectedOption.set('wants-pet');
    this.hasSelected.set(true);
    this.fiutoMessage.set(
      'Il mondo è pieno di animali meravigliosi. Per aiutarti a trovare quello giusto, iniziamo a conoscerti meglio.'
    );

    // Navigate after a short delay to show the response
    setTimeout(() => {
      this.router.navigate(['/home/welcome-ai/2b']);
    }, 1500);
  }
}
