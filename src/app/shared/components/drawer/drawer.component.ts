import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { DrawerService } from './drawer.service';
import { AuthService } from '../../../core/services/auth.service';

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

  menuItems: DrawerMenuItem[] = [
    { label: 'Account', route: '/user/account', icon: 'person' },
    { label: 'La tua attività', route: '/user/activity', icon: 'history' },
    { label: 'Notifiche', route: '/notifications', icon: 'notifications' },
    { label: 'Preferiti', route: '/favorites', icon: 'favorite' },
    { separator: true, label: '' },
    { label: 'Adottare', route: '/adopt', icon: 'pets' },
    { label: 'Aggiungi Pets', route: '/home/pet-register', icon: 'add_circle' },
    { label: 'Amici Pets', route: '/friends', icon: 'group' },
    { label: 'Invita Amici', route: '/invite', icon: 'share' },
    { separator: true, label: '' },
    { label: 'Utenti Bloccati', route: '/blocked', icon: 'block' },
    { label: 'Termini di servizio', route: '/terms', icon: 'description' },
    { label: 'Abbonamenti', route: '/subscriptions', icon: 'card_membership' },
    { label: 'Contattaci', route: '/contact', icon: 'mail' },
    { label: 'Privacy', route: '/privacy', icon: 'security' },
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
