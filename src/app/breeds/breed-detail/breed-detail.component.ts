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
 * - 6 tabs for different info categories
 * - "This is my pet" CTA button
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

  /** Current active tab */
  protected activeTab = signal<BreedTabId>('dna');

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
    if (id) {
      const breedData = getBreedDetail(id);
      this.breed.set(breedData);
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
