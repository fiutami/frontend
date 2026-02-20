import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SubscriptionsService, SubscriptionPlan, UserSubscription } from '../../../core/services/subscriptions.service';

// Shell Blue (sfondo blu solido, include: Avatar, Logo, MascotPeek, BottomTabBar)
import { TabPageShellBlueComponent } from '../../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TabPageShellBlueComponent,
  ],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionsComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly subscriptionsService = inject(SubscriptionsService);
  private readonly translate = inject(TranslateService);

  /** Translated page title */
  protected pageTitle = this.translate.instant('drawerSubscriptions.title');

  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly currentSubscription = signal<UserSubscription | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly billingCycle = signal<'monthly' | 'yearly'>('monthly');
  readonly isSubscribing = signal(false);
  readonly subscribingPlanId = signal<string | null>(null);

  readonly isYearly = computed(() => this.billingCycle() === 'yearly');

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.pageTitle = this.translate.instant('drawerSubscriptions.title');
    });
  }

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

  getPeriodKey(): string {
    return this.isYearly() ? 'drawerSubscriptions.perYear' : 'drawerSubscriptions.perMonth';
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

  getButtonTextKey(plan: SubscriptionPlan): string {
    if (this.isCurrentPlan(plan.id)) return 'drawerSubscriptions.currentPlan';
    if (plan.monthlyPrice === 0) return 'drawerSubscriptions.currentPlan';
    return 'drawerSubscriptions.subscribe';
  }
}
