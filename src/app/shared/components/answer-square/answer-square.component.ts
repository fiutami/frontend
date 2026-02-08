import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnswerOption } from './answer-square.models';

/**
 * AnswerSquareComponent - Selectable Answer Squares
 *
 * A reusable component for displaying selectable answer options as squares.
 * Used in the species questionnaire flow for single-selection questions.
 *
 * @example
 * ```html
 * <app-answer-square
 *   [options]="options"
 *   [selectedValue]="selectedAnswer()"
 *   (selectionChange)="onAnswerSelect($event)">
 * </app-answer-square>
 * ```
 */
@Component({
  selector: 'app-answer-square',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './answer-square.component.html',
  styleUrls: ['./answer-square.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerSquareComponent {
  /**
   * Array of answer options to display
   */
  @Input({ required: true }) options: AnswerOption[] = [];

  /**
   * Currently selected value (null if none selected)
   */
  @Input() selectedValue: string | null = null;

  /**
   * Emits the selected value when an option is clicked
   */
  @Output() selectionChange = new EventEmitter<string>();

  /**
   * Handle option selection
   */
  onSelect(option: AnswerOption): void {
    this.selectionChange.emit(option.value);
  }

  /**
   * Check if an option is currently selected
   */
  isSelected(option: AnswerOption): boolean {
    return this.selectedValue === option.value;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByValue(_index: number, option: AnswerOption): string {
    return option.value;
  }
}
