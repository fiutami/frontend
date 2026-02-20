export interface CmsPage {
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  locale: string;
  lastUpdated: string;
}

export interface CmsFaq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
}

export interface FeatureFlag {
  name: string;
  isEnabled: boolean;
}

export interface AppConfig {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  minAppVersion?: string;
}

export interface CmsSection {
  id: string;
  title: string;
  content: string;
  bullets?: string[];
}
