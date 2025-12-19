export type SearchCategory = 'all' | 'pets' | 'users' | 'places' | 'breeds' | 'events';

export interface SearchResult {
  id: string;
  type: SearchCategory;
  title: string;
  subtitle: string;
  imageUrl?: string;
  route: string;
}

export interface CategoryFilter {
  id: SearchCategory;
  labelKey: string;
  icon: string;
}

export const SEARCH_CATEGORIES: CategoryFilter[] = [
  { id: 'all', labelKey: 'search.categories.all', icon: 'search' },
  { id: 'pets', labelKey: 'search.categories.pets', icon: 'pets' },
  { id: 'users', labelKey: 'search.categories.users', icon: 'group' },
  { id: 'places', labelKey: 'search.categories.places', icon: 'place' },
  { id: 'breeds', labelKey: 'search.categories.breeds', icon: 'pets' },
  { id: 'events', labelKey: 'search.categories.events', icon: 'event' },
];
