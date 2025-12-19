import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Plan, Subscription } from '../models/premium.models';
import { PremiumService } from '../services/premium.service';

@Component({
  selector: 'app-premium-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './premium-page.component.html',
  styleUrl: './premium-page.component.scss'
})
export class PremiumPageComponent implements OnInit, OnDestroy {
  plans: Plan[] = [];
  loading = signal<boolean>(true);
  subscribing = signal<boolean>(false);
  error = signal<string>('');

  currentPlan = signal<string>('free');
  userSubscription = signal<Subscription | null>(null);

  private excludedFreeFeatures = [
    'Chat illimitata',
    'Galleria illimitata',
    'Statistiche avanzate'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private premiumService: PremiumService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      plans: this.premiumService.getPlans(),
      subscription: this.premiumService.getSubscription()
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ plans, subscription }) => {
          this.plans = plans;
          this.userSubscription.set(subscription);
          if (subscription) {
            this.currentPlan.set(subscription.planId);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Errore nel caricamento dei piani');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  isCurrentPlan(planId: string): boolean {
    return this.currentPlan() === planId;
  }

  isFeatureIncluded(plan: Plan, feature: string): boolean {
    if (plan.id === 'free') {
      return !this.excludedFreeFeatures.includes(feature);
    }
    return true;
  }

  getExcludedFeatures(plan: Plan): string[] {
    if (plan.id === 'free') {
      return this.excludedFreeFeatures;
    }
    return [];
  }

  getAllFeatures(plan: Plan): { name: string; included: boolean }[] {
    if (plan.id === 'free') {
      return [
        ...plan.features.map(f => ({ name: f, included: true })),
        ...this.excludedFreeFeatures.map(f => ({ name: f, included: false }))
      ];
    }
    return plan.features.map(f => ({ name: f, included: true }));
  }

  selectPlan(plan: Plan): void {
    if (this.isCurrentPlan(plan.id) || this.subscribing()) {
      return;
    }

    this.subscribing.set(true);
    this.error.set('');

    this.premiumService.subscribe(plan.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subscription) => {
          this.userSubscription.set(subscription);
          this.currentPlan.set(subscription.planId);
          this.subscribing.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.error || 'Errore durante l\'abbonamento');
          this.subscribing.set(false);
        }
      });
  }

  cancelSubscription(): void {
    const sub = this.userSubscription();
    if (!sub || sub.planId === 'free') return;

    if (!confirm('Sei sicuro di voler annullare l\'abbonamento?')) return;

    this.premiumService.cancelSubscription()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadData();
        },
        error: () => {
          this.error.set('Errore durante l\'annullamento');
        }
      });
  }

  formatPrice(plan: Plan): string {
    if (plan.price === 0) {
      return 'Gratis';
    }
    return `€${plan.price.toFixed(2)}`;
  }

  getPeriodLabel(plan: Plan): string {
    if (plan.price === 0) {
      return '';
    }
    return plan.period === 'month' ? '/mese' : '/anno';
  }

  getButtonLabel(plan: Plan): string {
    if (this.isCurrentPlan(plan.id)) {
      return 'Piano attuale';
    }
    if (plan.id === 'pro') {
      return 'Passa a PRO';
    }
    return 'Abbonati ora';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
