import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import {
  BreedDetail,
  BreedTab,
  BreedTabId,
  BREED_TABS,
  getBreedDetail,
} from '../breeds.models';

/**
 * BreedDetailComponent - Detailed view of a single breed
 *
 * Features:
 * - Large image header with breed info
 * - 6 tabs for different info categories (Overview, Size, Temperament, Care, Health, Pedigree)
 * - Characteristics rating bars
 * - Pro/Contro section
 * - "This is my pet" CTA button
 *
 * Data source:
 * - Static JSON files loaded via BreedsDataService
 * - Falls back to mock data if JSON not found
 */
@Component({
  selector: 'app-breed-detail',
  standalone: true,
  imports: [CommonModule, SharedModule, TranslateModule],
  templateUrl: './breed-detail.component.html',
  styleUrls: ['./breed-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedDetailComponent implements OnInit {
  /** Available tabs */
  protected readonly tabs = BREED_TABS;

  /** Current breed data */
  protected breed = signal<BreedDetail | null>(null);

  /** Loading state */
  protected loading = signal<boolean>(false);

  /** Current active tab */
  protected activeTab = signal<BreedTabId>('overview');

  /** Get active tab configuration */
  protected activeTabConfig = computed<BreedTab | undefined>(() => {
    return this.tabs.find(t => t.id === this.activeTab());
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('BreedDetailComponent ngOnInit, id:', id);

    if (id) {
      const data = getBreedDetail(id);
      console.log('Breed data:', data);
      this.breed.set(data);
    }
  }

  /**
   * Set active tab
   */
  setActiveTab(tabId: BreedTabId): void {
    this.activeTab.set(tabId);
  }

  /**
   * Navigate back to breeds list
   */
  onBack(): void {
    this.router.navigate(['/breeds']);
  }

  /**
   * Navigate to register pet with breed pre-selected
   */
  onSelectBreed(): void {
    const breed = this.breed();
    if (breed) {
      this.router.navigate(['/onboarding/register-pet'], {
        queryParams: { breed: breed.id },
      });
    }
  }

  /**
   * Check if tab is active
   */
  isTabActive(tabId: BreedTabId): boolean {
    return this.activeTab() === tabId;
  }
}
