import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

/**
 * LanguageSwitcherComponent - Language selection button
 *
 * Simple button to trigger language selection.
 * Note: This is a UI-only component. Full i18n implementation
 * should be handled at the app level with @angular/localize or ngx-translate.
 */
@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  @Output() languageClick = new EventEmitter<void>();

  onLanguageClick(): void {
    this.languageClick.emit();
  }
}
