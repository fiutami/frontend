import {
  Component,
  ChangeDetectionStrategy,
  Input,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerService } from '../drawer/drawer.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-avatar-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="avatar-button"
      [class.avatar-button--small]="size === 'small'"
      [class.avatar-button--medium]="size === 'medium'"
      [class.avatar-button--large]="size === 'large'"
      (click)="onClick()"
      type="button"
      [attr.aria-label]="'Apri menu utente'"
    >
      @if (user$ | async; as user) {
        @if (avatarUrl) {
          <img
            [src]="avatarUrl"
            [alt]="user.firstName"
            class="avatar-button__image"
          />
        } @else {
          <span class="avatar-button__initials">
            {{ getInitials(user) }}
          </span>
        }
      } @else {
        <span class="avatar-button__placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </span>
      }
      <!-- Notification badge -->
      @if (showBadge && notificationCount() > 0) {
        <span class="avatar-button__badge">
          {{ notificationCount() > 99 ? '99+' : notificationCount() }}
        </span>
      }
    </button>
  `,
  styles: [`
    .avatar-button {
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      &:active {
        transform: scale(0.95);
      }

      &--small {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }

      &--medium {
        width: 40px;
        height: 40px;
        font-size: 14px;
      }

      &--large {
        width: 48px;
        height: 48px;
        font-size: 16px;
      }

      &__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &__initials {
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      &__placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.9;

        svg {
          width: 60%;
          height: 60%;
        }
      }

      &__badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        background: #FF4444;
        color: white;
        font-size: 10px;
        font-weight: 700;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    }

    :host {
      position: relative;
      display: inline-block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarButtonComponent {
  private drawerService = inject(DrawerService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() avatarUrl?: string;
  /** Show notification badge */
  @Input() showBadge = true;

  user$: Observable<User | null> = this.authService.currentUser$;

  // Use notification service signal directly
  notificationCount = computed(() => this.notificationService.unreadCount());

  onClick(): void {
    // Always open drawer (unified experience)
    this.drawerService.open();
  }

  getInitials(user: User): string {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last) || user.email?.charAt(0)?.toUpperCase() || '?';
  }
}
