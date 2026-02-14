import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SupportedLanguage = 'it' | 'en' | 'fr' | 'de' | 'es' | 'pt-BR';

export interface Language {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

/**
 * Language Service
 *
 * Manages application language settings with localStorage persistence.
 * Provides language switching functionality and current language state.
 */
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private static readonly STORAGE_KEY = 'fiutami_lang';
  private static readonly DEFAULT_LANGUAGE: SupportedLanguage = 'it';

  /**
   * Available languages configuration
   */
  public readonly availableLanguages: Language[] = [
    {
      code: 'it',
      name: 'Italian',
      nativeName: 'Italiano',
      flag: '🇮🇹'
    },
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧'
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷'
    },
    {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      flag: '🇩🇪'
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸'
    },
    {
      code: 'pt-BR',
      name: 'Portuguese (Brazil)',
      nativeName: 'Português (Brasil)',
      flag: '🇧🇷'
    }
  ];

  /**
   * Observable for current language changes
   */
  private currentLanguageSubject: BehaviorSubject<SupportedLanguage>;
  public currentLanguage$: Observable<SupportedLanguage>;

  constructor(private translate: TranslateService) {
    // Initialize with saved language or default
    const savedLang = this.getSavedLanguage();
    this.currentLanguageSubject = new BehaviorSubject<SupportedLanguage>(savedLang);
    this.currentLanguage$ = this.currentLanguageSubject.asObservable();

    // Configure translate service
    this.translate.addLangs(this.availableLanguages.map(lang => lang.code));
    this.translate.setDefaultLang(LanguageService.DEFAULT_LANGUAGE);
    this.translate.use(savedLang);
  }

  /**
   * Get current active language code
   */
  get currentLanguage(): SupportedLanguage {
    return this.currentLanguageSubject.value;
  }

  /**
   * Get current language configuration
   */
  get currentLanguageConfig(): Language | undefined {
    return this.availableLanguages.find(lang => lang.code === this.currentLanguage);
  }

  /**
   * Switch to a different language
   *
   * @param langCode - Language code to switch to
   */
  setLanguage(langCode: SupportedLanguage): void {
    if (!this.isLanguageSupported(langCode)) {
      console.warn(`Language ${langCode} is not supported. Falling back to ${LanguageService.DEFAULT_LANGUAGE}`);
      langCode = LanguageService.DEFAULT_LANGUAGE;
    }

    this.translate.use(langCode);
    this.saveLanguage(langCode);
    this.currentLanguageSubject.next(langCode);
  }

  /**
   * Get translation for a key
   *
   * @param key - Translation key
   * @param params - Optional interpolation parameters
   * @returns Observable with translated string
   */
  getTranslation(key: string, params?: object): Observable<string> {
    return this.translate.get(key, params);
  }

  /**
   * Get instant translation (synchronous)
   *
   * @param key - Translation key
   * @param params - Optional interpolation parameters
   * @returns Translated string
   */
  getInstantTranslation(key: string, params?: object): string {
    return this.translate.instant(key, params);
  }

  /**
   * Check if a language code is supported
   */
  private isLanguageSupported(langCode: string): langCode is SupportedLanguage {
    return this.availableLanguages.some(lang => lang.code === langCode);
  }

  /**
   * Get saved language from localStorage
   */
  private getSavedLanguage(): SupportedLanguage {
    try {
      const saved = localStorage.getItem(LanguageService.STORAGE_KEY);
      if (saved && this.isLanguageSupported(saved)) {
        return saved as SupportedLanguage;
      }
      // Backward compat: check old key used by drawer
      const oldSaved = localStorage.getItem('lang');
      if (oldSaved && this.isLanguageSupported(oldSaved)) {
        this.saveLanguage(oldSaved as SupportedLanguage);
        return oldSaved as SupportedLanguage;
      }
    } catch (error) {
      console.error('Error reading saved language:', error);
    }
    return LanguageService.DEFAULT_LANGUAGE;
  }

  /**
   * Save language to localStorage
   */
  private saveLanguage(langCode: SupportedLanguage): void {
    try {
      localStorage.setItem(LanguageService.STORAGE_KEY, langCode);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }
}
