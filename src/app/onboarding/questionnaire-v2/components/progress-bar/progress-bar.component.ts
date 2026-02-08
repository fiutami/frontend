/**
 * ProgressBarComponent - Visual progress indicator
 *
 * Shows questionnaire progress with optional module title.
 *
 * @version 1.1
 */

import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  /** Progress percentage (0-100) */
  progress = input.required<number>();

  /** Optional module title to display */
  moduleTitle = input<string | null>(null);

  /** Clamped progress value */
  protected clampedProgress = computed(() => {
    const p = this.progress();
    return Math.min(100, Math.max(0, p));
  });

  /** CSS transform for the progress fill */
  protected progressTransform = computed(() => {
    return `scaleX(${this.clampedProgress() / 100})`;
  });

  /** Accessible progress description */
  protected ariaLabel = computed(() => {
    const module = this.moduleTitle();
    const percent = this.clampedProgress();
    if (module) {
      return `${module}: ${percent}% complete`;
    }
    return `${percent}% complete`;
  });
}
