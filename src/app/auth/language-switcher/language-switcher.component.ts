import { Component, ChangeDetectionStrategy, Output, EventEmitter, signal, inject } from '@angular/core';
import { LanguageService, Language, SupportedLanguage } from '../../core/i18n/language.service';

/**
 * LanguageSwitcherComponent - Language selection dropdown
 *
 * Features:
 * - Shows current language with flag and name
 * - Dropdown menu with all available languages
 * - Integrates with LanguageService for global language switching
 */
@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  private readonly languageService = inject(LanguageService);

  @Output() languageChanged = new EventEmitter<string>();

  readonly menuOpen = signal(false);

  get languages(): Language[] {
    return this.languageService.availableLanguages;
  }

  get currentLanguage(): Language {
    return this.languageService.currentLanguageConfig || this.languages[0];
  }

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  selectLanguage(language: Language): void {
    if (language.code !== this.currentLanguage.code) {
      this.languageService.setLanguage(language.code);
      this.languageChanged.emit(language.code);
    }
    this.closeMenu();
  }
}
