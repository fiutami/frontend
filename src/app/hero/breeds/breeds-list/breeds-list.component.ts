import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default/tab-page-shell-default.component';
import { BreedsService } from '../breeds.service';
import { Species, Breed } from '../models/breed.model';

@Component({
  selector: 'app-breeds-list',
  standalone: true,
  imports: [CommonModule, TabPageShellDefaultComponent],
  templateUrl: './breeds-list.component.html',
  styleUrls: ['./breeds-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedsListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly breedsService = inject(BreedsService);

  /** Current species */
  readonly species = signal<Species | null>(null);

  /** Search query for filtering */
  readonly searchQuery = signal('');

  /** Loading state */
  readonly isLoadingBreeds = signal(true);

  /** Breeds loaded from API */
  private readonly rawBreeds = signal<Breed[]>([]);

  /** Filtered breeds based on search query */
  readonly filteredBreeds = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const breeds = this.rawBreeds();
    if (!query) return breeds;
    return breeds.filter(b => b.name.toLowerCase().includes(query));
  });

  /** Whether breeds are available (API returned data) */
  readonly hasBreeds = computed(() => this.rawBreeds().length > 0);

  /** Display items: filtered breeds */
  readonly displayItems = computed(() => {
    return this.filteredBreeds();
  });

  ngOnInit(): void {
    const speciesId = this.route.snapshot.paramMap.get('speciesId');
    if (!speciesId) {
      this.router.navigate(['/home/species']);
      return;
    }

    // Ensure species list is loaded, then find current species
    this.breedsService.loadSpecies().subscribe(list => {
      const sp = list.find(s => s.id === speciesId);
      if (sp) {
        this.species.set(sp);
        this.loadBreeds(speciesId);
      } else {
        this.isLoadingBreeds.set(false);
      }
    });
  }

  private loadBreeds(speciesId: string): void {
    this.isLoadingBreeds.set(true);
    this.breedsService.getBreedsBySpecies(speciesId).subscribe({
      next: breeds => {
        this.rawBreeds.set(breeds);
        this.isLoadingBreeds.set(false);
      },
      error: () => {
        this.isLoadingBreeds.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onBreedClick(breed: Breed): void {
    // For synthetic species entries, pre-set in service so result page can use it
    if (breed.id.startsWith('species-')) {
      this.breedsService.selectBreed(breed);
    }
    this.router.navigate(['/home/breeds/detail', breed.id]);
  }

  onBack(): void {
    this.router.navigate(['/home/species']);
  }

  trackByBreed(_index: number, breed: Breed): string {
    return breed.id;
  }
}
