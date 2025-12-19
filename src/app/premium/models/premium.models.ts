export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  savings?: string;
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  expiresAt: Date;
}
