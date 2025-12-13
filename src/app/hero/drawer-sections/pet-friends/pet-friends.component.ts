import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
  private petFriendsService = inject(PetFriendsService);

  friends = signal<PetFriend[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  tabs: TabItem[] = [
    { id: 'home', icon: 'home', label: 'Home', route: '/home' },
    { id: 'explore', icon: 'explore', label: 'Esplora', route: '/explore' },
    { id: 'add', icon: 'add_circle', label: 'Aggiungi', route: '/add' },
    { id: 'messages', icon: 'chat', label: 'Messaggi', route: '/messages' },
    { id: 'profile', icon: 'person', label: 'Profilo', route: '/profile' }
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
    console.log('Send message to:', friend.userName);
  }

  viewPets(friend: PetFriend): void {
    console.log('View pets of:', friend.userName);
  }

  viewProfile(friend: PetFriend): void {
    console.log('View profile:', friend.userName);
  }
}
