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
import { PetService } from '../../../core/services/pet.service';
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
      [attr.aria-label]="mode === 'pet' ? 'Apri menu' : 'Apri menu utente'"
    >
      @if (mode === 'pet') {
        <!-- Mode Pet: mostra foto del pet attivo -->
        @if (petPhotoUrl()) {
          <img
            [src]="petPhotoUrl()"
            [alt]="petName()"
            class="avatar-button__image"
          />
        } @else {
          <span class="avatar-button__pet-placeholder">🐾</span>
        }
      } @else {
        <!-- Mode User: comportamento originale -->
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
      }
      <!-- Notification badge -->
      @if (showBadge && notificationCount() > 0) {
        <span class="avatar-button__badge">
          {{ notificationCount() > 99 ? '99+' : notificationCount() }}
        </span>
      }
    </button>
  `,
  styleUrls: ['./avatar-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarButtonComponent {
  private drawerService = inject(DrawerService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private petService = inject(PetService);

  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() avatarUrl?: string;
  /** Show notification badge */
  @Input() showBadge = true;
  /** Mode: 'user' (default) shows user avatar, 'pet' shows active pet photo */
  @Input() mode: 'user' | 'pet' = 'user';

  user$: Observable<User | null> = this.authService.currentUser$;

  // Use notification service signal directly
  notificationCount = computed(() => this.notificationService.unreadCount());

  // Pet photo computed (selectedPet o fallback primo pet)
  petPhotoUrl = computed(() => {
    const selected = this.petService.selectedPet();
    if (selected?.profilePhotoUrl) {
      return selected.profilePhotoUrl;
    }
    const petsList = this.petService.pets();
    return petsList?.pets?.[0]?.profilePhotoUrl ?? null;
  });

  petName = computed(() => {
    const selected = this.petService.selectedPet();
    if (selected?.name) {
      return selected.name;
    }
    const petsList = this.petService.pets();
    return petsList?.pets?.[0]?.name ?? 'Pet';
  });

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
