import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default/tab-page-shell-default.component';
import { BreedsService } from '../../breeds/breeds.service';
import { Species } from '../../breeds/models/breed.model';

/** Category metadata for accordion display */
const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  mammifero: { label: 'Mammiferi', icon: 'paw' },
  uccello: { label: 'Uccelli', icon: 'bird' },
  rettile: { label: 'Rettili', icon: 'reptile' },
  anfibio: { label: 'Anfibi', icon: 'frog' },
  pesce: { label: "Pesci d'acquario", icon: 'fish' },
  invertebrato: { label: 'Invertebrati', icon: 'bug' },
};

/** Category display order */
const CATEGORY_ORDER = ['mammifero', 'uccello', 'rettile', 'anfibio', 'pesce', 'invertebrato'];

export interface CategoryGroup {
  id: string;
  label: string;
  icon: string;
  species: Species[];
}

/**
 * SpecieComponent - Species Selection Page
 *
 * Loads species from backend API, groups by category, and allows selection.
 * Only species with taxonRank='species' are shown as selectable items.
 */
@Component({
  selector: 'app-specie',
  standalone: true,
  imports: [CommonModule, TabPageShellDefaultComponent],
  templateUrl: './specie.component.html',
  styleUrls: ['./specie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecieComponent implements OnInit {
  private router = inject(Router);
  private breedsService = inject(BreedsService);

  /** All species loaded from API */
  private allSpecies = signal<Species[]>([]);

  /** Loading state */
  isLoading = signal(true);

  /** Error message */
  loadError = signal<string | null>(null);

  /** Currently expanded category */
  expandedCategory = signal<string | null>(null);

  /** Selected species */
  selectedSpecies = signal<Species | null>(null);

  /** Grouped categories computed from API data */
  categories = computed<CategoryGroup[]>(() => {
    const species = this.allSpecies();
    // Only selectable species (not category-level entries)
    // If taxonRank is missing (old backend), treat as 'species' (safe default)
    const selectableSpecies = species.filter(s => (s.taxonRank ?? 'species') === 'species');

    // Group by category
    const grouped = new Map<string, Species[]>();
    for (const s of selectableSpecies) {
      const cat = s.category;
      if (!grouped.has(cat)) {
        grouped.set(cat, []);
      }
      grouped.get(cat)!.push(s);
    }

    // Build ordered category groups
    const result: CategoryGroup[] = [];
    for (const catId of CATEGORY_ORDER) {
      const speciesList = grouped.get(catId);
      if (speciesList && speciesList.length > 0) {
        const meta = CATEGORY_META[catId] ?? { label: catId, icon: 'paw' };
        result.push({
          id: catId,
          label: meta.label,
          icon: meta.icon,
          species: speciesList,
        });
      }
    }

    // Add any categories not in the predefined order
    for (const [catId, speciesList] of grouped) {
      if (!CATEGORY_ORDER.includes(catId) && speciesList.length > 0) {
        const meta = CATEGORY_META[catId] ?? { label: catId, icon: 'paw' };
        result.push({
          id: catId,
          label: meta.label,
          icon: meta.icon,
          species: speciesList,
        });
      }
    }

    return result;
  });

  ngOnInit(): void {
    this.loadSpecies();
  }

  private loadSpecies(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.breedsService.loadSpecies().subscribe({
      next: (species) => {
        this.allSpecies.set(species);
        if (species.filter(s => (s.taxonRank ?? 'species') === 'species').length === 0) {
          this.loadError.set('Nessuna specie disponibile al momento.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load species:', err);
        this.loadError.set('Impossibile caricare le specie. Riprova.');
        this.isLoading.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/home/pet-register']);
  }

  toggleCategory(categoryId: string): void {
    this.expandedCategory.update(current =>
      current === categoryId ? null : categoryId
    );
  }

  isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategory() === categoryId;
  }

  selectSpecies(species: Species): void {
    this.selectedSpecies.set(species);
    // Store the full Species (with real UUID) in sessionStorage
    sessionStorage.setItem('selectedSpecies', JSON.stringify(species));
    // Clear any previously selected breed
    sessionStorage.removeItem('selectedBreed');

    // Navigate to breed selection if species has breeds, otherwise go to details
    if (species.breedPolicy !== 'None') {
      this.router.navigate(['/home/pet-register/breed-select']);
    } else {
      this.router.navigate(['/home/pet-register/details']);
    }
  }

  isSpeciesSelected(speciesId: string): boolean {
    return this.selectedSpecies()?.id === speciesId;
  }

  retry(): void {
    this.loadSpecies();
  }
}
