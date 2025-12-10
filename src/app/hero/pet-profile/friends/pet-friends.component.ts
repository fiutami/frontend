import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface FriendPet {
  id: string;
  name: string;
  species: string;
  avatarUrl: string;
  ownerName: string;
  online: boolean;
  friendsSince: Date;
}

@Component({
  selector: 'app-pet-friends',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pet-friends.component.html',
  styleUrls: ['./pet-friends.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetFriendsComponent {
  // State signals
  isLoading = signal(false);
  friends = signal<FriendPet[]>([
    // Mock data - replace with API call
    {
      id: '1',
      name: 'Luna',
      species: 'Labrador',
      avatarUrl: 'assets/images/default-pet-avatar.png',
      ownerName: 'Marco Rossi',
      online: true,
      friendsSince: new Date('2024-03-15'),
    },
    {
      id: '2',
      name: 'Max',
      species: 'Golden Retriever',
      avatarUrl: 'assets/images/default-pet-avatar.png',
      ownerName: 'Laura Bianchi',
      online: true,
      friendsSince: new Date('2024-05-20'),
    },
    {
      id: '3',
      name: 'Bella',
      species: 'Beagle',
      avatarUrl: 'assets/images/default-pet-avatar.png',
      ownerName: 'Giuseppe Verdi',
      online: false,
      friendsSince: new Date('2024-08-10'),
    },
  ]);

  get isEmpty(): boolean {
    return this.friends().length === 0;
  }

  goBack(): void {
    window.history.back();
  }

  onFriendClick(friend: FriendPet): void {
    // Navigate to friend's profile
    console.log('Friend clicked:', friend);
  }

  onAddFriendClick(): void {
    // Navigate to find friends
    console.log('Add friend clicked');
  }

  formatFriendsSince(date: Date): string {
    return new Intl.DateTimeFormat('it-IT', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
}
