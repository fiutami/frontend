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
 * SpeciesQ4Component - Question 4: Allergies
 *
 * Asks user if there are allergies at home.
 *
 * Options: Sì, No
 */
@Component({
  selector: 'app-species-q4',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    SpeechBubbleComponent,
    AnswerSquareComponent,
    PageBackgroundComponent,
  ],
  templateUrl: './species-q4.component.html',
  styleUrls: ['./species-q4.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesQ4Component implements OnInit {
  private router = inject(Router);
  private translate = inject(TranslateService);
  private questionnaireService = inject(SpeciesQuestionnaireService);

  /** Intro message displayed in blue bubble */
  readonly introMessage = this.translate.instant('onboarding.speciesQuiz.q4.intro');

  /** Question text */
  readonly question = this.translate.instant('onboarding.speciesQuiz.q4.question');

  /** Answer options */
  readonly options: AnswerOption[] = [
    { value: 'si', label: this.translate.instant('onboarding.speciesQuiz.q4.yes') },
    { value: 'no', label: this.translate.instant('onboarding.speciesQuiz.q4.no') },
  ];

  /** Currently selected answer */
  selectedAnswer = signal<string | null>(null);

  ngOnInit(): void {
    // Load previous answer if exists
    const previousAnswer = this.questionnaireService.getAnswer('q4_allergies');
    if (previousAnswer) {
      this.selectedAnswer.set(previousAnswer);
    }
  }

  /**
   * Navigate back to Q3
   */
  onBack(): void {
    this.router.navigate(['/home/species-questionnaire/q3']);
  }

  /**
   * Handle answer selection
   * Saves answer and navigates to next question
   */
  onAnswerSelect(value: string): void {
    this.selectedAnswer.set(value);
    this.questionnaireService.setAnswer('q4_allergies', value);

    // Navigate directly to Q5
    this.router.navigate(['/home/species-questionnaire/q5']);
  }
}
