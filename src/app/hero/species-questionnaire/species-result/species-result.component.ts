import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { SpeechBubbleComponent } from '../../../shared/components/speech-bubble/speech-bubble.component';
import { SpeciesQuestionnaireService } from '../species-questionnaire.service';
import { PageBackgroundComponent } from '../../../shared/components/page-background/page-background.component';

/**
 * SpeciesResultComponent - Questionnaire Result
 *
 * Shows the recommended species based on questionnaire answers.
 * For now shows a placeholder "Gatto" result.
 * In the future: analyze answers and calculate best species match.
 */
@Component({
  selector: 'app-species-result',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SpeechBubbleComponent,
    PageBackgroundComponent,
  ],
  templateUrl: './species-result.component.html',
  styleUrls: ['./species-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesResultComponent {
  private router = inject(Router);
  private questionnaireService = inject(SpeciesQuestionnaireService);

  /** Intro message displayed in blue bubble */
  readonly introMessage =
    'In base alle tue risposte, penso che questa sia la specie più adatta al tuo stile di vita.';

  /** Fiuto speech bubble message */
  readonly fiutoMessage = 'Ho trovato la specie giusta per te!';

  /** Placeholder result - in future this will be calculated */
  readonly recommendedSpecies = {
    name: 'Gatto',
    image: 'assets/images/species/cat.png',
    description: 'Un compagno indipendente ma affettuoso, perfetto per il tuo stile di vita.',
  };

  /**
   * Navigate back to Q6
   */
  onBack(): void {
    this.router.navigate(['/home/species-questionnaire/q6']);
  }

  /**
   * Start a new questionnaire
   */
  onRestart(): void {
    this.questionnaireService.reset();
    this.router.navigate(['/home/species-questionnaire/q1']);
  }

  /**
   * Continue to next step (placeholder for future)
   */
  onContinue(): void {
    // For now, navigate to home
    // In future: navigate to species details or adoption flow
    this.router.navigate(['/home']);
  }
}
