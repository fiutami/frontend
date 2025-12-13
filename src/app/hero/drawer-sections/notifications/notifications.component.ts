import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, fromEvent, debounceTime, startWith, takeUntil } from 'rxjs';
import { NotificationsService, NotificationItem, NotificationTab } from '../../../core/services/notifications.service';
import { BottomTabBarComponent, TabItem } from '../../../shared/components/bottom-tab-bar';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'foldable-folded' | 'foldable-unfolded';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, BottomTabBarComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private location = inject(Location);
  private router = inject(Router);
  private notificationsService = inject(NotificationsService);
  private destroy$ = new Subject<void>();

  title = 'Notifiche';

  // State signals
  notifications = signal<NotificationItem[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  activeTab = signal<NotificationTab>('all');
  unreadCount = signal(0);

  // Viewport detection
  private windowWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 375);
  private windowHeight = signal(typeof window !== 'undefined' ? window.innerHeight : 667);

  viewportSize = computed<ViewportSize>(() => {
    const width = this.windowWidth();
    const height = this.windowHeight();
    const aspectRatio = width / height;

    if (width >= 700 && width <= 800 && height >= 500 && height <= 730) {
      return aspectRatio > 1 ? 'foldable-folded' : 'foldable-unfolded';
    }
    if (width >= 717 && width <= 720 && height >= 500 && height <= 520) {
      return 'foldable-folded';
    }
    if (width >= 1400 && width <= 1500 && height >= 700 && height <= 800) {
      return 'foldable-unfolded';
    }
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  // Tab configuration
  tabOptions: { id: NotificationTab; label: string; icon: string }[] = [
    { id: 'all', label: 'Tutte', icon: 'notifications' },
    { id: 'general', label: 'Generali', icon: 'info' },
    { id: 'security', label: 'Sicurezza', icon: 'security' },
    { id: 'nearby', label: 'Vicino a me', icon: 'location_on' }
  ];

  // Bottom tab bar config
  tabs: TabItem[] = [
    { id: 'home', icon: 'home', route: '/home/main', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', route: '/home/calendar', label: 'Calendario' },
    { id: 'location', icon: 'place', route: '/home/map', label: 'Mappa' },
    { id: 'pet', icon: 'pets', route: '/home/pet-profile', label: 'Pet' },
    { id: 'profile', icon: 'person', route: '/user/profile', label: 'Profilo' },
  ];

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();

    // Viewport resize listener
    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize')
        .pipe(debounceTime(100), startWith(null), takeUntil(this.destroy$))
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

  goBack(): void {
    this.location.back();
  }

  selectTab(tab: NotificationTab): void {
    if (this.activeTab() !== tab) {
      this.activeTab.set(tab);
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.notificationsService.getNotifications(this.activeTab()).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  loadUnreadCount(): void {
    this.notificationsService.getUnreadCount().subscribe(count => {
      this.unreadCount.set(count);
    });
  }

  formatTime(date: Date): string {
    return this.notificationsService.formatRelativeTime(date);
  }

  onNotificationClick(notification: NotificationItem): void {
    // Mark as read
    if (!notification.isRead) {
      this.notificationsService.markAsRead(notification.id).subscribe();
      this.notifications.update(list =>
        list.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
      this.unreadCount.update(count => Math.max(0, count - 1));
    }

    // Navigate if action URL exists
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe(() => {
      this.notifications.update(list =>
        list.map(n => ({ ...n, isRead: true }))
      );
      this.unreadCount.set(0);
    });
  }

  getNotificationTypeClass(type: NotificationItem['type']): string {
    const classMap: Record<NotificationItem['type'], string> = {
      general: 'notification--general',
      security: 'notification--security',
      nearby: 'notification--nearby',
      friend: 'notification--friend',
      pet: 'notification--pet',
      event: 'notification--event',
      system: 'notification--system'
    };
    return classMap[type] || '';
  }

  retry(): void {
    this.loadNotifications();
  }
}
