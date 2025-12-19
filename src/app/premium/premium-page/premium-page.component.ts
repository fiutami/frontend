import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PremiumPlan, UserSubscription } from '../models/premium.models';

@Component({
  selector: 'app-premium-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './premium-page.component.html',
  styleUrl: './premium-page.component.scss'
})
export class PremiumPageComponent {
  plans: PremiumPlan[] = [
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

  // Mock current subscription - in production this would come from a service
  currentPlan = signal<string>('free');
  userSubscription = signal<UserSubscription | null>(null);

  // Features not included in Free plan
  private excludedFreeFeatures = [
    'Chat illimitata',
    'Galleria illimitata',
    'Statistiche avanzate'
  ];

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/home']);
  }

  isCurrentPlan(planId: string): boolean {
    return this.currentPlan() === planId;
  }

  isFeatureIncluded(plan: PremiumPlan, feature: string): boolean {
    if (plan.id === 'free') {
      return !this.excludedFreeFeatures.includes(feature);
    }
    return true;
  }

  getExcludedFeatures(plan: PremiumPlan): string[] {
    if (plan.id === 'free') {
      return this.excludedFreeFeatures;
    }
    return [];
  }

  getAllFeatures(plan: PremiumPlan): { name: string; included: boolean }[] {
    if (plan.id === 'free') {
      return [
        ...plan.features.map(f => ({ name: f, included: true })),
        ...this.excludedFreeFeatures.map(f => ({ name: f, included: false }))
      ];
    }
    return plan.features.map(f => ({ name: f, included: true }));
  }

  selectPlan(plan: PremiumPlan): void {
    if (this.isCurrentPlan(plan.id)) {
      return;
    }
    // TODO: Navigate to payment flow or show confirmation modal
    console.log('Selected plan:', plan);
  }

  formatPrice(plan: PremiumPlan): string {
    if (plan.price === 0) {
      return 'Gratis';
    }
    return `€${plan.price.toFixed(2)}`;
  }

  getPeriodLabel(plan: PremiumPlan): string {
    if (plan.price === 0) {
      return '';
    }
    return plan.period === 'month' ? '/mese' : '/anno';
  }

  getButtonLabel(plan: PremiumPlan): string {
    if (this.isCurrentPlan(plan.id)) {
      return 'Piano attuale';
    }
    if (plan.id === 'pro') {
      return 'Passa a PRO';
    }
    return 'Abbonati ora';
  }
}
