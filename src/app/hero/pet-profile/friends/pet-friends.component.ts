import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default/tab-page-shell-default.component';

export interface FriendPet {
  id: string;
  name: string;
  species: string;
  avatarUrl: string;
  ownerName: string;
  online: boolean;
  friendsSince: Date;
}

export interface SuggestedPet {
  id: string;
  name: string;
  avatarUrl: string;
}

@Component({
  selector: 'app-pet-friends',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, TabPageShellDefaultComponent],
  templateUrl: './pet-friends.component.html',
  styleUrls: ['./pet-friends.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetFriendsComponent {
  isLoading = signal(false);

  friends = signal<FriendPet[]>([
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

  suggestedFriends = signal<SuggestedPet[]>([
    { id: '10', name: 'Max', avatarUrl: 'assets/images/default-pet-avatar.png' },
    { id: '11', name: 'Rex', avatarUrl: 'assets/images/default-pet-avatar.png' },
    { id: '12', name: 'Rex', avatarUrl: 'assets/images/default-pet-avatar.png' },
    { id: '13', name: 'Rex', avatarUrl: 'assets/images/default-pet-avatar.png' },
    { id: '14', name: 'Sendy', avatarUrl: 'assets/images/default-pet-avatar.png' },
    { id: '15', name: 'Rex', avatarUrl: 'assets/images/default-pet-avatar.png' },
  ]);

  readonly isEmpty = computed(() => this.friends().length === 0);

  /** First 3 friends for the photo grid */
  readonly gridFriends = computed(() => this.friends().slice(0, 3));

  goBack(): void {
    window.history.back();
  }

  onFriendClick(friend: FriendPet): void {
    console.log('Friend clicked:', friend);
  }

  onSuggestedClick(pet: SuggestedPet): void {
    console.log('Suggested friend clicked:', pet);
  }

  onAddFriendClick(): void {
    console.log('Add friend clicked');
  }

  onEditClick(): void {
    console.log('Edit friends clicked');
  }

  onPromoClick(): void {
    console.log('Promo clicked');
  }

  formatFriendsSince(date: Date): string {
    return new Intl.DateTimeFormat('it-IT', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
}
