import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Step indicator variant
 */
export type StepVariant = 'dots' | 'numbers' | 'progress';

/**
 * Step indicator size
 */
export type StepSize = 'sm' | 'md' | 'lg';

/**
 * Step status for detailed step data
 */
export type StepStatus = 'completed' | 'current' | 'upcoming';

/**
 * Step data structure for detailed steps
 */
export interface Step {
  id: string;
  label?: string;
  status?: StepStatus;
}

/**
 * StepIndicatorComponent - Progress Step Indicator
 *
 * Displays progress through a multi-step process.
 * Supports dots, numbers, or progress bar variants.
 *
 * @example
 * ```html
 * <!-- Simple dots -->
 * <app-step-indicator
 *   [totalSteps]="5"
 *   [currentStep]="2">
 * </app-step-indicator>
 *
 * <!-- Numbered with labels -->
 * <app-step-indicator
 *   [totalSteps]="4"
 *   [currentStep]="2"
 *   variant="numbers"
 *   [showLabels]="true"
 *   [steps]="[
 *     { id: '1', label: 'Specie' },
 *     { id: '2', label: 'Dettagli' },
 *     { id: '3', label: 'Documenti' },
 *     { id: '4', label: 'Benessere' }
 *   ]">
 * </app-step-indicator>
 * ```
 */
@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-indicator.component.html',
  styleUrls: ['./step-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepIndicatorComponent {
  /**
   * Total number of steps
   * @required
   */
  @Input({ required: true }) totalSteps!: number;

  /**
   * Current active step (1-indexed)
   * @default 1
   */
  @Input() currentStep = 1;

  /**
   * Optional detailed step information
   */
  @Input() steps?: Step[];

  /**
   * Visual variant
   * @default 'dots'
   */
  @Input() variant: StepVariant = 'dots';

  /**
   * Size of the indicator
   * @default 'md'
   */
  @Input() size: StepSize = 'md';

  /**
   * Whether to show step labels
   * @default false
   */
  @Input() showLabels = false;

  /**
   * Whether steps are clickable
   * @default false
   */
  @Input() clickable = false;

  /**
   * Emits when a step is clicked (only if clickable)
   */
  @Output() stepClick = new EventEmitter<number>();

  /**
   * Generate array of step indices
   */
  readonly stepIndices = computed(() =>
    Array.from({ length: this.totalSteps }, (_, i) => i + 1)
  );

  /**
   * Calculate progress percentage for progress variant
   */
  readonly progressPercentage = computed(() => {
    if (this.totalSteps <= 1) return 100;
    return ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
  });

  /**
   * Get step status
   */
  getStepStatus(stepNumber: number): StepStatus {
    // Check if detailed steps have status
    if (this.steps && this.steps[stepNumber - 1]?.status) {
      return this.steps[stepNumber - 1].status!;
    }

    // Calculate based on currentStep
    if (stepNumber < this.currentStep) return 'completed';
    if (stepNumber === this.currentStep) return 'current';
    return 'upcoming';
  }

  /**
   * Get step label
   */
  getStepLabel(stepNumber: number): string | undefined {
    return this.steps?.[stepNumber - 1]?.label;
  }

  /**
   * Handle step click
   */
  onStepClick(stepNumber: number): void {
    if (!this.clickable) return;
    this.stepClick.emit(stepNumber);
  }

  /**
   * Get CSS classes for the container
   */
  get containerClasses(): Record<string, boolean> {
    return {
      'step-indicator': true,
      [`step-indicator--${this.variant}`]: true,
      [`step-indicator--${this.size}`]: true,
      'step-indicator--clickable': this.clickable,
      'step-indicator--with-labels': this.showLabels,
    };
  }
}
