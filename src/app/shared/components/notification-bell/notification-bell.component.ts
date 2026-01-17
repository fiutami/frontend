import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  HostListener,
  Input,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { NotificationsService, NotificationItem } from '../../../core/services/notifications.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBellComponent {
  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly notificationsService = inject(NotificationsService);

  @Input() count = 0;

  isSheetOpen = signal(false);
  notifications = signal<NotificationItem[]>([]);
  isLoading = signal(false);

  toggle(): void {
    const next = !this.isSheetOpen();
    this.isSheetOpen.set(next);

    if (next) {
      this.loadLatest();
    }
  }

  close(): void {
    this.isSheetOpen.set(false);
  }

  goToAll(): void {
    this.close();
    this.router.navigate(['/home/notifications']);
  }

  openNotification(item: NotificationItem): void {
    if (item?.actionUrl) {
      this.close();
      this.router.navigate([item.actionUrl]);
    }
  }

  formatTime(date: Date): string {
    return this.notificationsService.formatRelativeTime(date);
  }

  private loadLatest(): void {
    this.isLoading.set(true);

    this.notificationsService.getNotifications('all')
      .pipe(take(1))
      .subscribe({
        next: (list) => {
          const safe = Array.isArray(list) ? list : [];
          this.notifications.set(safe.slice(0, 5));
          this.isLoading.set(false);
        },
        error: () => {
          this.notifications.set([]);
          this.isLoading.set(false);
        },
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isSheetOpen()) return;

    const target = event.target as Node | null;
    const host = this.elRef.nativeElement;

    if (target && host.contains(target)) return;

    this.close();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isSheetOpen()) {
      this.close();
    }
  }
}
