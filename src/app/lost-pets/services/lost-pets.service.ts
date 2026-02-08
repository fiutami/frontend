import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LostPet,
  LostPetSighting,
  CreateLostPetRequest,
  CreateSightingRequest
} from '../models/lost-pets.models';

@Injectable({
  providedIn: 'root'
})
export class LostPetsModuleService {
  private apiUrl = `${environment.apiUrl}/lost-pets`;

  constructor(private http: HttpClient) {}

  search(params: { species?: string; lat?: number; lng?: number; radiusKm?: number }): Observable<{ items: LostPet[] }> {
    let httpParams = new HttpParams();
    if (params.species) httpParams = httpParams.set('species', params.species);
    if (params.lat) httpParams = httpParams.set('lat', params.lat.toString());
    if (params.lng) httpParams = httpParams.set('lng', params.lng.toString());
    if (params.radiusKm) httpParams = httpParams.set('radiusKm', params.radiusKm.toString());

    return this.http.get<{ items: LostPet[] }>(this.apiUrl, { params: httpParams }).pipe(
      catchError(() => of({ items: MOCK_LOST_PETS }))
    );
  }

  getById(id: string): Observable<LostPet> {
    return this.http.get<LostPet>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const pet = MOCK_LOST_PETS.find(p => p.id === id);
        if (pet) {
          return of(pet);
        }
        throw new Error('Pet not found');
      })
    );
  }

  getMyReports(): Observable<{ items: LostPet[] }> {
    return this.http.get<{ items: LostPet[] }>(`${this.apiUrl}/mine`).pipe(
      catchError(() => of({ items: [] }))
    );
  }

  create(request: CreateLostPetRequest): Observable<LostPet> {
    return this.http.post<LostPet>(this.apiUrl, request);
  }

  update(id: string, request: Partial<CreateLostPetRequest>): Observable<LostPet> {
    return this.http.put<LostPet>(`${this.apiUrl}/${id}`, request);
  }

  markFound(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/found`, {});
  }

  close(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/close`, {});
  }

  getSightings(lostPetId: string): Observable<{ items: LostPetSighting[] }> {
    return this.http.get<{ items: LostPetSighting[] }>(`${this.apiUrl}/${lostPetId}/sightings`).pipe(
      catchError(() => of({ items: MOCK_SIGHTINGS.filter(s => s.lostPetId === lostPetId) }))
    );
  }

  createSighting(lostPetId: string, request: CreateSightingRequest): Observable<LostPetSighting> {
    return this.http.post<LostPetSighting>(`${this.apiUrl}/${lostPetId}/sightings`, request);
  }

  verifySighting(lostPetId: string, sightingId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${lostPetId}/sightings/${sightingId}/verify`, {});
  }

  formatLastSeen(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Meno di un\'ora fa';
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;

    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long'
    });
  }
}

// Mock data for fallback
const MOCK_LOST_PETS: LostPet[] = [
  {
    id: 'lost_1',
    petId: 'pet_1',
    petName: 'Tod',
    petSpecies: 'dog',
    petBreed: 'Golden Retriever',
    petColor: 'Dorato',
    petPhotoUrl: 'assets/images/pets/placeholder-dog.png',
    description: 'Golden Retriever maschio di 4 anni. Ha un collare rosso con medaglietta. Molto socievole.',
    lastSeenLocation: 'Parco Sempione, Milano',
    lastSeenCity: 'Bergamo',
    lastSeenDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    contactPhone: '+39 333 1234567',
    status: 'lost',
    ownerUserId: 'user_1',
    ownerName: 'Cinzia',
    sightingsCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
  },
  {
    id: 'lost_2',
    petId: 'pet_2',
    petName: 'Micio',
    petSpecies: 'cat',
    petBreed: 'Europeo',
    petColor: 'Grigio tigrato',
    petPhotoUrl: 'assets/images/pets/placeholder-cat.png',
    description: 'Gatto maschio sterilizzato, molto timido. Ha una macchia bianca sul petto.',
    lastSeenLocation: 'Via Roma 45, Torino',
    lastSeenCity: 'Torino',
    lastSeenDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    contactPhone: '+39 347 9876543',
    status: 'lost',
    ownerUserId: 'user_2',
    ownerName: 'Giulia',
    sightingsCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: 'lost_3',
    petId: 'pet_3',
    petName: 'Rocky',
    petSpecies: 'dog',
    petBreed: 'Bulldog Francese',
    petColor: 'Bianco e nero',
    petPhotoUrl: 'assets/images/pets/placeholder-dog.png',
    description: 'Bulldog francese maschio di 2 anni. Indossa un cappottino blu.',
    lastSeenLocation: 'Centro commerciale Fiumara, Genova',
    lastSeenCity: 'Genova',
    lastSeenDate: new Date(Date.now() - 1000 * 60 * 60 * 5),
    contactPhone: '+39 339 5551234',
    reward: 500,
    status: 'lost',
    ownerUserId: 'user_3',
    ownerName: 'Andrea',
    sightingsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
  }
];

const MOCK_SIGHTINGS: LostPetSighting[] = [
  {
    id: 'sight_1',
    lostPetId: 'lost_1',
    reporterUserId: 'user_4',
    reporterName: 'Mario',
    location: 'Parco Lambro, Milano',
    description: 'Ho visto un cane simile vicino alla fontana',
    sightingDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
    isVerified: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
  }
];
