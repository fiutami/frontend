import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { PetFriendsService, PetFriend } from '../../../core/services/pet-friends.service';
import { BottomTabBarComponent } from '../../../shared/components/bottom-tab-bar/bottom-tab-bar.component';
import { TabItem } from '../../../shared/components/bottom-tab-bar/bottom-tab-bar.models';

@Component({
  selector: 'app-pet-friends',
  standalone: true,
  imports: [CommonModule, BottomTabBarComponent],
  templateUrl: './pet-friends.component.html',
  styleUrls: ['./pet-friends.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetFriendsComponent implements OnInit {
  private location = inject(Location);
  private router = inject(Router);
  private petFriendsService = inject(PetFriendsService);

  friends = signal<PetFriend[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  tabs: TabItem[] = [
    { id: 'home', icon: 'home', iconSrc: 'assets/icons/nav/home.svg', activeIconSrc: 'assets/icons/nav/home-active.svg', route: '/home/main', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', iconSrc: 'assets/icons/nav/calendar.svg', activeIconSrc: 'assets/icons/nav/calendar-active.svg', route: '/home/calendar', label: 'Calendario' },
    { id: 'location', icon: 'place', iconSrc: 'assets/icons/nav/map.svg', activeIconSrc: 'assets/icons/nav/map-active.svg', route: '/home/map', label: 'Mappa' },
    { id: 'species', icon: 'pets', iconSrc: 'assets/icons/nav/species.svg', activeIconSrc: 'assets/icons/nav/species-active.svg', route: '/home/species', label: 'Specie' },
    { id: 'profile', icon: 'person', iconSrc: 'assets/icons/nav/profile.svg', activeIconSrc: 'assets/icons/nav/profile-active.svg', route: '/user/profile', label: 'Profilo' }
  ];

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
