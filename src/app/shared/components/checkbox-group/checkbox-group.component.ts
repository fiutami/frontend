import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  CheckboxOption,
  CheckboxSize,
  CheckboxOrientation,
} from './checkbox-group.models';

let uniqueIdCounter = 0;

/**
 * CheckboxGroupComponent - Reusable Checkbox Group
 *
 * A group of checkboxes with ControlValueAccessor for form integration.
 * Supports horizontal/vertical layout, multiple sizes, and min/max selection.
 *
 * @example
 * ```html
 * <app-checkbox-group
 *   [options]="[
 *     { value: 'dogs', label: 'Cani' },
 *     { value: 'cats', label: 'Gatti' },
 *     { value: 'birds', label: 'Uccelli' }
 *   ]"
 *   [formControl]="petsControl"
 *   [min]="1"
 *   [max]="3">
 * </app-checkbox-group>
 * ```
 */
@Component({
  selector: 'app-checkbox-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox-group.component.html',
  styleUrls: ['./checkbox-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxGroupComponent),
      multi: true,
    },
  ],
})
export class CheckboxGroupComponent implements ControlValueAccessor {
  /**
   * Array of checkbox options
   * @required
   */
  @Input({ required: true }) options: CheckboxOption[] = [];

  /**
   * Unique name for the checkbox group
   */
  @Input() name = `checkbox-group-${++uniqueIdCounter}`;

  /**
   * Layout orientation
   * @default 'vertical'
   */
  @Input() orientation: CheckboxOrientation = 'vertical';

  /**
   * Size of the checkboxes
   * @default 'md'
   */
  @Input() size: CheckboxSize = 'md';

  /**
   * Whether the entire group is disabled
   * @default false
   */
  @Input() disabled = false;

  /**
   * Minimum number of selections required
   */
  @Input() min?: number;

  /**
   * Maximum number of selections allowed
   */
  @Input() max?: number;

  /**
   * Whether to show option descriptions
   * @default true
   */
  @Input() showDescriptions = true;

  /**
   * Emits when selection changes
   */
  @Output() selectionChange = new EventEmitter<string[]>();

  // Internal state
  private selectedValues = signal<string[]>([]);

  // ControlValueAccessor callbacks
  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Get the currently selected values
   */
  get values(): string[] {
    return this.selectedValues();
  }

  /**
   * Check if an option is selected
   */
  isSelected(optionValue: string): boolean {
    return this.selectedValues().includes(optionValue);
  }

  /**
   * Check if an option is disabled
   */
  isOptionDisabled(option: CheckboxOption): boolean {
    if (this.disabled || option.disabled) return true;

    // Disable if max reached and option is not selected
    if (this.max && !this.isSelected(option.value)) {
      return this.selectedValues().length >= this.max;
    }

    // Disable if at min and option is selected (can't unselect)
    if (this.min && this.isSelected(option.value)) {
      return this.selectedValues().length <= this.min;
    }

    return false;
  }

  /**
   * Handle checkbox toggle
   */
  onOptionToggle(option: CheckboxOption): void {
    if (this.isOptionDisabled(option)) return;

    const currentValues = [...this.selectedValues()];
    const index = currentValues.indexOf(option.value);

    if (index > -1) {
      // Uncheck - but respect min
      if (!this.min || currentValues.length > this.min) {
        currentValues.splice(index, 1);
      }
    } else {
      // Check - but respect max
      if (!this.max || currentValues.length < this.max) {
        currentValues.push(option.value);
      }
    }

    this.selectedValues.set(currentValues);
    this.onChange(currentValues);
    this.onTouched();
    this.selectionChange.emit(currentValues);
  }

  /**
   * Get CSS classes for the container
   */
  get containerClasses(): Record<string, boolean> {
    return {
      'checkbox-group': true,
      [`checkbox-group--${this.orientation}`]: true,
      [`checkbox-group--${this.size}`]: true,
      'checkbox-group--disabled': this.disabled,
    };
  }

  // ControlValueAccessor implementation

  writeValue(value: string[] | null): void {
    this.selectedValues.set(value || []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
