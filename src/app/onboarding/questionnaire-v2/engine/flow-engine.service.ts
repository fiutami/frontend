/**
 * Flow Engine Service for Questionnaire v1.1
 *
 * Core routing engine with:
 * - navigateTo() for forward navigation (module:, leaf:, Qxx)
 * - goBack() with answer invalidation
 * - nextOnSkip handling when showIf=false
 * - History tracking for back navigation
 *
 * CRITICAL FIX: When showIf=false, use nextOnSkip, NOT options[0].next
 *
 * @version 1.1
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ProfileManagerService } from './profile-manager.service';
import { ExpressionParserService } from './expression-parser.service';
import {
  Question,
  QuestionOption,
  QuestionModule,
  Leaf,
  QuestionsMap,
  ModulesMap,
  LeavesMap
} from '../models/question.models';
import {
  FlowState,
  SelectedOption,
  HistoryEntry,
  NavigationEvent,
  createInitialFlowState,
  parseDestination,
  deleteAnswer,
  serializeFlowState,
  deserializeFlowState
} from '../models/flow.models';

// ============================================================================
// Constants
// ============================================================================

const FLOW_STATE_STORAGE_KEY = 'fiutami_questionnaire_flow_state';

// ============================================================================
// Service
// ============================================================================

@Injectable({ providedIn: 'root' })
export class FlowEngineService {

  private readonly profileManager = inject(ProfileManagerService);
  private readonly expressionParser = inject(ExpressionParserService);
  private readonly analytics = inject(AnalyticsService);

  // Question data (loaded from data files)
  private questionsMap: QuestionsMap = {};
  private modulesMap: ModulesMap = {};
  private leavesMap: LeavesMap = {};
  private questionOrder: string[] = [];

  // Reactive state
  private readonly flowStateSignal = signal<FlowState | null>(null);
  private readonly currentQuestionSignal = signal<Question | null>(null);
  private readonly currentModuleSignal = signal<QuestionModule | null>(null);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly isCompleteSignal = signal<boolean>(false);
  private readonly currentLeafSignal = signal<Leaf | null>(null);

  // Question view timing
  private questionViewStartTime: number = 0;

  // Public computed values
  readonly flowState = this.flowStateSignal.asReadonly();
  readonly currentQuestion = this.currentQuestionSignal.asReadonly();
  readonly currentModule = this.currentModuleSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly isComplete = this.isCompleteSignal.asReadonly();
  readonly currentLeaf = this.currentLeafSignal.asReadonly();

  readonly canGoBack = computed(() => {
    const state = this.flowStateSignal();
    return state ? state.history.length > 0 : false;
  });

  readonly progress = computed(() => {
    const state = this.flowStateSignal();
    if (!state) return 0;
    const answered = Object.keys(state.answersByQuestionId).length;
    const total = this.questionOrder.length;
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  });

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Load question data. Call before starting.
   */
  loadQuestionData(
    questions: QuestionsMap,
    modules: ModulesMap,
    leaves: LeavesMap,
    order: string[]
  ): void {
    this.questionsMap = questions;
    this.modulesMap = modules;
    this.leavesMap = leaves;
    this.questionOrder = order;
  }

  /**
   * Start the questionnaire from the beginning or resume.
   */
  async start(entryNodeId: string = 'Q00_ENTRY'): Promise<void> {
    this.isLoadingSignal.set(true);

    try {
      // Initialize profile
      this.profileManager.initialize();

      // Try to resume existing flow
      const storedState = this.loadFlowStateFromStorage();
      if (storedState) {
        this.flowStateSignal.set(storedState);
        await this.navigateToInternal(storedState.currentNodeId, false);
        this.analytics.track('questionnaire_loaded', { resumed: true });
      } else {
        // Start fresh
        const initialState = createInitialFlowState(entryNodeId);
        this.flowStateSignal.set(initialState);
        this.saveFlowStateToStorage(initialState);
        await this.navigateToInternal(entryNodeId, false);
        this.analytics.track('questionnaire_started', {});
      }
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Reset and start over.
   */
  async reset(entryNodeId: string = 'Q00_ENTRY'): Promise<void> {
    this.clearFlowStateFromStorage();
    this.profileManager.reset();
    this.isCompleteSignal.set(false);
    this.currentLeafSignal.set(null);
    await this.start(entryNodeId);
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Select an option and navigate to next.
   */
  async selectOption(option: QuestionOption): Promise<void> {
    const state = this.flowStateSignal();
    const question = this.currentQuestionSignal();
    if (!state || !question) return;

    // Calculate time spent
    const timeSpentMs = Date.now() - this.questionViewStartTime;

    // 1. Apply set actions to profile
    this.profileManager.applySetActions(option.set);

    // 2. Record answer
    const selectedOption: SelectedOption = {
      optionId: option.id,
      option: option,
      timestamp: Date.now(),
      timeSpentMs
    };

    // 3. Add to history
    const historyEntry: HistoryEntry = {
      questionId: question.id,
      selectedOptionId: option.id,
      timestamp: Date.now()
    };

    // 4. Update state (immutably using Record operations)
    const newState: FlowState = {
      ...state,
      answersByQuestionId: {
        ...state.answersByQuestionId,
        [question.id]: selectedOption
      },
      history: [...state.history, historyEntry],
      lastUpdatedAt: Date.now()
    };

    this.flowStateSignal.set(newState);
    this.saveFlowStateToStorage(newState);

    // 5. Track analytics
    this.analytics.track('question_answered', {
      questionId: question.id,
      optionId: option.id,
      timeSpentMs
    });

    // 6. Navigate to next
    await this.navigateTo(option.next);
  }

  /**
   * Navigate to a destination.
   * Handles: question IDs, module:X, leaf:X
   */
  async navigateTo(destination: string): Promise<void> {
    await this.navigateToInternal(destination, true);
  }

  /**
   * Internal navigation with skip tracking option.
   */
  private async navigateToInternal(destination: string, trackNavigation: boolean): Promise<void> {
    const parsed = parseDestination(destination);
    const state = this.flowStateSignal();
    if (!state) return;

    switch (parsed.type) {
      case 'module':
        await this.enterModule(parsed.id);
        break;

      case 'leaf':
        await this.executeLeaf(parsed.id);
        break;

      case 'question':
      default:
        await this.navigateToQuestion(parsed.id, trackNavigation);
        break;
    }
  }

  /**
   * Navigate to a question, checking showIf.
   * CRITICAL: Uses nextOnSkip when showIf=false, NOT options[0].next
   */
  private async navigateToQuestion(questionId: string, trackNavigation: boolean): Promise<void> {
    const question = this.questionsMap[questionId];
    if (!question) {
      console.error(`[FlowEngine] Question not found: "${questionId}"`);
      return;
    }

    const profile = this.profileManager.getProfile();

    // Check showIf condition
    if (question.showIf) {
      const shouldShow = this.expressionParser.evaluate(question.showIf, profile);

      if (!shouldShow) {
        // FIX CRITICO: Usa nextOnSkip, NON options[0].next
        const skipTarget = question.nextOnSkip ?? this.findNextQuestionId(questionId);

        if (trackNavigation) {
          this.analytics.track('question_viewed', {
            questionId,
            skipped: true,
            skipReason: 'showIf_false'
          });
        }

        if (skipTarget) {
          await this.navigateToInternal(skipTarget, trackNavigation);
        } else {
          console.error(`[FlowEngine] No skip target for question: "${questionId}"`);
        }
        return;
      }
    }

    // Show the question
    this.currentQuestionSignal.set(question);
    this.questionViewStartTime = Date.now();

    // Update current module if question belongs to one
    if (question.moduleId) {
      const module = this.modulesMap[question.moduleId];
      this.currentModuleSignal.set(module ?? null);
    }

    // Update state
    const state = this.flowStateSignal();
    if (state) {
      const newState: FlowState = {
        ...state,
        currentNodeId: questionId,
        currentModuleId: question.moduleId,
        lastUpdatedAt: Date.now()
      };
      this.flowStateSignal.set(newState);
      this.saveFlowStateToStorage(newState);
    }

    // Update profile
    this.profileManager.updateLastQuestionId(questionId);

    // Track view
    if (trackNavigation) {
      this.analytics.track('question_viewed', {
        questionId,
        skipped: false
      });
    }
  }

  /**
   * Find next question in order (fallback for nextOnSkip).
   */
  private findNextQuestionId(currentId: string): string | null {
    const idx = this.questionOrder.indexOf(currentId);
    if (idx === -1 || idx >= this.questionOrder.length - 1) {
      return null;
    }
    return this.questionOrder[idx + 1];
  }

  /**
   * Enter a module.
   */
  private async enterModule(moduleId: string): Promise<void> {
    const module = this.modulesMap[moduleId];
    if (!module) {
      console.error(`[FlowEngine] Module not found: "${moduleId}"`);
      return;
    }

    this.currentModuleSignal.set(module);

    // Update state
    const state = this.flowStateSignal();
    if (state) {
      const newState: FlowState = {
        ...state,
        currentModuleId: moduleId,
        lastUpdatedAt: Date.now()
      };
      this.flowStateSignal.set(newState);
    }

    // Navigate to module entry question
    await this.navigateToInternal(module.entryQuestionId, true);
  }

  /**
   * Execute a leaf (terminal node).
   */
  private async executeLeaf(leafId: string): Promise<void> {
    const leaf = this.leavesMap[leafId];
    if (!leaf) {
      console.error(`[FlowEngine] Leaf not found: "${leafId}"`);
      return;
    }

    this.currentLeafSignal.set(leaf);
    this.currentQuestionSignal.set(null);
    this.isCompleteSignal.set(true);

    // Mark profile as completed
    this.profileManager.markCompleted();

    // Track completion
    const state = this.flowStateSignal();
    this.analytics.track('questionnaire_completed', {
      leafId,
      totalQuestions: Object.keys(state?.answersByQuestionId ?? {}).length,
      totalTimeMs: state ? Date.now() - state.startedAt : 0
    });
  }

  // ==========================================================================
  // Back Navigation
  // ==========================================================================

  /**
   * Go back to previous question.
   * CRITICAL: Invalidates answers that are no longer reachable.
   */
  goBack(): void {
    const state = this.flowStateSignal();
    if (!state || state.history.length === 0) return;

    const lastEntry = state.history[state.history.length - 1];

    // 1. Remove current answer using delete pattern (NOT .delete() which is Map)
    const newAnswers = deleteAnswer(state.answersByQuestionId, lastEntry.questionId);

    // 2. Pop from history
    const newHistory = state.history.slice(0, -1);

    // 3. Update state
    const newState: FlowState = {
      ...state,
      currentNodeId: lastEntry.questionId,
      answersByQuestionId: newAnswers,
      history: newHistory,
      lastUpdatedAt: Date.now()
    };

    this.flowStateSignal.set(newState);
    this.saveFlowStateToStorage(newState);

    // 4. Load previous question
    const question = this.questionsMap[lastEntry.questionId];
    if (question) {
      this.currentQuestionSignal.set(question);
      this.questionViewStartTime = Date.now();
    }

    // 5. Invalidate unreachable answers
    this.invalidateUnreachableAnswers();

    // 6. Track
    this.analytics.track('back_navigation_used', {
      fromQuestionId: state.currentNodeId,
      toQuestionId: lastEntry.questionId
    });
  }

  /**
   * Invalidate answers that are no longer reachable due to changed conditions.
   * Called after goBack() to ensure consistency.
   */
  private invalidateUnreachableAnswers(): void {
    const state = this.flowStateSignal();
    if (!state) return;

    const profile = this.profileManager.getProfile();
    let hasChanges = false;
    let newAnswers = { ...state.answersByQuestionId };

    // Check each answered question's showIf condition
    for (const questionId of Object.keys(newAnswers)) {
      const question = this.questionsMap[questionId];
      if (!question) continue;

      if (question.showIf) {
        const shouldShow = this.expressionParser.evaluate(question.showIf, profile);
        if (!shouldShow) {
          // This answer is no longer reachable, invalidate it
          newAnswers = deleteAnswer(newAnswers, questionId);
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      const newState: FlowState = {
        ...state,
        answersByQuestionId: newAnswers,
        lastUpdatedAt: Date.now()
      };
      this.flowStateSignal.set(newState);
      this.saveFlowStateToStorage(newState);
    }
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  /**
   * Get answer for a specific question.
   */
  getAnswer(questionId: string): SelectedOption | undefined {
    const state = this.flowStateSignal();
    return state?.answersByQuestionId[questionId];
  }

  /**
   * Check if question has been answered.
   */
  hasAnswer(questionId: string): boolean {
    const state = this.flowStateSignal();
    return state ? questionId in state.answersByQuestionId : false;
  }

  /**
   * Get all answered question IDs.
   */
  getAnsweredQuestionIds(): string[] {
    const state = this.flowStateSignal();
    return state ? Object.keys(state.answersByQuestionId) : [];
  }

  /**
   * Get module progress (questions answered / total in module).
   */
  getModuleProgress(moduleId: string): { answered: number; total: number; percent: number } {
    const module = this.modulesMap[moduleId];
    if (!module) return { answered: 0, total: 0, percent: 0 };

    const state = this.flowStateSignal();
    if (!state) return { answered: 0, total: module.questionIds.length, percent: 0 };

    const answered = module.questionIds.filter(
      qId => qId in state.answersByQuestionId
    ).length;
    const total = module.questionIds.length;
    const percent = total > 0 ? Math.round((answered / total) * 100) : 0;

    return { answered, total, percent };
  }

  // ==========================================================================
  // Storage
  // ==========================================================================

  /**
   * SSR-safe localStorage check.
   */
  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Load flow state from localStorage.
   */
  private loadFlowStateFromStorage(): FlowState | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const stored = localStorage.getItem(FLOW_STATE_STORAGE_KEY);
      if (!stored) return null;
      return deserializeFlowState(stored);
    } catch {
      return null;
    }
  }

  /**
   * Save flow state to localStorage.
   */
  private saveFlowStateToStorage(state: FlowState): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.setItem(FLOW_STATE_STORAGE_KEY, serializeFlowState(state));
    } catch (error) {
      console.warn('[FlowEngine] Failed to save flow state:', error);
    }
  }

  /**
   * Clear flow state from localStorage.
   */
  private clearFlowStateFromStorage(): void {
    if (!this.isStorageAvailable()) return;
    localStorage.removeItem(FLOW_STATE_STORAGE_KEY);
  }
}
