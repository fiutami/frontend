import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  PLATFORM_ID,
  inject,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HERO_DOG_ASSET, HERO_WORDMARK_ASSET } from './hero-assets';

interface LanguageOption {
  code: string;
  label: string;
}

interface SocialProvider {
  id: 'apple' | 'google';
  label: string;
  icon: string;
}

type LayoutMode = 'portrait' | 'landscape';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements OnInit {
  private readonly heroDogScaleState = signal(1);
  private readonly layoutModeState = signal<LayoutMode>('portrait');
  private readonly headroomRatio = HERO_DOG_ASSET.headroomRatio ?? 0.12;
  private readonly platformId = inject(PLATFORM_ID);

  readonly heroVariant = 'mobile-v3' as const;
  readonly wordmarkAsset = HERO_WORDMARK_ASSET;
  readonly heroIllustration = HERO_DOG_ASSET;

  readonly languages: LanguageOption[] = [
    { code: 'it', label: 'Italiano' },
    { code: 'en', label: 'English' },
  ];

  readonly socialProviders: SocialProvider[] = [
    { id: 'apple', label: 'Continua con Apple', icon: 'assets/Icon-Brands/Apple.svg' },
    { id: 'google', label: 'Continua con Google', icon: 'assets/Icon-Brands/Google.svg' },
  ];

  readonly legalLinks = [
    { id: 'terms', label: 'Termini', url: 'https://fiutami.example/terms' },
    { id: 'privacy', label: 'Privacy', url: 'https://fiutami.example/privacy' },
  ];

  private readonly languageState = signal<LanguageOption>(this.languages[0]);
  private readonly languageMenuState = signal(false);

  private readonly claims: Record<string, string> = {
    it: 'Fiuta la tua soluzione ideale',
    en: 'Sniff your perfect match',
  };

  @Output() readonly login = new EventEmitter<void>();
  @Output() readonly register = new EventEmitter<void>();
  @Output() readonly languageChanged = new EventEmitter<string>();
  @Output() readonly socialSelected = new EventEmitter<'apple' | 'google'>();

  get currentLanguage(): LanguageOption {
    return this.languageState();
  }

  get claim(): string {
    const code = this.currentLanguage.code;
    return this.claims[code] ?? this.claims["it"];
  }

  get isLanguageMenuOpen(): boolean {
    return this.languageMenuState();
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

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isBrowser()) {
      this.updateHeroDogScale();
      this.updateLayoutMode();
    }
  }

  toggleLanguageMenu(): void {
    this.languageMenuState.update((open) => !open);
  }

  selectLanguage(language: LanguageOption): void {
    if (language.code === this.currentLanguage.code) {
      this.languageMenuState.set(false);
      return;
    }

    this.languageState.set(language);
    this.languageChanged.emit(language.code);
    this.languageMenuState.set(false);
  }

  closeLanguageMenu(): void {
    this.languageMenuState.set(false);
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
