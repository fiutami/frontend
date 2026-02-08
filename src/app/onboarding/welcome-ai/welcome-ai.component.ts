import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { SharedModule } from '../../shared/shared.module';
import { SpeechBubbleComponent } from '../../shared/components/speech-bubble';
import { AiMessageBubbleComponent } from '../../shared/components/ai-message-bubble';
import { LanguageBottomSheetComponent } from '../../hero/language-bottom-sheet';
import { LanguageService, SupportedLanguage } from '../../core/i18n/language.service';

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
    TranslateModule,
    SharedModule,
    SpeechBubbleComponent,
    AiMessageBubbleComponent,
    LanguageBottomSheetComponent,
  ],
  templateUrl: './welcome-ai.component.html',
  styleUrls: ['./welcome-ai.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeAiComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);
  private readonly translateService = inject(TranslateService);
  private destroy$ = new Subject<void>();

  /**
   * Whether the language bottom sheet is open
   */
  protected showLanguageSheet = signal(false);

  /**
   * Fiuto's current message
   */
  protected fiutoMessage = signal('');

  /**
   * Whether user has made a selection (shows response message)
   */
  protected hasSelected = signal(false);

  /**
   * Which option was selected
   */
  protected selectedOption = signal<'has-pet' | 'wants-pet' | null>(null);

  /**
   * Current language code for bottom sheet
   */
  get currentLanguage(): string {
    return this.languageService.currentLanguage;
  }

  ngOnInit(): void {
    this.updateFiutoMessage('onboarding.welcome.question');

    // Update message when language changes
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.hasSelected()) {
          this.updateFiutoMessage('onboarding.welcome.question');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFiutoMessage(key: string): void {
    this.translateService.get(key).subscribe(msg => {
      this.fiutoMessage.set(msg);
    });
  }

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
    this.languageService.setLanguage(code as SupportedLanguage);
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
    this.updateFiutoMessage('onboarding.welcome.hasPetResponse');

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
    this.updateFiutoMessage('onboarding.welcome.wantsPetResponse');

    // Navigate after a short delay to show the response
    setTimeout(() => {
      this.router.navigate(['/onboarding/quiz']);
    }, 1500);
  }
}
