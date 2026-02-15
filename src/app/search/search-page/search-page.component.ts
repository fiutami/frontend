import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { SearchService } from '../services/search.service';
import {
  SearchCategory,
  SearchResult,
  SearchResponse,
  SEARCH_CATEGORIES,
  CategoryFilter,
} from '../models/search.models';
import { AiSearchService } from '../../core/services/ai-search.service';
import { VoiceInputButtonComponent } from '../../shared/components/voice-input-button/voice-input-button.component';
import { AiMessageBubbleComponent } from '../../shared/components/ai-message-bubble/ai-message-bubble.component';
import { TabPageShellDefaultComponent } from '../../shared/components/tab-page-shell-default/tab-page-shell-default.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, VoiceInputButtonComponent, AiMessageBubbleComponent, TabPageShellDefaultComponent],
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPageComponent implements OnInit, OnDestroy {
  /** Search query */
  protected query = signal<string>('');

  /** Active category filter */
  protected activeCategory = signal<SearchCategory>('all');

  /** Recent searches from localStorage */
  protected recentSearches = signal<string[]>([]);

  /** Search results from API */
  protected results = signal<SearchResult[]>([]);

  /** Total result count from API */
  protected totalCount = signal<number>(0);

  /** Loading state */
  protected loading = signal<boolean>(false);

  /** Has performed a search */
  protected searched = signal<boolean>(false);

  /** Available categories */
  protected readonly categories: CategoryFilter[] = SEARCH_CATEGORIES;

  /** Suggestions */
  protected readonly suggestions = [
    'Golden Retriever',
    'Veterinario',
    'Parchi dog-friendly',
    'Toelettatura',
  ];

  /** Show suggestions (when no query and not searched) */
  protected showSuggestions = computed(() => !this.query().trim() && !this.searched());

  /** Result count for display */
  protected resultCount = computed(() => this.totalCount());

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  /** AI search mode */
  protected aiMode = signal(false);
  protected aiSummary = signal('');
  protected aiLoading = signal(false);

  private aiSearchService = inject(AiSearchService);

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recentSearches.set(this.searchService.getRecentSearches());

    // Debounce search with API call
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.trim()) {
        if (this.aiMode()) {
          this.performAiSearch(query);
        } else {
          this.performSearch(query);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle search input change
   */
  onQueryChange(value: string): void {
    this.query.set(value);

    if (!value.trim()) {
      this.results.set([]);
      this.totalCount.set(0);
      this.searched.set(false);
      return;
    }

    this.searchSubject$.next(value);
  }

  /**
   * Perform search via API
   */
  private performSearch(query: string): void {
    this.loading.set(true);
    this.searched.set(true);

    this.searchService.search(query, this.activeCategory())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: SearchResponse) => {
          this.results.set(response.results);
          this.totalCount.set(response.totalCount);
          this.loading.set(false);
          this.searchService.saveRecentSearch(query);
          this.recentSearches.set(this.searchService.getRecentSearches());
        },
        error: () => {
          this.loading.set(false);
          this.results.set([]);
          this.totalCount.set(0);
        }
      });
  }

  /**
   * Clear search input
   */
  onClearSearch(): void {
    this.query.set('');
    this.results.set([]);
    this.totalCount.set(0);
    this.searched.set(false);
  }

  /**
   * Set active category filter and re-search
   */
  onCategorySelect(category: SearchCategory): void {
    this.activeCategory.set(category);
    if (this.query().trim()) {
      this.performSearch(this.query());
    }
  }

  /**
   * Handle suggestion click
   */
  onSuggestionClick(suggestion: string): void {
    this.query.set(suggestion);
    this.performSearch(suggestion);
  }

  /**
   * Handle recent search click
   */
  onRecentSearchClick(search: string): void {
    this.query.set(search);
    this.performSearch(search);
  }

  /**
   * Remove a recent search
   */
  onRemoveRecentSearch(search: string, event: Event): void {
    event.stopPropagation();
    const updated = this.searchService.removeRecentSearch(search);
    this.recentSearches.set(updated);
  }

  /**
   * Navigate to result
   */
  onResultClick(result: SearchResult): void {
    this.searchService.saveRecentSearch(this.query());
    this.router.navigateByUrl(result.route);
  }

  /**
   * Toggle AI search mode
   */
  toggleAiMode(): void {
    this.aiMode.update(v => !v);
    this.aiSummary.set('');
  }

  /**
   * Handle voice transcript
   */
  onVoiceTranscript(text: string): void {
    this.query.set(text);
    if (this.aiMode()) {
      this.performAiSearch(text);
    } else {
      this.performSearch(text);
    }
  }

  /**
   * Perform AI-assisted search
   */
  private async performAiSearch(query: string): Promise<void> {
    this.aiLoading.set(true);
    this.searched.set(true);

    try {
      const interpretation = await this.aiSearchService.processNaturalQuery(query);
      this.aiSummary.set(interpretation.summary ?? '');

      // Also run normal search
      this.performSearch(query);
    } catch {
      this.aiSummary.set('');
    } finally {
      this.aiLoading.set(false);
    }
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
}
