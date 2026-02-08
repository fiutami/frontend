import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RadioOption, RadioSize, RadioOrientation } from './radio-button-group.models';

let uniqueIdCounter = 0;

/**
 * RadioButtonGroupComponent - Reusable Radio Button Group
 *
 * A group of radio buttons with ControlValueAccessor for form integration.
 * Supports horizontal/vertical layout and multiple sizes.
 *
 * @example
 * ```html
 * <app-radio-button-group
 *   [options]="[
 *     { value: 'male', label: 'Maschio' },
 *     { value: 'female', label: 'Femmina' }
 *   ]"
 *   [formControl]="sexControl">
 * </app-radio-button-group>
 * ```
 */
@Component({
  selector: 'app-radio-button-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radio-button-group.component.html',
  styleUrls: ['./radio-button-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButtonGroupComponent),
      multi: true,
    },
  ],
})
export class RadioButtonGroupComponent implements ControlValueAccessor {
  /**
   * Array of radio options
   * @required
   */
  @Input({ required: true }) options: RadioOption[] = [];

  /**
   * Unique name for the radio group
   */
  @Input() name = `radio-group-${++uniqueIdCounter}`;

  /**
   * Layout orientation
   * @default 'vertical'
   */
  @Input() orientation: RadioOrientation = 'vertical';

  /**
   * Size of the radio buttons
   * @default 'md'
   */
  @Input() size: RadioSize = 'md';

  /**
   * Whether the entire group is disabled
   * @default false
   */
  @Input() disabled = false;

  /**
   * Whether to show option descriptions
   * @default true
   */
  @Input() showDescriptions = true;

  /**
   * Emits when selection changes
   */
  @Output() selectionChange = new EventEmitter<string>();

  // Internal state
  private selectedValue = signal<string | null>(null);

  // ControlValueAccessor callbacks
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Get the currently selected value
   */
  get value(): string | null {
    return this.selectedValue();
  }

  /**
   * Check if an option is selected
   */
  isSelected(optionValue: string): boolean {
    return this.selectedValue() === optionValue;
  }

  /**
   * Check if an option is disabled
   */
  isOptionDisabled(option: RadioOption): boolean {
    return this.disabled || option.disabled === true;
  }

  /**
   * Handle option selection
   */
  onOptionSelect(option: RadioOption): void {
    if (this.isOptionDisabled(option)) return;

    this.selectedValue.set(option.value);
    this.onChange(option.value);
    this.onTouched();
    this.selectionChange.emit(option.value);
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent, index: number): void {
    const enabledOptions = this.options.filter((o) => !this.isOptionDisabled(o));
    const currentEnabledIndex = enabledOptions.findIndex(
      (o) => o.value === this.options[index].value
    );

    let newIndex = -1;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        newIndex = (currentEnabledIndex + 1) % enabledOptions.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        newIndex =
          (currentEnabledIndex - 1 + enabledOptions.length) % enabledOptions.length;
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.onOptionSelect(this.options[index]);
        return;
    }

    if (newIndex >= 0) {
      const newOption = enabledOptions[newIndex];
      this.onOptionSelect(newOption);

      // Focus the new radio button
      const radioId = `${this.name}-${newOption.value}`;
      const radioElement = document.getElementById(radioId);
      radioElement?.focus();
    }
  }

  /**
   * Get CSS classes for the container
   */
  get containerClasses(): Record<string, boolean> {
    return {
      'radio-group': true,
      [`radio-group--${this.orientation}`]: true,
      [`radio-group--${this.size}`]: true,
      'radio-group--disabled': this.disabled,
    };
  }

  // ControlValueAccessor implementation

  writeValue(value: string | null): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
