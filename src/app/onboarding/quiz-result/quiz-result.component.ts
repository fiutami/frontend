import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { QuizMatchingService, SpeciesMatch } from '../services/quiz-matching.service';
import { QuizAnswers, EMPTY_QUIZ_STATE } from '../quiz/quiz.models';
import { PrototypeService } from '../../profile/services/prototype.service';

/**
 * QuizResultComponent - Species matching result screen
 *
 * Shows the best matching pet species based on quiz answers.
 * Displays compatibility percentage and suggested breed.
 *
 * Based on Figma design: node-id 12271-7583
 */
@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './quiz-result.component.html',
  styleUrls: ['./quiz-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizResultComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly matchingService = inject(QuizMatchingService);
  private readonly prototypeService = inject(PrototypeService);

  /** Top match result */
  protected topMatch = signal<SpeciesMatch | null>(null);

  /** All matches for "explore more" */
  protected allMatches = signal<SpeciesMatch[]>([]);

  /** Fiuto message */
  protected fiutoMessage = signal('Ottima scelta! Questo animale fa per te!');

  ngOnInit(): void {
    this.loadResults();
  }

  /**
   * Load quiz answers and calculate matches
   */
  private loadResults(): void {
    const storedAnswers = sessionStorage.getItem('quizAnswers');

    if (storedAnswers) {
      try {
        const answers: QuizAnswers = JSON.parse(storedAnswers);
        const matches = this.matchingService.calculateMatches(answers);

        if (matches.length > 0) {
          this.topMatch.set(matches[0]);
          this.allMatches.set(matches);

          // Update Fiuto message based on compatibility
          if (matches[0].compatibility >= 90) {
            this.fiutoMessage.set('Match perfetto! Questo animale e fatto per te!');
          } else if (matches[0].compatibility >= 75) {
            this.fiutoMessage.set('Ottima compatibilita! Sareste una bella coppia!');
          } else {
            this.fiutoMessage.set('Potrebbe essere un buon inizio! Scopri di piu.');
          }
        }
      } catch (e) {
        console.error('Failed to parse quiz answers:', e);
        this.router.navigate(['/onboarding/quiz']);
      }
    } else {
      // No answers, redirect to quiz
      this.router.navigate(['/onboarding/quiz']);
    }
  }

  /**
   * Navigate back to quiz
   */
  onBack(): void {
    this.router.navigate(['/onboarding/quiz']);
  }

  /**
   * Explore selected species - save to prototype and navigate
   */
  onExploreSpecies(): void {
    const match = this.topMatch();
    if (match) {
      // Save prototype data for Path B users
      this.prototypeService.savePrototypeData({
        speciesId: match.id,
        speciesName: match.name,
        suggestedBreed: match.suggestedBreed,
        compatibility: match.compatibility,
        icon: match.icon,
        description: match.description,
      });
      this.router.navigate(['/profile/prototype']);
    }
  }

  /**
   * Explore all species
   */
  onExploreAll(): void {
    this.router.navigate(['/home/breeds']);
  }

  /**
   * Skip to pet registration
   */
  onRegisterAnyway(): void {
    this.router.navigate(['/onboarding/register-pet']);
  }
}
