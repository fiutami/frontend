import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { SpeechBubbleComponent } from '../../../shared/components/speech-bubble/speech-bubble.component';
import { AnswerSquareComponent, AnswerOption } from '../../../shared/components/answer-square';
import { SpeciesQuestionnaireService } from '../species-questionnaire.service';

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
    SpeechBubbleComponent,
    AnswerSquareComponent,
  ],
  templateUrl: './species-q4.component.html',
  styleUrls: ['./species-q4.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesQ4Component implements OnInit {
  private router = inject(Router);
  private questionnaireService = inject(SpeciesQuestionnaireService);

  /** Intro message displayed in blue bubble */
  readonly introMessage =
    'Per consigliarti bene, dobbiamo considerare eventuali allergie.';

  /** Question text */
  readonly question = 'Ci sono allergie in casa?';

  /** Answer options */
  readonly options: AnswerOption[] = [
    { value: 'si', label: 'Sì' },
    { value: 'no', label: 'No' },
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
