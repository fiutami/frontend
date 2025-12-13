import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

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

  getLostPets(): Observable<LostPet[]> {
    const mockLostPets: LostPet[] = [
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

    return of(mockLostPets).pipe(delay(600));
  }

  reportSighting(petId: string, location: string, notes: string): Observable<boolean> {
    console.log('Sighting reported:', { petId, location, notes });
    return of(true).pipe(delay(300));
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

  formatLastSeen(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Meno di un\'ora fa';
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;

    return date.toLocaleDateString('it-IT', {
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
