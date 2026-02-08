export interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  savings?: string;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired';
  startedAt: Date;
  expiresAt?: Date;
}

// Alias for backward compatibility
export type PremiumPlan = Plan;
export type UserSubscription = Subscription;
