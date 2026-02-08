/**
 * QuestionnaireShellComponent - Quiz Style Layout
 *
 * Renders questionnaire with original quiz styling:
 * - Purple background
 * - Centered content
 * - Step indicator dots
 * - Compact option buttons
 *
 * @version 1.2
 */

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { FlowEngineService } from '../../engine/flow-engine.service';
import { ProfileManagerService } from '../../engine/profile-manager.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import {
  getQuestionnaireData,
  QUESTIONNAIRE_STATS
} from '../../data/questionnaire-data';

import { Question, QuestionOption } from '../../models/question.models';

interface StepDot {
  active: boolean;
  completed: boolean;
}

@Component({
  selector: 'app-questionnaire-shell',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './questionnaire-shell.component.html',
  styleUrls: ['./questionnaire-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireShellComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly flowEngine = inject(FlowEngineService);
  private readonly profileManager = inject(ProfileManagerService);
  private readonly analytics = inject(AnalyticsService);

  /** Entry question ID (default: Q00_ENTRY) */
  entryQuestionId = input<string>('Q00_ENTRY');

  /** Emitted when questionnaire is completed */
  completed = output<void>();

  /** Loading state */
  protected isInitializing = signal(true);

  /** Error state */
  protected error = signal<string | null>(null);

  /** Reactive trigger: bumped when translations load or language changes */
  private translationReady = signal(0);
  private langSub?: Subscription;

  /** Questions per step (for grouping) */
  private readonly QUESTIONS_PER_STEP = 3;

  /** Track answered questions in current step */
  private answeredInStep = signal(0);

  // Expose flow engine signals
  protected currentQuestion = this.flowEngine.currentQuestion;
  protected currentModule = this.flowEngine.currentModule;
  protected isLoading = this.flowEngine.isLoading;
  protected isComplete = this.flowEngine.isComplete;
  protected canGoBack = this.flowEngine.canGoBack;
  protected progress = this.flowEngine.progress;
  protected currentLeaf = this.flowEngine.currentLeaf;

  /** Translated question text (reactive to language/translation loading) */
  protected questionText = computed(() => {
    this.translationReady(); // dependency: re-evaluate when translations load
    const q = this.currentQuestion();
    if (!q) return '';
    return this.translateService.instant(q.textKey);
  });

  /** Translated hint text (reactive to language/translation loading) */
  protected hintText = computed(() => {
    this.translationReady();
    const q = this.currentQuestion();
    if (!q?.hintKey) return null;
    return this.translateService.instant(q.hintKey);
  });

  /** Translated module title (reactive to language/translation loading) */
  protected moduleTitle = computed(() => {
    this.translationReady();
    const m = this.currentModule();
    if (!m) return null;
    return this.translateService.instant(m.titleKey);
  });

  /** Current step number (1-based) */
  protected currentStep = computed(() => {
    const answered = this.flowEngine.getAnsweredQuestionIds().length;
    return Math.floor(answered / this.QUESTIONS_PER_STEP) + 1;
  });

  /** Total steps (approximation) */
  protected totalSteps = computed(() => {
    return Math.ceil(QUESTIONNAIRE_STATS.totalQuestions / this.QUESTIONS_PER_STEP);
  });

  /** Step dots for current step (3 dots) */
  protected stepDots = computed((): StepDot[] => {
    const answered = this.answeredInStep();
    return [
      { active: answered === 0, completed: answered > 0 },
      { active: answered === 1, completed: answered > 1 },
      { active: answered === 2, completed: answered > 2 }
    ];
  });

  /** Check if current question should use grid layout */
  protected isGridLayout = computed(() => {
    const q = this.currentQuestion();
    return q?.visualization === 'squares';
  });

  /** Stats for display */
  protected stats = QUESTIONNAIRE_STATS;

  ngOnInit(): void {
    // React to translation loading and language changes
    this.langSub = this.translateService.onLangChange.subscribe(() => {
      this.translationReady.update(n => n + 1);
    });
    // Also react to initial translation file load (onDefaultLangChange fires on first load)
    const defaultSub = this.translateService.onDefaultLangChange.subscribe(() => {
      this.translationReady.update(n => n + 1);
      defaultSub.unsubscribe();
    });

    this.initializeQuestionnaire();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    // Flush any pending analytics
    this.analytics.flush();
  }

  /**
   * Initialize the questionnaire flow engine.
   */
  private async initializeQuestionnaire(): Promise<void> {
    try {
      // Wait for translations to be loaded before starting
      const lang = this.translateService.currentLang || this.translateService.defaultLang || 'it';
      await this.translateService.use(lang).toPromise();
      this.translationReady.update(n => n + 1);

      // Load question data
      const data = getQuestionnaireData();
      this.flowEngine.loadQuestionData(
        data.questions,
        data.modules,
        data.leaves,
        data.order
      );

      // Start flow
      await this.flowEngine.start(this.entryQuestionId());

      this.isInitializing.set(false);
    } catch (err) {
      console.error('[QuestionnaireShell] Failed to initialize:', err);
      this.error.set('questionnaire.errors.init_failed');
      this.isInitializing.set(false);
    }
  }

  /**
   * Handle option selection.
   */
  protected async onOptionSelected(option: QuestionOption): Promise<void> {
    try {
      // Update step progress
      this.answeredInStep.update(n => {
        const next = n + 1;
        // Reset after 3 questions
        return next >= this.QUESTIONS_PER_STEP ? 0 : next;
      });

      await this.flowEngine.selectOption(option);

      // Check if completed
      if (this.isComplete()) {
        this.handleCompletion();
      }
    } catch (err) {
      console.error('[QuestionnaireShell] Option selection failed:', err);
      this.error.set('questionnaire.errors.selection_failed');
    }
  }

  /**
   * Handle back navigation.
   */
  protected onBack(): void {
    if (this.canGoBack()) {
      // Update step progress
      this.answeredInStep.update(n => {
        const prev = n - 1;
        return prev < 0 ? this.QUESTIONS_PER_STEP - 1 : prev;
      });
      this.flowEngine.goBack();
    } else {
      // Exit questionnaire
      this.router.navigate(['/onboarding/welcome']);
    }
  }

  /**
   * Handle questionnaire completion.
   */
  private handleCompletion(): void {
    const leaf = this.currentLeaf();

    if (leaf?.type === 'redirect' && leaf.route) {
      this.router.navigate([leaf.route]);
    } else if (leaf?.type === 'recommendation') {
      // Navigate to results page with profile
      this.router.navigate(['/onboarding/questionnaire-result']);
    }

    this.completed.emit();
  }

  /**
   * Get translated option label.
   */
  protected getOptionLabel(option: QuestionOption): string {
    return this.translateService.instant(option.labelKey);
  }

  /**
   * Get translated option description.
   */
  protected getOptionDescription(option: QuestionOption): string | null {
    if (!option.descriptionKey) return null;
    return this.translateService.instant(option.descriptionKey);
  }

  /**
   * Close error message.
   */
  protected dismissError(): void {
    this.error.set(null);
  }

  /**
   * Handle logo load error.
   */
  protected onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
