import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SpeciesSelectorComponent - Switch button with arrows for category selection
 *
 * Features:
 * - Pill-shaped button with label
 * - Left/right arrow navigation
 * - Shadow effect
 * - Used for switching between "Specie" and "Razze" views
 *
 * @example
 * ```html
 * <app-species-selector
 *   [label]="'Specie'"
 *   (previous)="onPrevious()"
 *   (next)="onNext()">
 * </app-species-selector>
 * ```
 */
@Component({
  selector: 'app-species-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './species-selector.component.html',
  styleUrls: ['./species-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesSelectorComponent {
  /**
   * Current label to display
   * @default 'Specie'
   */
  @Input() label = 'Specie';

  /**
   * Show left arrow
   * @default true
   */
  @Input() showPrevious = true;

  /**
   * Show right arrow
   * @default true
   */
  @Input() showNext = true;

  /**
   * Emits when left arrow is clicked
   */
  @Output() previous = new EventEmitter<void>();

  /**
   * Emits when right arrow is clicked
   */
  @Output() next = new EventEmitter<void>();

  onPreviousClick(event: Event): void {
    event.stopPropagation();
    this.previous.emit();
  }

  onNextClick(event: Event): void {
    event.stopPropagation();
    this.next.emit();
  }
}
