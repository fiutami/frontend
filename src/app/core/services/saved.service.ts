import { Injectable } from '@angular/core';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export type SavedItemType = 'pet' | 'event' | 'place' | 'post' | 'user';

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  subtitle: string;
  imageUrl?: string;
  timestamp: Date;
  icon: string;
  actionUrl?: string;
  metadata?: {
    petName?: string;
    petBreed?: string;
    eventDate?: string;
    placeName?: string;
    placeAddress?: string;
    userName?: string;
  };
}

export type SavedTab = 'all' | 'pets' | 'events' | 'places';

@Injectable({
  providedIn: 'root'
})
export class SavedService {
  private savedCount$ = new BehaviorSubject<number>(0);

  getSavedItems(tab: SavedTab = 'all'): Observable<SavedItem[]> {
    // Mock data
    const mockSavedItems: SavedItem[] = [
      {
        id: 'mock_saved_1',
        type: 'pet',
        title: 'Luna',
        subtitle: 'Golden Retriever • 2 anni',
        imageUrl: '/assets/images/pets/golden-retriever.jpg',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        icon: 'pets',
        actionUrl: '/home/pet-profile/pet_1',
        metadata: { petName: 'Luna', petBreed: 'Golden Retriever' }
      },
      {
        id: 'mock_saved_2',
        type: 'event',
        title: 'Passeggiata al Parco',
        subtitle: 'Domenica 15 Dic • 10:00',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        icon: 'event',
        actionUrl: '/home/calendar',
        metadata: { eventDate: '2024-12-15T10:00:00' }
      },
      {
        id: 'mock_saved_3',
        type: 'place',
        title: 'Area Cani Parco Sempione',
        subtitle: 'Milano • 1.2km da te',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        icon: 'place',
        actionUrl: '/home/map',
        metadata: { placeName: 'Area Cani Parco Sempione', placeAddress: 'Parco Sempione, Milano' }
      },
      {
        id: 'mock_saved_4',
        type: 'pet',
        title: 'Thor',
        subtitle: 'Labrador • 4 anni',
        imageUrl: '/assets/images/pets/labrador.jpg',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        icon: 'pets',
        actionUrl: '/home/pet-profile/pet_2',
        metadata: { petName: 'Thor', petBreed: 'Labrador' }
      },
      {
        id: 'mock_saved_5',
        type: 'event',
        title: 'Corso Agility',
        subtitle: 'Sabato 21 Dic • 15:00',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        icon: 'event',
        actionUrl: '/home/calendar',
        metadata: { eventDate: '2024-12-21T15:00:00' }
      },
      {
        id: 'mock_saved_6',
        type: 'place',
        title: 'Veterinario Amici Animali',
        subtitle: 'Via Roma 45, Milano',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
        icon: 'local_hospital',
        actionUrl: '/home/map',
        metadata: { placeName: 'Veterinario Amici Animali', placeAddress: 'Via Roma 45, Milano' }
      },
      {
        id: 'mock_saved_7',
        type: 'user',
        title: 'Marco Rossi',
        subtitle: '3 pets • Amico',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
        icon: 'person',
        metadata: { userName: 'Marco Rossi' }
      }
    ];

    // Update saved count
    this.savedCount$.next(mockSavedItems.length);

    return of(mockSavedItems).pipe(
      delay(350),
      map(items => {
        if (tab === 'all') return items;

        const typeMap: Record<SavedTab, SavedItemType[]> = {
          all: [],
          pets: ['pet'],
          events: ['event'],
          places: ['place']
        };

        return items.filter(item => typeMap[tab].includes(item.type));
      })
    );
  }

  getSavedCount(): Observable<number> {
    return this.savedCount$.asObservable();
  }

  removeSavedItem(itemId: string): Observable<boolean> {
    console.log('Removing saved item:', itemId);
    return of(true).pipe(delay(200));
  }

  addSavedItem(item: Omit<SavedItem, 'id' | 'timestamp'>): Observable<SavedItem> {
    const newItem: SavedItem = {
      ...item,
      id: `mock_saved_${Date.now()}`,
      timestamp: new Date()
    };
    console.log('Adding saved item:', newItem);
    return of(newItem).pipe(delay(200));
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;

    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short'
    });
  }
}
