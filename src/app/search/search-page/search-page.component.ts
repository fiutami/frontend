import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  SearchCategory,
  SearchResult,
  SEARCH_CATEGORIES,
  CategoryFilter,
} from '../models/search.models';

const RECENT_SEARCHES_KEY = 'fiutami_recent_searches';
const MAX_RECENT_SEARCHES = 5;

/**
 * SearchPageComponent - Global search with filters and categories
 *
 * Features:
 * - Yellow header with search input
 * - Category filter pills (horizontal scroll)
 * - Suggestions and recent searches when input empty
 * - Results list when searching
 * - Empty state when no results
 */
@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPageComponent implements OnInit {
  /** Search query */
  protected query = signal<string>('');

  /** Active category filter */
  protected activeCategory = signal<SearchCategory>('all');

  /** Recent searches from localStorage */
  protected recentSearches = signal<string[]>([]);

  /** Available categories */
  protected readonly categories: CategoryFilter[] = SEARCH_CATEGORIES;

  /** Suggestions */
  protected readonly suggestions = [
    'Golden Retriever',
    'Veterinario Roma',
    'Parchi dog-friendly',
  ];

  /** Mock results data */
  private readonly mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'pets',
      title: 'Luna',
      subtitle: 'Golden Retriever - Roma',
      imageUrl: 'assets/images/pets/default-dog.png',
      route: '/profile/pet/1',
    },
    {
      id: '2',
      type: 'breeds',
      title: 'Golden Retriever',
      subtitle: 'Cane - Molto popolare',
      imageUrl: 'assets/images/breeds/golden-retriever.png',
      route: '/breeds/golden-retriever',
    },
    {
      id: '3',
      type: 'places',
      title: 'Parco Villa Borghese',
      subtitle: 'Area cani - Roma',
      imageUrl: 'assets/images/places/park.png',
      route: '/map?poi=1',
    },
    {
      id: '4',
      type: 'users',
      title: 'Maria Rossi',
      subtitle: '2 pet - Roma',
      imageUrl: 'assets/images/users/default-avatar.png',
      route: '/user/profile/1',
    },
    {
      id: '5',
      type: 'events',
      title: 'Dog Day Roma',
      subtitle: '25 Dic - Parco Centrale',
      imageUrl: 'assets/images/events/default-event.png',
      route: '/calendar?event=1',
    },
  ];

  /** Filtered results based on query and category */
  protected results = computed<SearchResult[]>(() => {
    const q = this.query().toLowerCase().trim();
    const category = this.activeCategory();

    if (!q) {
      return [];
    }

    return this.mockResults.filter((result) => {
      const matchesQuery =
        result.title.toLowerCase().includes(q) ||
        result.subtitle.toLowerCase().includes(q);
      const matchesCategory = category === 'all' || result.type === category;
      return matchesQuery && matchesCategory;
    });
  });

  /** Result count */
  protected resultCount = computed(() => this.results().length);

  /** Show suggestions (when no query) */
  protected showSuggestions = computed(() => !this.query().trim());

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadRecentSearches();
  }

  /**
   * Handle search input change
   */
  onQueryChange(value: string): void {
    this.query.set(value);
  }

  /**
   * Clear search input
   */
  onClearSearch(): void {
    this.query.set('');
  }

  /**
   * Set active category filter
   */
  onCategorySelect(category: SearchCategory): void {
    this.activeCategory.set(category);
  }

  /**
   * Handle suggestion click
   */
  onSuggestionClick(suggestion: string): void {
    this.query.set(suggestion);
    this.saveRecentSearch(suggestion);
  }

  /**
   * Handle recent search click
   */
  onRecentSearchClick(search: string): void {
    this.query.set(search);
  }

  /**
   * Remove a recent search
   */
  onRemoveRecentSearch(search: string, event: Event): void {
    event.stopPropagation();
    const updated = this.recentSearches().filter((s) => s !== search);
    this.recentSearches.set(updated);
    this.saveRecentSearchesToStorage(updated);
  }

  /**
   * Navigate to result
   */
  onResultClick(result: SearchResult): void {
    this.saveRecentSearch(this.query());
    this.router.navigateByUrl(result.route);
  }

  /**
   * Navigate back
   */
  onBack(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Get badge color class for result type
   */
  getBadgeClass(type: SearchCategory): string {
    const classes: Record<SearchCategory, string> = {
      all: 'badge--all',
      pets: 'badge--pets',
      users: 'badge--users',
      places: 'badge--places',
      breeds: 'badge--breeds',
      events: 'badge--events',
    };
    return classes[type] || 'badge--all';
  }

  /**
   * Get icon for result type
   */
  getTypeIcon(type: SearchCategory): string {
    const icons: Record<SearchCategory, string> = {
      all: 'search',
      pets: 'pets',
      users: 'person',
      places: 'place',
      breeds: 'category',
      events: 'event',
    };
    return icons[type] || 'search';
  }

  /**
   * TrackBy function for results
   */
  trackByResultId(_index: number, result: SearchResult): string {
    return result.id;
  }

  /**
   * TrackBy function for categories
   */
  trackByCategoryId(_index: number, category: CategoryFilter): string {
    return category.id;
  }

  /**
   * Load recent searches from localStorage
   */
  private loadRecentSearches(): void {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        this.recentSearches.set(JSON.parse(stored));
      }
    } catch {
      this.recentSearches.set([]);
    }
  }

  /**
   * Save a search to recent searches
   */
  private saveRecentSearch(search: string): void {
    if (!search.trim()) return;

    const current = this.recentSearches();
    const filtered = current.filter((s) => s !== search);
    const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    this.recentSearches.set(updated);
    this.saveRecentSearchesToStorage(updated);
  }

  /**
   * Save recent searches to localStorage
   */
  private saveRecentSearchesToStorage(searches: string[]): void {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch {
      // Ignore storage errors
    }
  }
}
