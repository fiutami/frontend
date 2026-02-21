import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subject, takeUntil, fromEvent, debounceTime, startWith } from 'rxjs';
import { DrawerService } from './drawer.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { PetService } from '../../../core/services/pet.service';
import { LanguageService } from '../../../core/i18n/language.service';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'foldable-folded' | 'foldable-unfolded';

export interface DrawerMenuItem {
  labelKey: string;
  route?: string;
  icon?: string;
  action?: () => void;
  isLogout?: boolean;
}

export interface DrawerMenuSection {
  items: DrawerMenuItem[];
}

export interface Language {
  code: string;
  label: string;
  flag: string;
}

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      state('closed', style({ transform: 'translateX(100%)' })),
      state('open', style({ transform: 'translateX(0)' })),
      transition('closed <=> open', animate('200ms ease-out')),
    ]),
    trigger('fadeInOut', [
      state('closed', style({ opacity: 0, visibility: 'hidden', pointerEvents: 'none' })),
      state('open', style({ opacity: 1, visibility: 'visible', pointerEvents: 'auto' })),
      transition('closed <=> open', animate('200ms ease-out')),
    ]),
  ],
})
export class DrawerComponent implements OnInit, OnDestroy {
  private drawerService = inject(DrawerService);
  private authService = inject(AuthService);
  private petService = inject(PetService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  isOpen = false;
  searchQuery = '';
  showLanguageDropdown = false;
  currentLang = 'it';

  // Max pets paywall popup
  showMaxPetsPopup = signal(false);

  // User from auth service
  user$ = this.authService.currentUser$;

  // User avatar URL (from profile)
  userAvatarUrl: string | null = null;

  // Pet avatar computed (selectedPet o fallback primo pet)
  activePetPhotoUrl = computed(() => {
    const selected = this.petService.selectedPet();
    if (selected?.profilePhotoUrl) {
      return selected.profilePhotoUrl;
    }
    // Fallback: primo pet della lista
    const petsList = this.petService.pets();
    return petsList?.pets?.[0]?.profilePhotoUrl ?? null;
  });

  activePetName = computed(() => {
    const selected = this.petService.selectedPet();
    if (selected?.name) {
      return selected.name;
    }
    const petsList = this.petService.pets();
    return petsList?.pets?.[0]?.name ?? 'Pet';
  });

  // Available languages
  languages: Language[] = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  // App version
  appVersion = '1.0.0';

  // Viewport size detection for responsive layout indicators
  private windowWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 375);
  private windowHeight = signal(typeof window !== 'undefined' ? window.innerHeight : 667);

