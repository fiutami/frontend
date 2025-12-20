import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { SharedModule } from '../../shared/shared.module';
import {
  QuizState,
  QuizAnswers,
  QuizPhase,
  QuizQuestion,
  EMPTY_QUIZ_STATE,
} from './quiz.models';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, SharedModule, TranslateModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  /** Quiz phases - generated dynamically from i18n */
  protected phases = signal<QuizPhase[]>([]);

  /** Current phase (1-3) */
  protected currentPhase = signal<1 | 2 | 3>(1);

  /** Current question index (0-2) */
  protected currentQuestion = signal<0 | 1 | 2>(0);

  /** Quiz answers */
  protected answers = signal<QuizAnswers>(structuredClone(EMPTY_QUIZ_STATE.answers));

  /** Loading state */
  protected isLoading = signal(true);

  ngOnInit(): void {
    this.loadTranslatedPhases();

    // Reload when language changes
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadTranslatedPhases();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTranslatedPhases(): void {
    const t = (key: string) => this.translateService.instant(key);

    const phases: QuizPhase[] = [
      {
        id: 1,
        title: t('quiz.phase1.title'),
        questions: [
          {
            id: 'activity',
            text: t('quiz.phase1.activity.question'),
            options: [
              { value: 'sedentary', label: t('quiz.phase1.activity.sedentary') },
              { value: 'moderate', label: t('quiz.phase1.activity.moderate') },
              { value: 'active', label: t('quiz.phase1.activity.active') },
            ],
          },
          {
            id: 'location',
            text: t('quiz.phase1.location.question'),
            options: [
              { value: 'city', label: t('quiz.phase1.location.city') },
              { value: 'suburbs', label: t('quiz.phase1.location.suburbs') },
              { value: 'countryside', label: t('quiz.phase1.location.countryside') },
            ],
          },
          {
            id: 'other_pets',
            text: t('quiz.phase1.otherPets.question'),
            options: [
              { value: 'yes', label: t('quiz.phase1.otherPets.yes') },
              { value: 'no', label: t('quiz.phase1.otherPets.no') },
            ],
          },
        ],
      },
      {
        id: 2,
        title: t('quiz.phase2.title'),
        questions: [
          {
            id: 'housing',
            text: t('quiz.phase2.housing.question'),
            options: [
              { value: 'apartment', label: t('quiz.phase2.housing.apartment') },
              { value: 'house', label: t('quiz.phase2.housing.house') },
              { value: 'house_garden', label: t('quiz.phase2.housing.houseGarden') },
            ],
          },
          {
            id: 'size',
            text: t('quiz.phase2.size.question'),
            options: [
              { value: 'small', label: t('quiz.phase2.size.small') },
              { value: 'medium', label: t('quiz.phase2.size.medium') },
              { value: 'large', label: t('quiz.phase2.size.large') },
            ],
          },
          {
            id: 'outdoor',
            text: t('quiz.phase2.outdoor.question'),
            options: [
              { value: 'yes', label: t('quiz.phase2.outdoor.yes') },
              { value: 'no', label: t('quiz.phase2.outdoor.no') },
            ],
          },
        ],
      },
      {
        id: 3,
        title: t('quiz.phase3.title'),
        questions: [
          {
            id: 'hours',
            text: t('quiz.phase3.hours.question'),
            options: [
              { value: 'few', label: t('quiz.phase3.hours.few') },
              { value: 'some', label: t('quiz.phase3.hours.some') },
              { value: 'many', label: t('quiz.phase3.hours.many') },
            ],
          },
          {
            id: 'travel',
            text: t('quiz.phase3.travel.question'),
            options: [
              { value: 'yes', label: t('quiz.phase3.travel.yes') },
              { value: 'no', label: t('quiz.phase3.travel.no') },
            ],
          },
          {
            id: 'experience',
            text: t('quiz.phase3.experience.question'),
            options: [
              { value: 'none', label: t('quiz.phase3.experience.none') },
              { value: 'little', label: t('quiz.phase3.experience.little') },
              { value: 'much', label: t('quiz.phase3.experience.much') },
            ],
          },
        ],
      },
    ];

    this.phases.set(phases);
    this.isLoading.set(false);
  }

  /** Current phase data */
  protected currentPhaseData = computed<QuizPhase>(() => {
    const allPhases = this.phases();
    if (allPhases.length === 0) {
      return { id: 1, title: '', questions: [] };
    }
    return allPhases[this.currentPhase() - 1];
  });

  /** Current question data */
  protected currentQuestionData = computed<QuizQuestion>(() => {
    const phase = this.currentPhaseData();
    if (!phase.questions.length) {
      return { id: '', text: '', options: [] };
    }
    return phase.questions[this.currentQuestion()];
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

  onBack(): void {
    const phase = this.currentPhase();
    const question = this.currentQuestion();

    if (question > 0) {
      this.currentQuestion.set((question - 1) as 0 | 1 | 2);
    } else if (phase > 1) {
      this.currentPhase.set((phase - 1) as 1 | 2 | 3);
      this.currentQuestion.set(2);
    } else {
      this.router.navigate(['/onboarding/welcome']);
    }
  }

  onAnswerSelect(value: string): void {
    const phase = this.currentPhase();
    const q = this.currentQuestion();

    this.answers.update(ans => {
      const updated = structuredClone(ans);
      const phaseKey = `phase${phase}` as keyof QuizAnswers;
      const qKey = `q${q + 1}` as 'q1' | 'q2' | 'q3';
      updated[phaseKey][qKey] = value;
      return updated;
    });

    setTimeout(() => this.goNext(), 300);
  }

  private goNext(): void {
    const phase = this.currentPhase();
    const question = this.currentQuestion();

    if (question < 2) {
      this.currentQuestion.set((question + 1) as 0 | 1 | 2);
    } else if (phase < 3) {
      this.currentPhase.set((phase + 1) as 1 | 2 | 3);
      this.currentQuestion.set(0);
    } else {
      this.onQuizComplete();
    }
  }

  private onQuizComplete(): void {
    sessionStorage.setItem('quizAnswers', JSON.stringify(this.answers()));
    this.router.navigate(['/onboarding/quiz-result']);
  }
}
