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
 * SpeciesQ5Component - Question 5: Pet desire
 *
 * Asks user what they want from their pet.
 *
 * Options: Compagnia e affetto, Tranquillità e silenzio, Attività assieme, Un animale indipendente
 */
@Component({
  selector: 'app-species-q5',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    SpeechBubbleComponent,
    AnswerSquareComponent,
    PageBackgroundComponent,
  ],
  templateUrl: './species-q5.component.html',
  styleUrls: ['./species-q5.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesQ5Component implements OnInit {
  private router = inject(Router);
  private translate = inject(TranslateService);
  private questionnaireService = inject(SpeciesQuestionnaireService);

  /** Intro message displayed in blue bubble */
  readonly introMessage = this.translate.instant('onboarding.speciesQuiz.q5.intro');

  /** Question text */
  readonly question = this.translate.instant('onboarding.speciesQuiz.q5.question');

  /** Answer options */
  readonly options: AnswerOption[] = [
    { value: 'compagnia', label: this.translate.instant('onboarding.speciesQuiz.q5.companionship') },
    { value: 'tranquillita', label: this.translate.instant('onboarding.speciesQuiz.q5.tranquility') },
    { value: 'attivita', label: this.translate.instant('onboarding.speciesQuiz.q5.activity') },
    { value: 'indipendente', label: this.translate.instant('onboarding.speciesQuiz.q5.independent') },
  ];

  /** Currently selected answer */
  selectedAnswer = signal<string | null>(null);

  ngOnInit(): void {
    // Load previous answer if exists
    const previousAnswer = this.questionnaireService.getAnswer('q5_desire');
    if (previousAnswer) {
      this.selectedAnswer.set(previousAnswer);
    }
  }

  /**
   * Navigate back to Q4
   */
  onBack(): void {
    this.router.navigate(['/home/species-questionnaire/q4']);
  }

  /**
   * Handle answer selection
   * Saves answer and navigates to next question
   */
  onAnswerSelect(value: string): void {
    this.selectedAnswer.set(value);
    this.questionnaireService.setAnswer('q5_desire', value);

    // Navigate directly to Q6
    this.router.navigate(['/home/species-questionnaire/q6']);
  }
}
