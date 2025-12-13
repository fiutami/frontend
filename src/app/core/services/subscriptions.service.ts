import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface SubscriptionFeature {
  text: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'premium' | 'pro';
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  features: SubscriptionFeature[];
  highlighted: boolean;
  badge?: string;
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  billingCycle: 'monthly' | 'yearly';
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {

  private plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      tier: 'free',
      description: 'Perfetto per iniziare',
      monthlyPrice: 0,
      yearlyPrice: 0,
      yearlyDiscount: 0,
      highlighted: false,
      features: [
        { text: '1 profilo pet', included: true },
        { text: 'Feed base', included: true },
        { text: 'Messaggi limitati (10/giorno)', included: true },
        { text: 'Mappa eventi locali', included: true },
        { text: 'Statistiche avanzate', included: false },
        { text: 'Badge esclusivi', included: false },
        { text: 'Supporto prioritario', included: false },
        { text: 'Profilo verificato', included: false }
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      tier: 'premium',
      description: 'Per i veri amanti degli animali',
      monthlyPrice: 4.99,
      yearlyPrice: 39.99,
      yearlyDiscount: 33,
      highlighted: true,
      badge: 'Più popolare',
      features: [
        { text: '5 profili pet', included: true },
        { text: 'Feed personalizzato AI', included: true },
        { text: 'Messaggi illimitati', included: true },
        { text: 'Eventi premium esclusivi', included: true },
        { text: 'Statistiche avanzate', included: true },
        { text: 'Badge esclusivi', included: true },
        { text: 'Supporto prioritario', included: false },
        { text: 'Profilo verificato', included: false }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      tier: 'pro',
      description: 'Per professionisti e allevatori',
      monthlyPrice: 9.99,
      yearlyPrice: 79.99,
      yearlyDiscount: 33,
      highlighted: false,
      features: [
        { text: 'Pet illimitati', included: true },
        { text: 'Feed personalizzato AI', included: true },
        { text: 'Messaggi illimitati', included: true },
        { text: 'Crea eventi pubblici', included: true },
        { text: 'Dashboard analytics', included: true },
        { text: 'Badge Pro esclusivo', included: true },
        { text: 'Supporto prioritario 24/7', included: true },
        { text: 'Profilo verificato', included: true }
      ]
    }
  ];

  private currentSubscription: UserSubscription = {
    planId: 'free',
    status: 'active',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    billingCycle: 'monthly'
  };

  getPlans(): Observable<SubscriptionPlan[]> {
    return of([...this.plans]).pipe(delay(400));
  }

  getCurrentSubscription(): Observable<UserSubscription> {
    return of({ ...this.currentSubscription }).pipe(delay(300));
  }

  subscribe(planId: string, billingCycle: 'monthly' | 'yearly'): Observable<boolean> {
    console.log('Subscribing to plan:', { planId, billingCycle });
    // Simula sottoscrizione
    this.currentSubscription = {
      planId,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      billingCycle
    };
    return of(true).pipe(delay(800));
  }

  cancelSubscription(): Observable<boolean> {
    console.log('Cancelling subscription');
    this.currentSubscription.status = 'cancelled';
    return of(true).pipe(delay(500));
  }

  formatPrice(price: number): string {
    if (price === 0) return 'Gratis';
    return `€${price.toFixed(2).replace('.', ',')}`;
  }

  getPlanColor(tier: SubscriptionPlan['tier']): string {
    const colors: Record<SubscriptionPlan['tier'], string> = {
      free: '#607D8B',
      premium: '#F5A623',
      pro: '#9C27B0'
    };
    return colors[tier];
  }

  getPlanGradient(tier: SubscriptionPlan['tier']): string {
    const gradients: Record<SubscriptionPlan['tier'], string> = {
      free: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
      premium: 'linear-gradient(135deg, #F5A623 0%, #F09819 100%)',
      pro: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
    };
    return gradients[tier];
  }
}
