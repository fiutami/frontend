import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioButtonGroupComponent } from '../radio-button-group/radio-button-group.component';
import { CheckboxGroupComponent } from '../checkbox-group/checkbox-group.component';
import { RadioOption } from '../radio-button-group/radio-button-group.models';
import { CheckboxOption } from '../checkbox-group/checkbox-group.models';

/**
 * Question type options
 */
export type QuestionType = 'radio' | 'checkbox' | 'text' | 'custom';

/**
 * QuestionCardComponent - Question Card with Form Controls
 *
 * A card component for displaying questions with various answer types.
 * Composes CardComponent with RadioButtonGroup or CheckboxGroup.
 *
 * @example
 * ```html
 * <app-question-card
 *   question="Quanto tempo puoi dedicargli ogni giorno?"
 *   [options]="[
 *     { value: 'poco', label: 'Poco' },
 *     { value: 'medio', label: 'Medio' },
 *     { value: 'molto', label: 'Molto' }
 *   ]"
 *   (answerChange)="onAnswer($event)">
 * </app-question-card>
 * ```
 */
@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [
    CommonModule,
    RadioButtonGroupComponent,
    CheckboxGroupComponent,
  ],
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionCardComponent {
  /**
   * The question text
   * @required
   */
  @Input({ required: true }) question!: string;

  /**
   * Type of answer input
   * @default 'radio'
   */
  @Input() questionType: QuestionType = 'radio';

  /**
   * Options for radio or checkbox types
   */
  @Input() options: RadioOption[] | CheckboxOption[] = [];

  /**
   * Optional hint text shown below the question
   */
  @Input() hint?: string;

  /**
   * Whether an answer is required
   * @default false
   */
  @Input() required = false;

  /**
   * Error message to display
   */
  @Input() errorMessage?: string;

  /**
   * Current answer value (for controlled mode)
   */
  @Input() value?: string | string[];

  /**
   * Emits when the answer changes
   */
  @Output() answerChange = new EventEmitter<string | string[]>();

  /**
   * Handle radio selection change
   */
  onRadioChange(value: string): void {
    this.answerChange.emit(value);
  }

  /**
   * Handle checkbox selection change
   */
  onCheckboxChange(values: string[]): void {
    this.answerChange.emit(values);
  }

  /**
   * Handle text input change
   */
  onTextChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.answerChange.emit(value);
  }

  /**
   * Get radio options (type guard)
   */
  get radioOptions(): RadioOption[] {
    return this.options as RadioOption[];
  }

  /**
   * Get checkbox options (type guard)
   */
  get checkboxOptions(): CheckboxOption[] {
    return this.options as CheckboxOption[];
  }

  /**
   * Get current value as string (for radio/text)
   */
  get stringValue(): string | undefined {
    return typeof this.value === 'string' ? this.value : undefined;
  }

  /**
   * Get current value as array (for checkbox)
   */
  get arrayValue(): string[] | undefined {
    return Array.isArray(this.value) ? this.value : undefined;
  }
}
