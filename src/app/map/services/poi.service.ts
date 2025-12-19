import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { POI, POIFilter, POIType } from '../../core/models/poi.models';

@Injectable({
  providedIn: 'root'
})
export class POIService {
  private readonly mockPOIs: POI[] = [
    // Veterinari
    {
      id: '1',
      name: 'Clinica Veterinaria Roma',
      type: 'vet',
      lat: 41.9028,
      lng: 12.4964,
      address: 'Via Roma 1, Roma',
      rating: 4.5,
      reviewCount: 128,
      phone: '+39 06 1234567',
      openingHours: 'Lun-Ven 9:00-18:00'
    },
    {
      id: '2',
      name: 'Ambulatorio Veterinario Amici',
      type: 'vet',
      lat: 41.9145,
      lng: 12.4892,
      address: 'Via Nazionale 45, Roma',
      rating: 4.8,
      reviewCount: 256,
      phone: '+39 06 7654321',
      openingHours: 'Lun-Sab 8:00-20:00'
    },
    // Parchi
    {
      id: '3',
      name: 'Dog Park Centrale',
      type: 'park',
      lat: 41.9055,
      lng: 12.4823,
      address: 'Parco Centrale, Roma',
      rating: 4.8,
      reviewCount: 312
    },
    {
      id: '4',
      name: 'Area Cani Villa Borghese',
      type: 'park',
      lat: 41.9137,
      lng: 12.4856,
      address: 'Villa Borghese, Roma',
      rating: 4.6,
      reviewCount: 445
    },
    {
      id: '5',
      name: 'Parco degli Acquedotti',
      type: 'park',
      lat: 41.8545,
      lng: 12.5512,
      address: 'Via Lemonia, Roma',
      rating: 4.7,
      reviewCount: 189
    },
    // Toelettature
    {
      id: '6',
      name: 'Toelettatura Fido',
      type: 'groomer',
      lat: 41.8992,
      lng: 12.5001,
      address: 'Via Napoli 15, Roma',
      rating: 4.2,
      reviewCount: 87
    },
    {
      id: '7',
      name: 'Salone Zampe Felici',
      type: 'groomer',
      lat: 41.9078,
      lng: 12.5123,
      address: 'Via Tuscolana 234, Roma',
      rating: 4.5,
      reviewCount: 156
    },
    // Negozi
    {
      id: '8',
      name: 'Pet Shop Roma',
      type: 'shop',
      lat: 41.9012,
      lng: 12.4756,
      address: 'Via Cola di Rienzo 89, Roma',
      rating: 4.3,
      reviewCount: 234
    },
    {
      id: '9',
      name: 'Arcaplanet Termini',
      type: 'shop',
      lat: 41.9009,
      lng: 12.5018,
      address: 'Stazione Termini, Roma',
      rating: 4.1,
      reviewCount: 412
    },
    // Ristoranti
    {
      id: '10',
      name: 'Trattoria Pet Friendly',
      type: 'restaurant',
      lat: 41.8956,
      lng: 12.4789,
      address: 'Trastevere, Roma',
      rating: 4.4,
      reviewCount: 178
    },
    {
      id: '11',
      name: 'Bar Bau',
      type: 'restaurant',
      lat: 41.9101,
      lng: 12.4678,
      address: 'Via del Corso 45, Roma',
      rating: 4.6,
      reviewCount: 267
    },
    // Hotel
    {
      id: '12',
      name: 'Hotel Pet Paradise',
      type: 'hotel',
      lat: 41.9189,
      lng: 12.5034,
      address: 'Via Veneto 78, Roma',
      rating: 4.7,
      reviewCount: 89
    },
    {
      id: '13',
      name: 'B&B Zampe al Sole',
      type: 'hotel',
      lat: 41.8876,
      lng: 12.4923,
      address: 'Via Ostiense 156, Roma',
      rating: 4.3,
      reviewCount: 56
    },
    // Spiagge
    {
      id: '14',
      name: 'Bau Beach Ostia',
      type: 'beach',
      lat: 41.7284,
      lng: 12.2892,
      address: 'Lido di Ostia, Roma',
      rating: 4.5,
      reviewCount: 345
    },
    {
      id: '15',
      name: 'Spiaggia Libera Cani',
      type: 'beach',
      lat: 41.7312,
      lng: 12.2756,
      address: 'Fiumicino, Roma',
      rating: 4.2,
      reviewCount: 123
    }
  ];

  getDefaultFilters(): POIFilter[] {
    return [
      { type: 'shop', label: 'Negozio', icon: 'storefront', color: '#F4AE1A', active: true },
      { type: 'vet', label: 'Veterinario', icon: 'local_hospital', color: '#FF6B6B', active: true },
      { type: 'beach', label: 'Spiagge', icon: 'beach_access', color: '#60A5FA', active: true },
      { type: 'park', label: 'Parchi', icon: 'park', color: '#95E1A3', active: true },
      { type: 'groomer', label: 'Toelettatura', icon: 'content_cut', color: '#4ECDC4', active: true },
      { type: 'restaurant', label: 'Ristoranti', icon: 'restaurant', color: '#A78BFA', active: true },
      { type: 'hotel', label: 'Hotel', icon: 'hotel', color: '#60A5FA', active: true }
    ];
  }

  getPOIs(activeFilters: POIType[]): Observable<POI[]> {
    const filtered = this.mockPOIs.filter(poi => activeFilters.includes(poi.type));
    return of(filtered).pipe(delay(100)); // Simula latenza API
  }

  getPOIById(id: string): Observable<POI | undefined> {
    const poi = this.mockPOIs.find(p => p.id === id);
    return of(poi).pipe(delay(50));
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Raggio della Terra in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  toggleFavorite(poiId: string): Observable<boolean> {
    const poi = this.mockPOIs.find(p => p.id === poiId);
    if (poi) {
      poi.isFavorite = !poi.isFavorite;
      return of(poi.isFavorite);
    }
    return of(false);
  }
}
