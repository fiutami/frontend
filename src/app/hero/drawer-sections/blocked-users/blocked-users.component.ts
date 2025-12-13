import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { BlockedUsersService, BlockedUser } from '../../../core/services/blocked-users.service';

@Component({
  selector: 'app-blocked-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blocked-users.component.html',
  styleUrls: ['./blocked-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockedUsersComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly blockedUsersService = inject(BlockedUsersService);

  readonly blockedUsers = signal<BlockedUser[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly showConfirmModal = signal(false);
  readonly userToUnblock = signal<BlockedUser | null>(null);
  readonly isUnblocking = signal(false);


  ngOnInit(): void {
    this.loadBlockedUsers();
  }

  loadBlockedUsers(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.blockedUsersService.getBlockedUsers().subscribe({
      next: (users) => {
        this.blockedUsers.set(users);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  formatBlockedDate(date: Date): string {
    return this.blockedUsersService.formatBlockedDate(date);
  }

  getInitials(name: string): string {
    return this.blockedUsersService.getInitials(name);
  }

  openUnblockConfirm(user: BlockedUser): void {
    this.userToUnblock.set(user);
    this.showConfirmModal.set(true);
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
    this.userToUnblock.set(null);
  }

  confirmUnblock(): void {
    const user = this.userToUnblock();
    if (!user) return;

    this.isUnblocking.set(true);

    this.blockedUsersService.unblockUser(user.id).subscribe({
      next: () => {
        this.blockedUsers.update(users =>
          users.filter(u => u.id !== user.id)
        );
        this.isUnblocking.set(false);
        this.closeConfirmModal();
      },
      error: () => {
        this.isUnblocking.set(false);
      }
    });
  }
}
