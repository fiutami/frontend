import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../../shared/shared.module';
import { SpeechBubbleComponent } from '../../../shared/components/speech-bubble/speech-bubble.component';
import { AnswerSquareComponent, AnswerOption } from '../../../shared/components/answer-square';
import { SpeciesQuestionnaireService } from '../species-questionnaire.service';
import { PageBackgroundComponent } from '../../../shared/components/page-background/page-background.component';

/**
 * SpeciesQ1Component - Question 1: Time Dedication
 *
 * First question of the species questionnaire flow.
 * Asks user how much time they can dedicate to a pet daily.
 *
 * Options: Poco (little), Medio (medium), Molto (a lot)
 *
 * Based on Figma design: mob_ai_species_q1
 */
@Component({
  selector: 'app-species-q1',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    SpeechBubbleComponent,
    AnswerSquareComponent,
    PageBackgroundComponent,
  ],
  templateUrl: './species-q1.component.html',
  styleUrls: ['./species-q1.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesQ1Component implements OnInit {
  private router = inject(Router);
  private translate = inject(TranslateService);
  private questionnaireService = inject(SpeciesQuestionnaireService);

  /** Intro message displayed in blue bubble */
  readonly introMessage = this.translate.instant('onboarding.speciesQuiz.q1.intro');

  /** Question text */
  readonly question = this.translate.instant('onboarding.speciesQuiz.q1.question');

  /** Answer options */
  readonly options: AnswerOption[] = [
    { value: 'poco', label: this.translate.instant('onboarding.speciesQuiz.q1.poco') },
    { value: 'medio', label: this.translate.instant('onboarding.speciesQuiz.q1.medio') },
    { value: 'molto', label: this.translate.instant('onboarding.speciesQuiz.q1.molto') },
  ];

  /** Currently selected answer */
  selectedAnswer = signal<string | null>(null);

  ngOnInit(): void {
    // Load previous answer if exists
    const previousAnswer = this.questionnaireService.getAnswer('q1_time');
    if (previousAnswer) {
      this.selectedAnswer.set(previousAnswer);
    }
  }

  /**
   * Navigate back to welcome-ai/2b
   */
  onBack(): void {
    this.router.navigate(['/home/welcome-ai/2b']);
  }

  /**
   * Handle answer selection
   * Saves answer and navigates to next question
   */
  onAnswerSelect(value: string): void {
    this.selectedAnswer.set(value);
    this.questionnaireService.setAnswer('q1_time', value);

    // Navigate directly to Q2 (no delay)
    this.router.navigate(['/home/species-questionnaire/q2']);
  }
}
