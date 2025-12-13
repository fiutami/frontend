import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { SpeechBubbleComponent } from '../../../shared/components/speech-bubble/speech-bubble.component';
import { AnswerSquareComponent, AnswerOption } from '../../../shared/components/answer-square';
import { SpeciesQuestionnaireService } from '../species-questionnaire.service';
import { PageBackgroundComponent } from '../../../shared/components/page-background/page-background.component';

/**
 * SpeciesQ6Component - Question 6: Care level
 *
 * Asks user how much care they can provide.
 * This is the last question - navigates to result.
 *
 * Options: Bassa, Media, Alta
 */
@Component({
  selector: 'app-species-q6',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SpeechBubbleComponent,
    AnswerSquareComponent,
    PageBackgroundComponent,
  ],
  templateUrl: './species-q6.component.html',
  styleUrls: ['./species-q6.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesQ6Component implements OnInit {
  private router = inject(Router);
  private questionnaireService = inject(SpeciesQuestionnaireService);

  /** Intro message displayed in blue bubble */
  readonly introMessage =
    'Alcuni animali richiedono molta cura, altri pochissima.';

  /** Question text */
  readonly question = 'Quanta cura puoi dedicargli?';

  /** Answer options */
  readonly options: AnswerOption[] = [
    { value: 'bassa', label: 'Bassa' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
  ];

  /** Currently selected answer */
  selectedAnswer = signal<string | null>(null);

  ngOnInit(): void {
    // Load previous answer if exists
    const previousAnswer = this.questionnaireService.getAnswer('q6_care');
    if (previousAnswer) {
      this.selectedAnswer.set(previousAnswer);
    }
  }

  /**
   * Navigate back to Q5
   */
  onBack(): void {
    this.router.navigate(['/home/species-questionnaire/q5']);
  }

  /**
   * Handle answer selection
   * Saves answer and navigates to result
   */
  onAnswerSelect(value: string): void {
    this.selectedAnswer.set(value);
    this.questionnaireService.setAnswer('q6_care', value);

    // Navigate to result page
    this.router.navigate(['/home/species-questionnaire/result']);
  }
}
