import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
  Output,
  PLATFORM_ID,
  inject,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { HERO_DOG_ASSET, HERO_WORDMARK_ASSET } from './hero-assets';
import { environment } from '../../environments/environment';
import { LanguageService, Language, SupportedLanguage } from '../core/i18n/language.service';

interface SocialProvider {
  id: 'apple' | 'google';
  label: string;
  icon: string;
}

type LayoutMode = 'portrait' | 'landscape';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly heroDogScaleState = signal(1);
  private readonly layoutModeState = signal<LayoutMode>('portrait');
  private readonly headroomRatio = HERO_DOG_ASSET.headroomRatio ?? 0.12;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly languageService = inject(LanguageService);
  private destroy$ = new Subject<void>();

  readonly heroVariant = 'mobile-v3' as const;
  readonly wordmarkAsset = HERO_WORDMARK_ASSET;
  readonly heroIllustration = HERO_DOG_ASSET;

  get languages(): Language[] {
    return this.languageService.availableLanguages;
  }

  readonly socialProviders: SocialProvider[] = [
    { id: 'apple', label: 'Continua con Apple', icon: 'assets/Icon-Brands/Apple.svg' },
    { id: 'google', label: 'Continua con Google', icon: 'assets/Icon-Brands/Google.svg' },
  ];

  readonly legalLinks = [
    { id: 'terms', labelKey: 'auth.termsAndConditions', url: environment.legalUrls.terms },
    { id: 'privacy', labelKey: 'auth.privacyPolicy', url: environment.legalUrls.privacy },
  ];

  readonly languageMenuOpen = signal(false);

  @Output() readonly login = new EventEmitter<void>();
  @Output() readonly register = new EventEmitter<void>();
  @Output() readonly languageChanged = new EventEmitter<string>();
  @Output() readonly socialSelected = new EventEmitter<'apple' | 'google'>();

  get currentLanguage(): Language {
    return this.languageService.currentLanguageConfig || this.languages[0];
  }

  get heroDogScale(): number {
    return this.heroDogScaleState();
  }

  get layoutMode(): LayoutMode {
    return this.layoutModeState();
  }

  ngOnInit(): void {
    if (this.isBrowser()) {
      this.updateHeroDogScale();
      this.updateLayoutMode();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isBrowser()) {
      this.updateHeroDogScale();
      this.updateLayoutMode();
    }
  }

  toggleLanguageMenu(): void {
    this.languageMenuOpen.update((open) => !open);
  }

  selectLanguage(language: Language): void {
    if (language.code === this.currentLanguage.code) {
      this.languageMenuOpen.set(false);
      return;
    }

    this.languageService.setLanguage(language.code);
    this.languageChanged.emit(language.code);
    this.languageMenuOpen.set(false);
  }

  closeLanguageMenu(): void {
    this.languageMenuOpen.set(false);
  }

  onPrimaryCta(): void {
    this.login.emit();
  }

  onSecondaryCta(): void {
    this.register.emit();
  }

  onSocialTapped(provider: SocialProvider): void {
    this.socialSelected.emit(provider.id);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private updateHeroDogScale(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const effectiveHeight = height * (1 - this.headroomRatio);
    const widthScale = width / 1920;
    const heightScale = effectiveHeight / 1080;
    const rawScale = Math.min(widthScale, heightScale);
    const clampedScale = Math.min(1, Math.max(0.5, rawScale));

    this.heroDogScaleState.set(clampedScale);
  }

  private updateLayoutMode(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;
    this.layoutModeState.set(isLandscape ? 'landscape' : 'portrait');
  }
}
