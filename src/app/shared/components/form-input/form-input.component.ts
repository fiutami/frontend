import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number';

@Component({
  selector: 'app-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true,
    },
  ],
})
export class FormInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type: InputType = 'text';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() hasError = false;
  @Input() autocomplete = 'off';
  @Input() inputId = `input-${Math.random().toString(36).substring(2, 9)}`;

  @Output() inputBlur = new EventEmitter<void>();
  @Output() inputFocus = new EventEmitter<void>();

  value = '';
  disabled = false;
  focused = false;
  touched = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  // Event handlers
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onInputBlur(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
    this.focused = false;
    this.inputBlur.emit();
  }

  onInputFocus(): void {
    this.focused = true;
    this.inputFocus.emit();
  }

  get inputClasses(): string[] {
    const classes = ['form-input'];

    if (this.hasError) {
      classes.push('form-input--error');
    }

    if (this.focused) {
      classes.push('form-input--focused');
    }

    return classes;
  }

  get showHint(): boolean {
    return !!this.hint && !this.hasError && this.focused;
  }

  get showError(): boolean {
    return this.hasError && !!this.errorMessage;
  }
}
