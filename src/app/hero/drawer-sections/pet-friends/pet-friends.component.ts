import { Component, OnInit, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PetFriendsService, PetFriend } from '../../../core/services/pet-friends.service';

// Shell Drawer (sfondo blu solido, solo header + back, niente avatar/logo/mascot/tab bar)
import { TabPageShellDrawerComponent } from '../../../shared/components/tab-page-shell-drawer';

@Component({
  selector: 'app-pet-friends',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TabPageShellDrawerComponent,
  ],
  templateUrl: './pet-friends.component.html',
  styleUrls: ['./pet-friends.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetFriendsComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly petFriendsService = inject(PetFriendsService);
  private readonly translate = inject(TranslateService);

  /** Translated page title */
  protected pageTitle = this.translate.instant('drawerPetFriends.title');

  friends = signal<PetFriend[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  // Search
  readonly searchQuery = signal('');

  // Filtered friends based on search
  readonly filteredFriends = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.friends();
    if (!query) return list;
    return list.filter(f =>
      f.userName.toLowerCase().includes(query)
    );
  });

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.pageTitle = this.translate.instant('drawerPetFriends.title');
    });
  }

  ngOnInit(): void {
    this.loadFriends();
  }

  goBack(): void {
    this.location.back();
  }

  loadFriends(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.petFriendsService.getPetFriends().subscribe({
      next: (friends) => {
        this.friends.set(friends);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  retry(): void {
    this.loadFriends();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  viewProfile(friend: PetFriend): void {
    // Navigate to user profile
    this.router.navigate(['/user/profile', friend.id]);
  }

  selectFriends(): void {
    // Navigate to search/friend selection
    this.router.navigate(['/home/chat']);
  }
}
