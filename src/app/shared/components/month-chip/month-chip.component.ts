import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Month data structure
 */
export interface MonthData {
  index: number; // 0-11
  name: string;
  shortName: string;
}

/**
 * Supported locales for month names
 */
export type MonthLocale = 'it' | 'en';

/**
 * Month names by locale
 */
const MONTHS: Record<MonthLocale, MonthData[]> = {
  it: [
    { index: 0, name: 'Gennaio', shortName: 'GEN' },
    { index: 1, name: 'Febbraio', shortName: 'FEB' },
    { index: 2, name: 'Marzo', shortName: 'MAR' },
    { index: 3, name: 'Aprile', shortName: 'APR' },
    { index: 4, name: 'Maggio', shortName: 'MAG' },
    { index: 5, name: 'Giugno', shortName: 'GIU' },
    { index: 6, name: 'Luglio', shortName: 'LUG' },
    { index: 7, name: 'Agosto', shortName: 'AGO' },
    { index: 8, name: 'Settembre', shortName: 'SET' },
    { index: 9, name: 'Ottobre', shortName: 'OTT' },
    { index: 10, name: 'Novembre', shortName: 'NOV' },
    { index: 11, name: 'Dicembre', shortName: 'DIC' },
  ],
  en: [
    { index: 0, name: 'January', shortName: 'JAN' },
    { index: 1, name: 'February', shortName: 'FEB' },
    { index: 2, name: 'March', shortName: 'MAR' },
    { index: 3, name: 'April', shortName: 'APR' },
    { index: 4, name: 'May', shortName: 'MAY' },
    { index: 5, name: 'June', shortName: 'JUN' },
    { index: 6, name: 'July', shortName: 'JUL' },
    { index: 7, name: 'August', shortName: 'AUG' },
    { index: 8, name: 'September', shortName: 'SEP' },
    { index: 9, name: 'October', shortName: 'OCT' },
    { index: 10, name: 'November', shortName: 'NOV' },
    { index: 11, name: 'December', shortName: 'DEC' },
  ],
};

/**
 * MonthChipComponent - Month Selector Chips
 *
 * Displays a grid of month chips for selection.
 * Supports single or multi-select mode with ControlValueAccessor.
 *
 * @example
 * ```html
 * <!-- Single select -->
 * <app-month-chip
 *   [formControl]="monthControl"
 *   locale="it">
 * </app-month-chip>
 *
 * <!-- Multi select -->
 * <app-month-chip
 *   [formControl]="monthsControl"
 *   [multiSelect]="true"
 *   locale="it">
 * </app-month-chip>
 * ```
 */
@Component({
  selector: 'app-month-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './month-chip.component.html',
  styleUrls: ['./month-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonthChipComponent),
      multi: true,
    },
  ],
})
export class MonthChipComponent implements ControlValueAccessor {
  /**
   * Locale for month names
   * @default 'it'
   */
  @Input() locale: MonthLocale = 'it';

  /**
   * Allow multiple month selection
   * @default false
   */
  @Input() multiSelect = false;

  /**
   * Whether the component is disabled
   * @default false
   */
  @Input() disabled = false;

  /**
   * Show short month names (e.g., "GEN" vs "Gennaio")
   * @default true
   */
  @Input() shortNames = true;

  /**
   * Number of columns in the grid
   * @default 6
   */
  @Input() columns = 6;

  /**
   * Emits when month selection changes
   */
  @Output() monthChange = new EventEmitter<number | number[]>();

  // Internal state
  private selectedValue = signal<number | number[] | null>(null);

  // ControlValueAccessor callbacks
  private onChange: (value: number | number[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Get months for the current locale
   */
  readonly months = computed(() => MONTHS[this.locale] || MONTHS['it']);

  /**
   * Check if a month is selected
   */
  isSelected(monthIndex: number): boolean {
    const value = this.selectedValue();
    if (value === null) return false;

    if (this.multiSelect && Array.isArray(value)) {
      return value.includes(monthIndex);
    }

    return value === monthIndex;
  }

  /**
   * Handle month chip click
   */
  onMonthClick(monthIndex: number): void {
    if (this.disabled) return;

    let newValue: number | number[];

    if (this.multiSelect) {
      const currentValue = (this.selectedValue() as number[]) || [];
      if (currentValue.includes(monthIndex)) {
        newValue = currentValue.filter((m) => m !== monthIndex);
      } else {
        newValue = [...currentValue, monthIndex];
      }
    } else {
      newValue = monthIndex;
    }

    this.selectedValue.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    this.monthChange.emit(newValue);
  }

  /**
   * Get display name for a month
   */
  getMonthName(month: MonthData): string {
    return this.shortNames ? month.shortName : month.name;
  }

  // ControlValueAccessor implementation

  writeValue(value: number | number[] | null): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: (value: number | number[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
