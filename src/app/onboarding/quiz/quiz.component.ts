import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import {
  QuizState,
  QuizAnswers,
  QuizPhase,
  QuizQuestion,
  EMPTY_QUIZ_STATE,
  QUIZ_PHASES,
} from './quiz.models';

/**
 * QuizComponent - Onboarding questionnaire
 *
 * 3-phase questionnaire to help users find the right pet.
 * Each phase has 3 questions with button-based answers.
 *
 * Based on Figma design: node-id 12271-7559, 12271-7567, 12271-7575
 */
@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizComponent {
  private readonly router = inject(Router);

  /** Quiz phases configuration */
  protected readonly phases = QUIZ_PHASES;

  /** Current phase (1-3) */
  protected currentPhase = signal<1 | 2 | 3>(1);

  /** Current question index (0-2) */
  protected currentQuestion = signal<0 | 1 | 2>(0);

  /** Quiz answers */
  protected answers = signal<QuizAnswers>(structuredClone(EMPTY_QUIZ_STATE.answers));

  /** Current phase data */
  protected currentPhaseData = computed<QuizPhase>(() => {
    return this.phases[this.currentPhase() - 1];
  });

  /** Current question data */
  protected currentQuestionData = computed<QuizQuestion>(() => {
    return this.currentPhaseData().questions[this.currentQuestion()];
  });

  /** Progress percentage */
  protected progressPercent = computed(() => {
    const totalQuestions = 9;
    const answeredQuestions = (this.currentPhase() - 1) * 3 + this.currentQuestion();
    return Math.round((answeredQuestions / totalQuestions) * 100);
  });

  /** Current answer for the active question */
  protected currentAnswer = computed<string | null>(() => {
    const phase = this.currentPhase();
    const q = this.currentQuestion();
    const ans = this.answers();
    const phaseKey = `phase${phase}` as keyof QuizAnswers;
    const qKey = `q${q + 1}` as 'q1' | 'q2' | 'q3';
    return ans[phaseKey][qKey];
  });

  /**
   * Navigate back - previous question, phase, or welcome screen
   */
  onBack(): void {
    const phase = this.currentPhase();
    const question = this.currentQuestion();

    if (question > 0) {
      // Previous question in same phase
      this.currentQuestion.set((question - 1) as 0 | 1 | 2);
    } else if (phase > 1) {
      // Last question of previous phase
      this.currentPhase.set((phase - 1) as 1 | 2 | 3);
      this.currentQuestion.set(2);
    } else {
      // Back to welcome screen
      this.router.navigate(['/onboarding/welcome']);
    }
  }

  /**
   * Select an answer for current question
   */
  onAnswerSelect(value: string): void {
    const phase = this.currentPhase();
    const q = this.currentQuestion();

    // Update answer
    this.answers.update(ans => {
      const updated = structuredClone(ans);
      const phaseKey = `phase${phase}` as keyof QuizAnswers;
      const qKey = `q${q + 1}` as 'q1' | 'q2' | 'q3';
      updated[phaseKey][qKey] = value;
      return updated;
    });

    // Auto-advance after short delay
    setTimeout(() => this.goNext(), 300);
  }

  /**
   * Go to next question or phase
   */
  private goNext(): void {
    const phase = this.currentPhase();
    const question = this.currentQuestion();

    if (question < 2) {
      // Next question in same phase
      this.currentQuestion.set((question + 1) as 0 | 1 | 2);
    } else if (phase < 3) {
      // First question of next phase
      this.currentPhase.set((phase + 1) as 1 | 2 | 3);
      this.currentQuestion.set(0);
    } else {
      // Quiz complete - go to result
      this.onQuizComplete();
    }
  }

  /**
   * Handle quiz completion
   */
  private onQuizComplete(): void {
    // Store answers in session storage for result page
    sessionStorage.setItem('quizAnswers', JSON.stringify(this.answers()));

    // Navigate to result (placeholder for now)
    this.router.navigate(['/onboarding/quiz-result']);
  }
}
