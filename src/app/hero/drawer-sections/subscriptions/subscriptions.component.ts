import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { SubscriptionsService, SubscriptionPlan, UserSubscription } from '../../../core/services/subscriptions.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionsComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly subscriptionsService = inject(SubscriptionsService);

  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly currentSubscription = signal<UserSubscription | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly billingCycle = signal<'monthly' | 'yearly'>('monthly');
  readonly isSubscribing = signal(false);
  readonly subscribingPlanId = signal<string | null>(null);

  readonly isYearly = computed(() => this.billingCycle() === 'yearly');


  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.subscriptionsService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loadCurrentSubscription();
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  private loadCurrentSubscription(): void {
    this.subscriptionsService.getCurrentSubscription().subscribe({
      next: (sub) => {
        this.currentSubscription.set(sub);
        this.billingCycle.set(sub.billingCycle);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  toggleBillingCycle(): void {
    this.billingCycle.update(cycle =>
      cycle === 'monthly' ? 'yearly' : 'monthly'
    );
  }

  getPrice(plan: SubscriptionPlan): string {
    const price = this.isYearly() ? plan.yearlyPrice : plan.monthlyPrice;
    return this.subscriptionsService.formatPrice(price);
  }

  getPeriod(): string {
    return this.isYearly() ? '/anno' : '/mese';
  }

  getPlanGradient(tier: SubscriptionPlan['tier']): string {
    return this.subscriptionsService.getPlanGradient(tier);
  }

  isCurrentPlan(planId: string): boolean {
    return this.currentSubscription()?.planId === planId;
  }

  subscribe(plan: SubscriptionPlan): void {
    if (this.isCurrentPlan(plan.id) || plan.monthlyPrice === 0) return;

    this.isSubscribing.set(true);
    this.subscribingPlanId.set(plan.id);

    this.subscriptionsService.subscribe(plan.id, this.billingCycle()).subscribe({
      next: () => {
        this.currentSubscription.update(sub => ({
          ...sub!,
          planId: plan.id,
          billingCycle: this.billingCycle()
        }));
        this.isSubscribing.set(false);
        this.subscribingPlanId.set(null);
      },
      error: () => {
        this.isSubscribing.set(false);
        this.subscribingPlanId.set(null);
      }
    });
  }

  getButtonText(plan: SubscriptionPlan): string {
    if (this.isCurrentPlan(plan.id)) return 'Piano attuale';
    if (plan.monthlyPrice === 0) return 'Piano attuale';
    return 'Abbonati';
  }
}
