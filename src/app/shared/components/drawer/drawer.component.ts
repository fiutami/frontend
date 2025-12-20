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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subject, takeUntil, fromEvent, debounceTime, startWith } from 'rxjs';
import { DrawerService } from './drawer.service';
import { AuthService, User } from '../../../core/services/auth.service';

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
      state('closed', style({ opacity: 0, visibility: 'hidden' })),
      state('open', style({ opacity: 1, visibility: 'visible' })),
      transition('closed <=> open', animate('200ms ease-out')),
    ]),
  ],
})
export class DrawerComponent implements OnInit, OnDestroy {
  private drawerService = inject(DrawerService);
  private authService = inject(AuthService);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  isOpen = false;
  searchQuery = '';
  showLanguageDropdown = false;
  currentLang = 'it';

  // User from auth service
  user$ = this.authService.currentUser$;

  // User avatar URL (from profile)
  userAvatarUrl: string | null = null;

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
  menuSections: DrawerMenuSection[] = [
    {
      // Primary section - Account & Activity
      items: [
        { labelKey: 'drawer.account', route: '/home/account', icon: 'person' },
        { labelKey: 'drawer.activity', route: '/home/activity', icon: 'history' },
        { labelKey: 'drawer.notifications', route: '/home/notifications', icon: 'notifications' },
        { labelKey: 'drawer.saved', route: '/home/saved', icon: 'bookmark' },
      ]
    },
    {
      // Pets section
      items: [
        { labelKey: 'drawer.adopt', route: '/home/adopt', icon: 'pets' },
        { labelKey: 'drawer.addPet', route: '/onboarding/register-pet', icon: 'add_circle' },
        { labelKey: 'drawer.petFriends', route: '/home/friends', icon: 'group' },
        { labelKey: 'drawer.inviteFriends', route: '/home/invite', icon: 'share' },
        { labelKey: 'drawer.lostPets', route: '/lost-pets', icon: 'search' },
      ]
    },
    {
      // Settings section
      items: [
        { labelKey: 'drawer.blockedUsers', route: '/home/blocked', icon: 'block' },
        { labelKey: 'drawer.terms', route: '/home/terms', icon: 'description' },
        { labelKey: 'drawer.subscriptions', route: '/home/subscriptions', icon: 'card_membership' },
        { labelKey: 'drawer.contact', route: '/home/contact', icon: 'mail' },
        { labelKey: 'drawer.privacy', route: '/home/privacy', icon: 'security' },
      ]
    },
    {
      // Logout section
      items: [
        { labelKey: 'drawer.logout', icon: 'logout', isLogout: true },
      ]
    }
  ];

  get currentLanguage(): Language {
    return this.languages.find(l => l.code === this.currentLang) || this.languages[0];
  }

  ngOnInit(): void {
    // Get saved language or default
    const savedLang = localStorage.getItem('lang');
    if (savedLang && this.languages.some(l => l.code === savedLang)) {
      this.currentLang = savedLang;
    }

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

  onBackdropClick(): void {
    this.close();
  }

  onMenuItemClick(item: DrawerMenuItem): void {
    if (item.isLogout) {
      this.logout();
    } else if (item.route) {
      this.router.navigate([item.route]);
      this.close();
    }
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
    this.translateService.use(langCode);
    localStorage.setItem('lang', langCode);
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
