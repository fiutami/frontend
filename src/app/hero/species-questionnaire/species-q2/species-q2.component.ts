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
 * SpeciesQ2Component - Question 2: Time away from home
 *
 * Asks user how much time they spend away from home.
 *
 * Options: Meno di 2 ore, 2-6 ore, Più di 6 ore
 */
@Component({
  selector: 'app-species-q2',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    SpeechBubbleComponent,
    AnswerSquareComponent,
    PageBackgroundComponent,
  ],
  templateUrl: './species-q2.component.html',
  styleUrls: ['./species-q2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesQ2Component implements OnInit {
  private router = inject(Router);
  private translate = inject(TranslateService);
  private questionnaireService = inject(SpeciesQuestionnaireService);

  /** Intro message displayed in blue bubble */
  readonly introMessage = this.translate.instant('onboarding.speciesQuiz.q2.intro');

  /** Question text */
  readonly question = this.translate.instant('onboarding.speciesQuiz.q2.question');

  /** Answer options */
  readonly options: AnswerOption[] = [
    { value: 'meno_2h', label: this.translate.instant('onboarding.speciesQuiz.q2.less2h') },
    { value: '2_6h', label: this.translate.instant('onboarding.speciesQuiz.q2.2to6h') },
    { value: 'piu_6h', label: this.translate.instant('onboarding.speciesQuiz.q2.more6h') },
  ];

  /** Currently selected answer */
  selectedAnswer = signal<string | null>(null);

  ngOnInit(): void {
    // Load previous answer if exists
    const previousAnswer = this.questionnaireService.getAnswer('q2_presence');
    if (previousAnswer) {
      this.selectedAnswer.set(previousAnswer);
    }
  }

  /**
   * Navigate back to Q1
   */
  onBack(): void {
    this.router.navigate(['/home/species-questionnaire/q1']);
  }

  /**
   * Handle answer selection
   * Saves answer and navigates to next question
   */
  onAnswerSelect(value: string): void {
    this.selectedAnswer.set(value);
    this.questionnaireService.setAnswer('q2_presence', value);

    // Navigate directly to Q3
    this.router.navigate(['/home/species-questionnaire/q3']);
  }
}
