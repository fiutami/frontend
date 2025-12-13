import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NotificationsService, NotificationItem, NotificationTab } from '../../../core/services/notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {
  private location = inject(Location);
  private router = inject(Router);
  private notificationsService = inject(NotificationsService);

  title = 'Notifiche';

  // State signals
  notifications = signal<NotificationItem[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  activeTab = signal<NotificationTab>('all');
  unreadCount = signal(0);

  // Tab configuration
  tabOptions: { id: NotificationTab; label: string; icon: string }[] = [
    { id: 'all', label: 'Tutte', icon: 'notifications' },
    { id: 'general', label: 'Generali', icon: 'info' },
    { id: 'security', label: 'Sicurezza', icon: 'security' },
    { id: 'nearby', label: 'Vicino a me', icon: 'location_on' }
  ];


  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
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
