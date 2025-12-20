import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BlockedUsersService, BlockedUser } from '../../core/services/blocked-users.service';

@Component({
  selector: 'app-blocked',
  templateUrl: './blocked.component.html',
  styleUrls: ['./blocked.component.scss']
})
export class BlockedComponent implements OnInit, OnDestroy {
  blockedUsers: BlockedUser[] = [];
  loading = true;
  searchQuery = '';
  isSelecting = false;
  selectedUsers: Set<string> = new Set();

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private blockedUsersService: BlockedUsersService
  ) {}

  ngOnInit(): void {
    this.loadBlockedUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBlockedUsers(): void {
    this.loading = true;
    this.blockedUsersService.getBlockedUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.blockedUsers = users;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  get isEmpty(): boolean {
    return this.blockedUsers.length === 0;
  }

  get filteredUsers(): BlockedUser[] {
    if (!this.searchQuery.trim()) {
      return this.blockedUsers;
    }
    const query = this.searchQuery.toLowerCase();
    return this.blockedUsers.filter(u =>
      u.displayName.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query)
    );
  }

  goBack(): void {
    this.router.navigate(['/user/dashboard']);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
  }

  toggleSelecting(): void {
    this.isSelecting = !this.isSelecting;
    if (!this.isSelecting) {
      this.selectedUsers.clear();
    }
  }

  toggleUserSelection(user: BlockedUser): void {
    if (this.selectedUsers.has(user.id)) {
      this.selectedUsers.delete(user.id);
    } else {
      this.selectedUsers.add(user.id);
    }
  }

  isUserSelected(user: BlockedUser): boolean {
    return this.selectedUsers.has(user.id);
  }

  unblockUser(user: BlockedUser): void {
    this.blockedUsersService.unblockUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.blockedUsers = this.blockedUsers.filter(u => u.id !== user.id);
        }
      });
  }

  unblockSelected(): void {
    const selectedIds = Array.from(this.selectedUsers);
    selectedIds.forEach(id => {
      this.blockedUsersService.unblockUser(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.blockedUsers = this.blockedUsers.filter(u => u.id !== id);
            this.selectedUsers.delete(id);
          }
        });
    });
    this.isSelecting = false;
  }

  formatBlockedDate(date: Date): string {
    return this.blockedUsersService.formatBlockedDate(date);
  }

  getInitials(name: string): string {
    return this.blockedUsersService.getInitials(name);
  }
}
