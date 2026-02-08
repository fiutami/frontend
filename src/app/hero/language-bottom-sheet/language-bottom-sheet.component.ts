import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { RadioButtonGroupComponent } from '../../shared/components/radio-button-group';
import { RadioOption } from '../../shared/components/radio-button-group/radio-button-group.models';

/**
 * Language option interface
 */
export interface LanguageOption {
  code: string;
  label: string;
}

/**
 * Available languages
 */
export const LANGUAGES: LanguageOption[] = [
  { code: 'it', label: 'Italiano' },
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'ar', label: 'Arabo' },
  { code: 'fr', label: 'Francese' },
  { code: 'es', label: 'Spagnolo' },
  { code: 'zh', label: 'Cinese' },
  { code: 'ja', label: 'Giapponese' },
  { code: 'hi', label: 'Indiano' },
];

/**
 * LanguageBottomSheetComponent - Bottom sheet for language selection
 *
 * A slide-up panel that allows users to select their preferred language.
 * Follows mobile-native bottom sheet patterns with backdrop and swipe gestures.
 *
 * @example
 * ```html
 * <app-language-bottom-sheet
 *   [isOpen]="showLanguageSheet"
 *   [selectedLanguage]="'it'"
 *   (languageSelected)="onLanguageSelected($event)"
 *   (closed)="onSheetClosed()">
 * </app-language-bottom-sheet>
 * ```
 */
@Component({
  selector: 'app-language-bottom-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, RadioButtonGroupComponent],
  templateUrl: './language-bottom-sheet.component.html',
  styleUrls: ['./language-bottom-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageBottomSheetComponent {
  private readonly elementRef = inject(ElementRef);

  /**
   * Whether the bottom sheet is open
   */
  @Input() isOpen = false;

  /**
   * Currently selected language code
   */
  @Input() selectedLanguage = 'it';

  /**
   * Emits when a language is selected and confirmed
   */
  @Output() languageSelected = new EventEmitter<string>();

  /**
   * Emits when the sheet is closed (backdrop click, swipe, or cancel)
   */
  @Output() closed = new EventEmitter<void>();

  /**
   * Internal selected language (before confirmation) - used with ngModel
   */
  protected selectedLanguageValue = 'it';

  /**
   * Available languages as RadioOptions
   */
  protected get languageOptions(): RadioOption[] {
    return LANGUAGES.map((lang) => ({
      value: lang.code,
      label: lang.label,
    }));
  }

  /**
   * Initialize selection when input changes
   */
  ngOnChanges(): void {
    this.selectedLanguageValue = this.selectedLanguage;
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('language-bottom-sheet__backdrop')) {
      this.close();
    }
  }

  /**
   * Handle language selection change
   */
  onSelectionChange(value: string): void {
    this.selectedLanguageValue = value;
  }

  /**
   * Confirm and apply language selection
   */
  onConfirm(): void {
    this.languageSelected.emit(this.selectedLanguageValue);
    this.close();
  }

  /**
   * Close the bottom sheet
   */
  close(): void {
    this.closed.emit();
  }

  /**
   * Handle escape key
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  /**
   * Prevent body scroll when open
   */
  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (this.isOpen) {
      const sheet = this.elementRef.nativeElement.querySelector('.language-bottom-sheet__content');
      if (sheet && !sheet.contains(event.target as Node)) {
        event.preventDefault();
      }
    }
  }
}
