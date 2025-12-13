import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subject, takeUntil, fromEvent, debounceTime, startWith } from 'rxjs';
import { DrawerService } from './drawer.service';
import { AuthService } from '../../../core/services/auth.service';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'foldable-folded' | 'foldable-unfolded';

export interface DrawerMenuItem {
  label: string;
  route?: string;
  icon?: string;
  action?: () => void;
  separator?: boolean;
}

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  isOpen = false;
  searchQuery = '';

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

  menuItems: DrawerMenuItem[] = [
    { label: 'Account', route: '/home/account', icon: 'person' },
    { label: 'La tua attività', route: '/home/activity', icon: 'history' },
    { label: 'Notifiche', route: '/home/notifications', icon: 'notifications' },
    { label: 'Preferiti', route: '/home/favorites', icon: 'favorite' },
    { separator: true, label: '' },
    { label: 'Adottare', route: '/home/adopt', icon: 'pets' },
    { label: 'Aggiungi Pets', route: '/home/pet-register', icon: 'add_circle' },
    { label: 'Amici Pets', route: '/home/friends', icon: 'group' },
    { label: 'Invita Amici', route: '/home/invite', icon: 'share' },
    { separator: true, label: '' },
    { label: 'Animali Smarriti', route: '/home/lost-pets', icon: 'search' },
    { label: 'Utenti Bloccati', route: '/home/blocked', icon: 'block' },
    { label: 'Termini di servizio', route: '/home/terms', icon: 'description' },
    { label: 'Abbonamenti', route: '/home/subscriptions', icon: 'card_membership' },
    { label: 'Contattaci', route: '/home/contact', icon: 'mail' },
    { label: 'Privacy', route: '/home/privacy', icon: 'security' },
    { separator: true, label: '' },
    { label: 'Esci', icon: 'logout', action: () => this.logout() },
  ];

  get filteredMenuItems(): DrawerMenuItem[] {
    if (!this.searchQuery.trim()) {
      return this.menuItems;
    }
    const query = this.searchQuery.toLowerCase();
    return this.menuItems.filter(
      item => item.separator || item.label.toLowerCase().includes(query)
    );
  }

  ngOnInit(): void {
    this.drawerService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
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
    if (item.action) {
      item.action();
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
    this.close();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
  }

  navigateToProfile(): void {
    this.router.navigate(['/user/profile']);
    this.close();
  }

  private logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
