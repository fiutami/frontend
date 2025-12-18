import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { SearchBoxComponent } from '../../shared/components/search-box';
import { Breed, Species, MOCK_BREEDS } from '../breeds.models';

type FilterOption = 'Tutti' | Species;

/**
 * BreedsListComponent - Grid of pet breeds with filters
 *
 * Features:
 * - Search bar to filter by name
 * - Species filter tabs (Tutti, Cani, Gatti, Conigli, Uccelli)
 * - 2-column grid of breed cards
 * - Click to navigate to breed detail
 */
@Component({
  selector: 'app-breeds-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, SearchBoxComponent],
  templateUrl: './breeds-list.component.html',
  styleUrls: ['./breeds-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedsListComponent {
  /** All available breeds */
  private readonly allBreeds = MOCK_BREEDS;

  /** Filter options */
  protected readonly filterOptions: FilterOption[] = [
    'Tutti',
    'Cane',
    'Gatto',
    'Coniglio',
    'Uccello',
  ];

  /** Current search query */
  protected searchQuery = signal('');

  /** Current active filter */
  protected activeFilter = signal<FilterOption>('Tutti');

  /** Filtered breeds based on search and filter */
  protected filteredBreeds = computed(() => {
    let breeds = [...this.allBreeds];
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.activeFilter();

    // Apply species filter
    if (filter !== 'Tutti') {
      breeds = breeds.filter(b => b.species === filter);
    }

    // Apply search filter
    if (query) {
      breeds = breeds.filter(b =>
        b.name.toLowerCase().includes(query)
      );
    }

    // Sort by popularity
    return breeds.sort((a, b) => b.popularity - a.popularity);
  });

  constructor(private router: Router) {}

  /**
   * Handle search input
   */
  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  /**
   * Set active filter
   */
  setFilter(filter: FilterOption): void {
    this.activeFilter.set(filter);
  }

  /**
   * Navigate to breed detail
   */
  onBreedClick(breed: Breed): void {
    this.router.navigate(['/breeds', breed.id]);
  }

  /**
   * Navigate back
   */
  onBack(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Get display label for filter
   */
  getFilterLabel(filter: FilterOption): string {
    if (filter === 'Tutti') return 'Tutti';
    if (filter === 'Cane') return 'Cani';
    if (filter === 'Gatto') return 'Gatti';
    if (filter === 'Coniglio') return 'Conigli';
    if (filter === 'Uccello') return 'Uccelli';
    return filter;
  }

  /**
   * TrackBy function for breeds
   */
  trackByBreedId(_index: number, breed: Breed): string {
    return breed.id;
  }
}
