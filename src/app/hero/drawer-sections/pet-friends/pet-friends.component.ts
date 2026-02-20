import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
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

  formatFriendsSince(date: Date): string {
    return this.petFriendsService.formatFriendsSince(date);
  }

  formatLastSeen(date: Date | undefined): string {
    if (!date) return '';
    return this.petFriendsService.formatRelativeTime(date);
  }

  getPetNames(friend: PetFriend): string[] {
    return friend.pets.slice(0, 2).map(pet => pet.name);
  }

  getExtraPetsCount(friend: PetFriend): number {
    return Math.max(0, friend.pets.length - 2);
  }

  sendMessage(friend: PetFriend): void {
    this.router.navigate(['/home/chat'], {
      queryParams: { userId: friend.id }
    });
  }

  viewPets(friend: PetFriend): void {
    // Navigate to first pet's profile
    if (friend.pets && friend.pets.length > 0) {
      this.router.navigate(['/home/pet-profile', friend.pets[0].id]);
    }
  }

  viewProfile(friend: PetFriend): void {
    // Navigate to user profile
    this.router.navigate(['/user/profile', friend.id]);
  }
}