  viewportSize = computed<ViewportSize>(() => {
    const width = this.windowWidth();
    const height = this.windowHeight();
    const aspectRatio = width / height;

    // Foldable detection: specific aspect ratios and dimensions
    if (width >= 700 && width <= 800 && height >= 500 && height <= 730) {
      // Honor Magic V3/V5 or similar foldable in folded state
      return aspectRatio > 1 ? 'foldable-folded' : 'foldable-unfolded';
    }

    // Galaxy Fold detection
    if (width >= 717 && width <= 720 && height >= 500 && height <= 520) {
      return 'foldable-folded';
    }
    if (width >= 1400 && width <= 1500 && height >= 700 && height <= 800) {
      return 'foldable-unfolded';
    }

    // Standard breakpoints
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    }
    return 'desktop';
  });

  // Menu sections matching Figma mob_drawer_menu design
  // Route allineate a HeroRouting (fonte di verità)
  menuSections: DrawerMenuSection[] = [
    {
      // Sezione: Account / Personale
      items: [
        { labelKey: 'drawer.account', route: '/home/account', icon: 'person' },
        { labelKey: 'drawer.activity', route: '/home/activity', icon: 'history' },
        { labelKey: 'drawer.notifications', route: '/home/notifications', icon: 'notifications' },
        { labelKey: 'drawer.saved', route: '/home/favorites', icon: 'bookmark' }, // FIXED: era /home/saved
      ]
    },
    {
      // Sezione: Pet / Social / Community
      items: [
        { labelKey: 'drawer.adopt', route: '/home/adopt', icon: 'pets' },
        { labelKey: 'drawer.addPet', icon: 'add_circle', action: () => this.onAddPetClick() }, // ACTION con logica limite 2
        { labelKey: 'drawer.petFriends', route: '/home/friends', icon: 'group' },
        { labelKey: 'drawer.inviteFriends', route: '/home/invite', icon: 'share' },
        { labelKey: 'drawer.lostPets', route: '/home/lost-pets', icon: 'search' }, // FIXED: era /lost-pets
      ]
    },
    {
      // Sezione: Sistema / Legale
      items: [
        { labelKey: 'drawer.blockedUsers', route: '/home/blocked', icon: 'block' },
        { labelKey: 'drawer.terms', route: '/home/terms', icon: 'description' },
        { labelKey: 'drawer.subscriptions', route: '/home/subscriptions', icon: 'card_membership' },
        { labelKey: 'drawer.contact', route: '/home/contact', icon: 'mail' },
        { labelKey: 'drawer.privacy', route: '/home/privacy', icon: 'security' },
      ]
    },
    {
      // Logout
      items: [
        { labelKey: 'drawer.logout', icon: 'logout', isLogout: true },
      ]
    }
  ];

  get currentLanguage(): Language {
    return this.languages.find(l => l.code === this.currentLang) || this.languages[0];
  }

  ngOnInit(): void {
    // Sync with LanguageService
    this.currentLang = this.languageService.currentLanguage;

    this.drawerService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
        // Close language dropdown when drawer closes
        if (!isOpen) {
          this.showLanguageDropdown = false;
        }
        // Trigger change detection for OnPush strategy
        this.cdr.markForCheck();
      });

    // Listen for window resize events for viewport detection
    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(100),
          startWith(null),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.windowWidth.set(window.innerWidth);
          this.windowHeight.set(window.innerHeight);
        });
    }

    // Carica pets se non ancora caricati (per avatar pet)
    if (!this.petService.pets()) {
      this.petService.loadPets().pipe(takeUntil(this.destroy$)).subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  close(): void {
    this.drawerService.close();
  }

  closeAndGoBack(): void {
    this.close();
  }

  onBackdropClick(): void {
    this.close();
  }

  onMenuItemClick(item: DrawerMenuItem): void {
    // 1. Prima: action (se definita)
    if (item.action) {
      item.action();
      return;
    }

    // 2. Poi: route
    if (item.route) {
      this.router.navigate([item.route]);
      this.close();
      return;
    }

    // 3. Infine: logout
    if (item.isLogout) {
      this.logout();
    }
  }

  /**
   * Logica "Aggiungi Pets" con limite 2 pet gratis
   * - Se < 2 pet → vai a form registrazione pet
   * - Se >= 2 pet → mostra popup avviso, poi abbonamenti
   */
  onAddPetClick(): void {
    const count = this.petService.petCount();

    if (count < 2) {
      this.router.navigate(['/home/pet-profile/add']);
      this.close();
    } else {
      this.close();
      this.showMaxPetsPopup.set(true);
    }
  }

  closeMaxPetsPopup(): void {
    this.showMaxPetsPopup.set(false);
  }

  goToSubscriptions(): void {
    this.showMaxPetsPopup.set(false);
    this.router.navigate(['/home/subscriptions']);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
  }

  navigateToProfile(): void {
    this.router.navigate(['/user/profile']);
    this.close();
  }

  toggleLanguageDropdown(): void {
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  onLanguageChange(langCode: string): void {
    this.currentLang = langCode;
    this.languageService.setLanguage(langCode as any);
    this.showLanguageDropdown = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.close();
  }

  getUserDisplayName(user: User | null): string {
    if (!user) return '';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.email.split('@')[0];
  }

  getUserInitials(user: User): string {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last) || user.email?.charAt(0)?.toUpperCase() || '?';
  }
}
