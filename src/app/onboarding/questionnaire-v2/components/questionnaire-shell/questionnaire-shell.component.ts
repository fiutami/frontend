/**
 * QuestionnaireShellComponent - Main orchestrator for Questionnaire v1.1
 *
 * Responsibilities:
 * - Initialize FlowEngine with question data
 * - Coordinate navigation between questions
 * - Show progress and module info
 * - Handle completion and redirect to results
 *
 * @version 1.1
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FlowEngineService } from '../../engine/flow-engine.service';
import { ProfileManagerService } from '../../engine/profile-manager.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import {
  getQuestionnaireData,
  QUESTIONNAIRE_STATS
} from '../../data/questionnaire-data';

import { QuestionRendererComponent } from '../question-renderer/question-renderer.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { Question, QuestionOption } from '../../models/question.models';

@Component({
  selector: 'app-questionnaire-shell',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    QuestionRendererComponent,
    ProgressBarComponent
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

  // Expose flow engine signals
  protected currentQuestion = this.flowEngine.currentQuestion;
  protected currentModule = this.flowEngine.currentModule;
  protected isLoading = this.flowEngine.isLoading;
  protected isComplete = this.flowEngine.isComplete;
  protected canGoBack = this.flowEngine.canGoBack;
  protected progress = this.flowEngine.progress;
  protected currentLeaf = this.flowEngine.currentLeaf;

  /** Translated question text */
  protected questionText = computed(() => {
    const q = this.currentQuestion();
    if (!q) return '';
    return this.translateService.instant(q.textKey);
  });

  /** Translated hint text */
  protected hintText = computed(() => {
    const q = this.currentQuestion();
    if (!q?.hintKey) return null;
    return this.translateService.instant(q.hintKey);
  });

  /** Translated module title */
  protected moduleTitle = computed(() => {
    const m = this.currentModule();
    if (!m) return null;
    return this.translateService.instant(m.titleKey);
  });

  /** Stats for display */
  protected stats = QUESTIONNAIRE_STATS;

  ngOnInit(): void {
    this.initializeQuestionnaire();
  }

  ngOnDestroy(): void {
    // Flush any pending analytics
    this.analytics.flush();
  }

  /**
   * Initialize the questionnaire flow engine.
   */
  private async initializeQuestionnaire(): Promise<void> {
    try {
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
   * Handle option selection from QuestionRenderer.
   */
  protected async onOptionSelected(option: QuestionOption): Promise<void> {
    try {
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
   * Reset and start over.
   */
  protected async onReset(): Promise<void> {
    await this.flowEngine.reset(this.entryQuestionId());
  }

  /**
   * Close error message.
   */
  protected dismissError(): void {
    this.error.set(null);
  }
}
