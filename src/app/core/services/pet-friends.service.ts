import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export type PetType = 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  imageUrl?: string;
}

export interface PetFriend {
  id: string;
  userName: string;
  userAvatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  location?: string;
  pets: Pet[];
  friendsSince: Date;
  mutualFriends?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PetFriendsService {

  getPetFriends(): Observable<PetFriend[]> {
    // Mock data - da sostituire con chiamata API reale
    const mockFriends: PetFriend[] = [
      {
        id: 'friend_1',
        userName: 'Marco Rossi',
        isOnline: true,
        location: 'Milano, MI',
        pets: [
          { id: 'pet_1_1', name: 'Rocky', type: 'dog', breed: 'Labrador' },
          { id: 'pet_1_2', name: 'Mia', type: 'cat', breed: 'Persiano' }
        ],
        friendsSince: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 1 mese fa
        mutualFriends: 5
      },
      {
        id: 'friend_2',
        userName: 'Laura Bianchi',
        isOnline: true,
        location: 'Roma, RM',
        pets: [
          { id: 'pet_2_1', name: 'Luna', type: 'dog', breed: 'Golden Retriever' }
        ],
        friendsSince: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 2 mesi fa
        mutualFriends: 3
      },
      {
        id: 'friend_3',
        userName: 'Giuseppe Verdi',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 ore fa
        location: 'Torino, TO',
        pets: [
          { id: 'pet_3_1', name: 'Pallino', type: 'rabbit', breed: 'Ariete' },
          { id: 'pet_3_2', name: 'Birba', type: 'cat', breed: 'Europeo' },
          { id: 'pet_3_3', name: 'Max', type: 'dog', breed: 'Beagle' }
        ],
        friendsSince: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120), // 4 mesi fa
        mutualFriends: 8
      },
      {
        id: 'friend_4',
        userName: 'Anna Neri',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 giorno fa
        location: 'Bologna, BO',
        pets: [
          { id: 'pet_4_1', name: 'Kira', type: 'dog', breed: 'Pastore Tedesco' }
        ],
        friendsSince: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // 3 mesi fa
        mutualFriends: 2
      },
      {
        id: 'friend_5',
        userName: 'Francesco Costa',
        isOnline: true,
        location: 'Firenze, FI',
        pets: [
          { id: 'pet_5_1', name: 'Oscar', type: 'cat', breed: 'Maine Coon' },
          { id: 'pet_5_2', name: 'Polly', type: 'bird', breed: 'Pappagallo' }
        ],
        friendsSince: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180), // 6 mesi fa
        mutualFriends: 12
      }
    ];

    // Simula delay di rete
    return of(mockFriends).pipe(delay(500));
  }

  getPetFriendById(id: string): Observable<PetFriend | null> {
    return new Observable(observer => {
      this.getPetFriends().subscribe(friends => {
        const friend = friends.find(f => f.id === id) || null;
        observer.next(friend);
        observer.complete();
      });
    });
  }

  getPetTypeIcon(type: PetType): string {
    const iconMap: Record<PetType, string> = {
      dog: 'pets',
      cat: 'pets',
      rabbit: 'cruelty_free',
      bird: 'flutter',
      other: 'eco'
    };
    return iconMap[type] || 'pets';
  }

  getPetTypeLabel(type: PetType): string {
    const labelMap: Record<PetType, string> = {
      dog: 'Cane',
      cat: 'Gatto',
      rabbit: 'Coniglio',
      bird: 'Uccello',
      other: 'Altro'
    };
    return labelMap[type] || 'Animale';
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
    if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'mese' : 'mesi'} fa`;

    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatFriendsSince(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffDays < 30) return `da ${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'}`;
    if (diffMonths < 12) return `da ${diffMonths} ${diffMonths === 1 ? 'mese' : 'mesi'}`;
    return `da ${diffYears} ${diffYears === 1 ? 'anno' : 'anni'}`;
  }
}
