import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plan, Subscription } from '../models/premium.models';

@Injectable({
  providedIn: 'root'
})
export class PremiumService {
  private apiUrl = `${environment.apiUrl}/premium`;

  constructor(private http: HttpClient) {}

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/plans`).pipe(
      catchError(() => of(this.getMockPlans()))
    );
  }

  getSubscription(): Observable<Subscription | null> {
    return this.http.get<Subscription>(`${this.apiUrl}/subscription`).pipe(
      catchError(() => of(null))
    );
  }

  subscribe(planId: string): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/subscribe`, { planId });
  }

  cancelSubscription(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cancel`, {});
  }

  private getMockPlans(): Plan[] {
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'month',
        features: ['1 pet', 'Profilo base', 'Mappa POI']
      },
      {
        id: 'premium-monthly',
        name: 'Premium',
        price: 4.99,
        period: 'month',
        features: [
          '3 pet',
          'Profilo completo',
          'Chat illimitata',
          'Galleria illimitata',
          'Statistiche avanzate',
          'Nessuna pubblicità'
        ],
        isPopular: true
      },
      {
        id: 'premium-yearly',
        name: 'Premium Annuale',
        price: 39.99,
        period: 'year',
        features: [
          '3 pet',
          'Profilo completo',
          'Chat illimitata',
          'Galleria illimitata',
          'Statistiche avanzate',
          'Nessuna pubblicità'
        ],
        savings: 'Risparmia 33%'
      },
      {
        id: 'pro',
        name: 'PRO',
        price: 9.99,
        period: 'month',
        features: [
          'Pet illimitati',
          'Tutte le features Premium',
          'Badge verificato',
          'Supporto prioritario',
          'Accesso anticipato'
        ]
      }
    ];
  }
}
