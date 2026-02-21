import { Injectable } from '@angular/core';
import { Observable, of, delay, catchError, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface LostPet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed?: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  imageUrl: string;
  lastSeenDate: Date;
  lastSeenLocation: string;
  description: string;
  ownerName: string;
  ownerPhone: string;
  status: 'lost' | 'found' | 'searching';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LostPetsService {
  private readonly apiUrl = `${environment.apiUrl}/lost-pets`;

  constructor(private http: HttpClient) {}

  getLostPets(): Observable<LostPet[]> {
    return this.http.get<LostPet[]>(this.apiUrl).pipe(
      map(pets => pets.map(p => ({
        ...p,
        lastSeenDate: new Date(p.lastSeenDate),
        createdAt: new Date(p.createdAt),
      }))),
      catchError(err => {
        console.warn('API failed, using fallback:', err);
        return of(MOCK_DATA);
      })
    );
  }

  reportSighting(petId: string, location: string, notes: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/${petId}/sightings`, {
      location,
      notes
    }).pipe(
      catchError(err => {
        console.warn('API failed, using fallback:', err);
        console.log('Sighting reported (fallback):', { petId, location, notes });
        return of(true);
      })
    );
  }

  getSpeciesIcon(species: LostPet['species']): string {
    const icons: Record<LostPet['species'], string> = {
      dog: 'pets',
      cat: 'pets',
      bird: 'flutter_dash',
      rabbit: 'cruelty_free',
      other: 'pets'
    };
    return icons[species];
  }

  formatLastSeen(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Meno di un\'ora fa';
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;

    return d.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long'
    });
  }

  getStatusLabel(status: LostPet['status']): string {
    const labels: Record<LostPet['status'], string> = {
      lost: 'Smarrito',
      found: 'Ritrovato',
      searching: 'In ricerca'
    };
    return labels[status];
  }
}

// Mock data as fallback
const MOCK_DATA: LostPet[] = [
      {
        id: 'lost_1',
        name: 'Luna',
        species: 'dog',
        breed: 'Golden Retriever',
        color: 'Dorato',
        size: 'large',
        imageUrl: 'assets/images/pets/placeholder-dog.png',
        lastSeenDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        lastSeenLocation: 'Parco Sempione, Milano',
        description: 'Luna è un Golden Retriever femmina di 4 anni. Ha un collare rosso con medaglietta. È molto socievole.',
        ownerName: 'Marco B.',
        ownerPhone: '+39 333 1234567',
        status: 'lost',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
      },
      {
        id: 'lost_2',
        name: 'Micio',
        species: 'cat',
        breed: 'Europeo',
        color: 'Grigio tigrato',
        size: 'medium',
        imageUrl: 'assets/images/pets/placeholder-cat.png',
        lastSeenDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        lastSeenLocation: 'Via Roma 45, Torino',
        description: 'Gatto maschio sterilizzato, molto timido. Ha una macchia bianca sul petto.',
        ownerName: 'Giulia R.',
        ownerPhone: '+39 347 9876543',
        status: 'lost',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      },
      {
        id: 'lost_3',
        name: 'Rocky',
        species: 'dog',
        breed: 'Bulldog Francese',
        color: 'Bianco e nero',
        size: 'small',
        imageUrl: 'assets/images/pets/placeholder-dog.png',
        lastSeenDate: new Date(Date.now() - 1000 * 60 * 60 * 5),
        lastSeenLocation: 'Centro commerciale Fiumara, Genova',
        description: 'Bulldog francese maschio di 2 anni. Indossa un cappottino blu.',
        ownerName: 'Andrea M.',
        ownerPhone: '+39 339 5551234',
        status: 'searching',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
      },
      {
        id: 'lost_4',
        name: 'Coco',
        species: 'bird',
        breed: 'Pappagallo Inseparabile',
        color: 'Verde e giallo',
        size: 'small',
        imageUrl: 'assets/images/pets/placeholder-bird.png',
        lastSeenDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
        lastSeenLocation: 'Quartiere San Salvario, Torino',
        description: 'Piccolo pappagallo inseparabile. Risponde al nome e sa dire "ciao".',
        ownerName: 'Sara P.',
        ownerPhone: '+39 320 7778899',
        status: 'lost',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
      }
    ];
