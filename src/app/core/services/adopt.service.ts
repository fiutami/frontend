import { Injectable } from '@angular/core';
import { Observable, of, delay, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type PetType = 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';
export type AdoptionStatus = 'available' | 'pending' | 'adopted';

export interface AdoptionAd {
  id: string;
  petName: string;
  petType: PetType;
  breed: string;
  age: string;
  gender: 'male' | 'female';
  description: string;
  location: string;
  distance?: string;
  imageUrl?: string;
  status: AdoptionStatus;
  publishedAt: Date;
  shelterName?: string;
  contactPhone?: string;
  isUrgent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdoptService {
  private readonly apiUrl = `${environment.apiUrl}/adoption`;

  constructor(private http: HttpClient) {}

  getAdoptionAds(): Observable<AdoptionAd[]> {
    return this.http.get<AdoptionAd[]>(this.apiUrl).pipe(
      catchError(err => {
        console.warn('API failed, using fallback:', err);
        return of(MOCK_DATA);
      })
    );
  }

  getAdoptionAdById(id: string): Observable<AdoptionAd | null> {
    return this.http.get<AdoptionAd>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.warn('API failed, using fallback:', err);
        const ad = MOCK_DATA.find(a => a.id === id) || null;
        return of(ad);
      })
    );
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

    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;

    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

// Mock data as fallback
const MOCK_DATA: AdoptionAd[] = [
      {
        id: 'adopt_1',
        petName: 'Luna',
        petType: 'dog',
        breed: 'Labrador',
        age: '2 anni',
        gender: 'female',
        description: 'Luna è una dolcissima labrador che cerca una famiglia amorevole. È sterilizzata e vaccinata.',
        location: 'Milano, MI',
        distance: '3.2 km',
        status: 'available',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 ore fa
        shelterName: 'Canile Municipale Milano',
        isUrgent: true
      },
      {
        id: 'adopt_2',
        petName: 'Micio',
        petType: 'cat',
        breed: 'Europeo',
        age: '6 mesi',
        gender: 'male',
        description: 'Gattino vivace e giocherellone, cerca casa con giardino o terrazzo protetto.',
        location: 'Roma, RM',
        distance: '5.8 km',
        status: 'available',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 giorno fa
        shelterName: 'Gattile Roma Est'
      },
      {
        id: 'adopt_3',
        petName: 'Rocky',
        petType: 'dog',
        breed: 'Pastore Tedesco Mix',
        age: '4 anni',
        gender: 'male',
        description: 'Rocky è un cane equilibrato, ottimo per famiglie con bambini. Addestrato e socievole.',
        location: 'Torino, TO',
        distance: '12 km',
        status: 'available',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 giorni fa
        shelterName: 'Rifugio Amici a 4 Zampe'
      },
      {
        id: 'adopt_4',
        petName: 'Pallina',
        petType: 'rabbit',
        breed: 'Ariete Nano',
        age: '1 anno',
        gender: 'female',
        description: 'Coniglietta affettuosa, abituata alla vita domestica. Ideale per appartamento.',
        location: 'Bologna, BO',
        distance: '8.5 km',
        status: 'available',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 giorni fa
        shelterName: 'Associazione Conigli e Co.'
      },
      {
        id: 'adopt_5',
        petName: 'Birba',
        petType: 'cat',
        breed: 'Siamese Mix',
        age: '3 anni',
        gender: 'female',
        description: 'Gatta elegante e indipendente. Cerca una casa tranquilla, preferibilmente senza altri animali.',
        location: 'Firenze, FI',
        distance: '15 km',
        status: 'pending',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 giorni fa
        shelterName: 'Oasi Felina Firenze'
      }
    ];
