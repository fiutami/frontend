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
 * SpeciesQ3Component - Question 3: Available space
 *
 * Asks user about available space for a pet.
 *
 * Options: Nessuno (solo interno), Balcone/piccolo spazio, Giardino
 */
@Component({
  selector: 'app-species-q3',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    SpeechBubbleComponent,
    AnswerSquareComponent,
    PageBackgroundComponent,
  ],
  templateUrl: './species-q3.component.html',
  styleUrls: ['./species-q3.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesQ3Component implements OnInit {
  private router = inject(Router);
  private translate = inject(TranslateService);
  private questionnaireService = inject(SpeciesQuestionnaireService);

  /** Intro message displayed in blue bubble */
  readonly introMessage = this.translate.instant('onboarding.speciesQuiz.q3.intro');

  /** Question text */
  readonly question = this.translate.instant('onboarding.speciesQuiz.q3.question');

  /** Answer options */
  readonly options: AnswerOption[] = [
    { value: 'interno', label: this.translate.instant('onboarding.speciesQuiz.q3.indoor') },
    { value: 'balcone', label: this.translate.instant('onboarding.speciesQuiz.q3.balcony') },
    { value: 'giardino', label: this.translate.instant('onboarding.speciesQuiz.q3.garden') },
  ];

  /** Currently selected answer */
  selectedAnswer = signal<string | null>(null);

  ngOnInit(): void {
    // Load previous answer if exists
    const previousAnswer = this.questionnaireService.getAnswer('q3_space');
    if (previousAnswer) {
      this.selectedAnswer.set(previousAnswer);
    }
  }

  /**
   * Navigate back to Q2
   */
  onBack(): void {
    this.router.navigate(['/home/species-questionnaire/q2']);
  }

  /**
   * Handle answer selection
   * Saves answer and navigates to next question
   */
  onAnswerSelect(value: string): void {
    this.selectedAnswer.set(value);
    this.questionnaireService.setAnswer('q3_space', value);

    // Navigate directly to Q4
    this.router.navigate(['/home/species-questionnaire/q4']);
  }
}
