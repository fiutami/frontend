import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  Output,
  EventEmitter,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeciesQuestionnaireService } from '../../species-questionnaire/species-questionnaire.service';

export interface SpeciesCategory {
  id: string;
  code: string;
  name: string;
  image: string;
  count: number;
}

/** Maps species code → local image asset */
const SPECIES_IMAGE_MAP: Record<string, string> = {
  // Mammiferi
  'cane':          'assets/images/species/species-cane.png',
  'gatto':         'assets/images/species/species-gatto.png',
  'cavallo':       'assets/images/species/species-cavallo.png',
  // Uccelli
  'pappagallo':    'assets/images/species/species-pappagalli.png',
  'canarino':      'assets/images/species/species-canarini.png',
  'uccello':       'assets/images/species/species-pappagalli.png',
  // Rettili
  'tartaruga':     'assets/images/species/species-tartarughe.png',
  'serpente':      'assets/images/species/species-serpenti.png',
  'rettile':       'assets/images/species/species-serpenti.png',
  // Anfibi
  'rana':          'assets/images/species/species-rana.png',
  'anfibio':       'assets/images/species/species-rana.png',
  // Pesci
  'pesce':         'assets/images/species/species-pesci.png',
  // Invertebrati
  'ape':           'assets/images/species/species-api.png',
  'invertebrato':  'assets/images/species/species-api.png',
};

const DEFAULT_IMAGE = 'assets/images/species/species-cane.png';

@Component({
  selector: 'app-species-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './species-grid.component.html',
  styleUrls: ['./species-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesGridComponent implements OnInit {
  private speciesService = inject(SpeciesQuestionnaireService);

  readonly categories = signal<SpeciesCategory[]>([]);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly selectedCategory = signal<string | null>(null);

  /** Search query passed from parent */
  @Input() searchQuery = '';

  @Output() categorySelected = new EventEmitter<SpeciesCategory>();

  async ngOnInit(): Promise<void> {
    await this.loadCategories();
  }

  private async loadCategories(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const allSpecies = await this.speciesService.getAllSpecies();

      // Top-level only: species without parent (mammiferi + categories)
      const gridSpecies = allSpecies.filter(s => !s.parentSpeciesId);

      const mapped: SpeciesCategory[] = gridSpecies.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        image: s.imageUrl || SPECIES_IMAGE_MAP[s.code] || DEFAULT_IMAGE,
        count: 0,
      }));

      this.categories.set(mapped);
    } catch (error) {
      console.error('Failed to load species for grid:', error);
      this.loadError.set('Impossibile caricare le specie.');
    } finally {
      this.isLoading.set(false);
    }
  }

  selectCategory(category: SpeciesCategory): void {
    this.selectedCategory.set(category.id);
    this.categorySelected.emit(category);
  }

  get filteredCategories(): SpeciesCategory[] {
    const query = (this.searchQuery || '').toLowerCase();
    if (!query) {
      return this.categories();
    }
    return this.categories().filter(cat =>
      cat.name.toLowerCase().includes(query)
    );
  }

  trackByCategory(index: number, category: SpeciesCategory): string {
    return category.id;
  }

  async retry(): Promise<void> {
    await this.loadCategories();
  }
}
