import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  private readonly apiUrl = `${environment.apiUrl}/saved`;
  private savedCount$ = new BehaviorSubject<number>(0);
  private loadingSignal = signal(false);

  constructor(private http: HttpClient) {}

  getSavedItems(tab: SavedTab = 'all'): Observable<SavedItem[]> {
    this.loadingSignal.set(true);
    return this.http.get<SavedItem[]>(this.apiUrl).pipe(
      tap(items => {
        // Update saved count
        this.savedCount$.next(items.length);
        this.loadingSignal.set(false);
      }),
      map(items => {
        if (tab === 'all') return items;

        const typeMap: Record<SavedTab, SavedItemType[]> = {
          all: [],
          pets: ['pet'],
          events: ['event'],
          places: ['place']
        };

        return items.filter(item => typeMap[tab].includes(item.type));
      }),
      catchError(err => {
        console.warn('API failed, using fallback:', err);
        this.loadingSignal.set(false);
        const MOCK_DATA: SavedItem[] = [
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
        this.savedCount$.next(MOCK_DATA.length);

        if (tab === 'all') return of(MOCK_DATA);

        const typeMap: Record<SavedTab, SavedItemType[]> = {
          all: [],
          pets: ['pet'],
          events: ['event'],
          places: ['place']
        };

        return of(MOCK_DATA.filter(item => typeMap[tab].includes(item.type)));
      })
    );
  }

  getSavedCount(): Observable<number> {
    return this.savedCount$.asObservable();
  }

  removeSavedItem(itemId: string): Observable<boolean> {
    this.loadingSignal.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${itemId}`).pipe(
      tap(() => {
        console.log('Removed saved item:', itemId);
        this.loadingSignal.set(false);
      }),
      map(() => true),
      catchError(err => {
        console.warn('API failed, using fallback:', err);
        this.loadingSignal.set(false);
        return of(true);
      })
    );
  }

  addSavedItem(item: Omit<SavedItem, 'id' | 'timestamp'>): Observable<SavedItem> {
    this.loadingSignal.set(true);
    return this.http.post<SavedItem>(this.apiUrl, item).pipe(
      tap(savedItem => {
        console.log('Added saved item:', savedItem);
        this.loadingSignal.set(false);
      }),
      catchError(err => {
        console.warn('API failed, using fallback:', err);
        this.loadingSignal.set(false);
        const mockItem: SavedItem = {
          ...item,
          id: `mock_saved_${Date.now()}`,
          timestamp: new Date()
        };
        return of(mockItem);
      })
    );
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
