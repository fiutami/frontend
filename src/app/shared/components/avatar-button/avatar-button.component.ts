import {
  Component,
  ChangeDetectionStrategy,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerService } from '../drawer/drawer.service';
import { AuthService, User } from '../../../core/services/auth.service';
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
      (click)="openDrawer()"
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
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarButtonComponent {
  private drawerService = inject(DrawerService);
  private authService = inject(AuthService);

  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() avatarUrl?: string;

  user$: Observable<User | null> = this.authService.currentUser$;

  openDrawer(): void {
    this.drawerService.open();
  }

  getInitials(user: User): string {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last) || user.email?.charAt(0)?.toUpperCase() || '?';
  }
}
