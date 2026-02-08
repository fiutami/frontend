import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarOverlayBaseComponent } from './calendar-overlay-base.component';
import { CalendarOverlayService } from '../services/calendar-overlay.service';

interface CalendarNotification {
  id: string;
  title: string;
  message: string;
  date: Date;
  type: 'event' | 'reminder' | 'birthday';
  icon: string;
  read: boolean;
}

@Component({
  selector: 'app-calendar-notifications-overlay',
  standalone: true,
  imports: [CommonModule, CalendarOverlayBaseComponent],
  template: `
    <app-calendar-overlay-base
      title="Notifiche"
      [isOpen]="overlayService.isOpen()"
      (closed)="overlayService.close()">

      <div class="notifications-overlay">
        <!-- Header with count -->
        <div class="notifications-overlay__header">
          <span class="notifications-overlay__count">{{ unreadCount }} da leggere</span>
          @if (unreadCount > 0) {
            <button type="button" class="notifications-overlay__mark-all" (click)="markAllRead()">
              Segna tutto come letto
            </button>
          }
        </div>

        <!-- Notifications List -->
        <div class="notifications-overlay__list">
          @for (notification of notifications; track notification.id) {
            <div
              class="notifications-overlay__item"
              [class.notifications-overlay__item--unread]="!notification.read"
              (click)="markAsRead(notification)">
              <div class="notifications-overlay__item-icon">
                <span class="material-icons">{{ notification.icon }}</span>
              </div>
              <div class="notifications-overlay__item-content">
                <h4 class="notifications-overlay__item-title">{{ notification.title }}</h4>
                <p class="notifications-overlay__item-message">{{ notification.message }}</p>
                <span class="notifications-overlay__item-date">{{ formatDate(notification.date) }}</span>
              </div>
              @if (!notification.read) {
                <span class="notifications-overlay__item-dot"></span>
              }
            </div>
          } @empty {
            <div class="notifications-overlay__empty">
              <span class="material-icons">notifications_none</span>
              <p>Nessuna notifica</p>
            </div>
          }
        </div>
      </div>

    </app-calendar-overlay-base>
  `,
  styles: [`
    @import 'src/styles/tokens-figma';

    .notifications-overlay {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .notifications-overlay__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .notifications-overlay__count {
      font-size: 14px;
      opacity: 0.8;
    }

    .notifications-overlay__mark-all {
      background: none;
      border: none;
      color: $color-cta-primary;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .notifications-overlay__list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .notifications-overlay__item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &--unread {
        background: rgba(255, 255, 255, 0.12);
      }
    }

    .notifications-overlay__item-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .material-icons {
        font-size: 20px;
        color: $color-cta-primary;
      }
    }

    .notifications-overlay__item-content {
      flex: 1;
      min-width: 0;
    }

    .notifications-overlay__item-title {
      margin: 0 0 4px;
      font-size: 15px;
      font-weight: 600;
    }

    .notifications-overlay__item-message {
      margin: 0 0 6px;
      font-size: 13px;
      opacity: 0.8;
      line-height: 1.4;
    }

    .notifications-overlay__item-date {
      font-size: 12px;
      opacity: 0.6;
    }

    .notifications-overlay__item-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-cta-primary;
      flex-shrink: 0;
      margin-top: 6px;
    }

    .notifications-overlay__empty {
      text-align: center;
      padding: 40px 20px;
      opacity: 0.7;

      .material-icons {
        font-size: 48px;
        margin-bottom: 12px;
      }

      p {
        margin: 0;
        font-size: 15px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarNotificationsOverlayComponent {
  overlayService = inject(CalendarOverlayService);

  // Mock data
  notifications: CalendarNotification[] = [
    {
      id: '1',
      title: 'Vaccino in scadenza',
      message: 'Il vaccino antirabbia di Fido scade tra 7 giorni',
      date: new Date(),
      type: 'reminder',
      icon: 'vaccines',
      read: false,
    },
    {
      id: '2',
      title: 'Compleanno domani!',
      message: 'Domani Luna compie 3 anni',
      date: new Date(Date.now() - 3600000),
      type: 'birthday',
      icon: 'cake',
      read: false,
    },
    {
      id: '3',
      title: 'Nuovo evento salvato',
      message: 'Hai salvato "Fiera Pet Expo Milano"',
      date: new Date(Date.now() - 86400000),
      type: 'event',
      icon: 'event',
      read: true,
    },
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes <= 1 ? 'Adesso' : `${minutes} min fa`;
    }
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'ora' : 'ore'} fa`;
    }
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  }

  markAsRead(notification: CalendarNotification): void {
    notification.read = true;
    this.updateBadgeCount();
  }

  markAllRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.updateBadgeCount();
  }

  private updateBadgeCount(): void {
    this.overlayService.setNotificationCount(this.unreadCount);
  }
}
