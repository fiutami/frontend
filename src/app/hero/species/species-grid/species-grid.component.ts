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
import { BreedsService } from '../../breeds/breeds.service';

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
  'cane':                   'assets/images/species/species-cane.png',
  'gatto':                  'assets/images/species/species-gatto.png',
  'coniglio':               'assets/images/species/species-coniglio.png',
  'furetto':                'assets/images/species/species-furetto.png',
  'roditore':               'assets/images/species/species-cane.png',
  'cavallo':                'assets/images/species/species-cavallo.png',
  // Uccelli
  'canarino':               'assets/images/species/species-canarini.png',
  'cocorita':               'assets/images/species/species-pappagalli.png',
  'calopsita':              'assets/images/species/species-pappagalli.png',
  'inseparabile':           'assets/images/species/species-pappagalli.png',
  'parrocchetto':           'assets/images/species/species-pappagalli.png',
  'diamantino':             'assets/images/species/species-pappagalli.png',
  'piccione-viaggiatore':   'assets/images/species/species-pappagalli.png',
  'pappagallo':             'assets/images/species/species-pappagalli.png',
  'uccello':                'assets/images/species/species-pappagalli.png',
  // Rettili
  'tartaruga':              'assets/images/species/species-tartarughe.png',
  'tartaruga-terra':        'assets/images/species/species-tartarughe.png',
  'tartaruga-acqua':        'assets/images/species/species-tartarughe.png',
  'pogona':                 'assets/images/species/species-serpenti.png',
  'geco-leopardino':        'assets/images/species/species-serpenti.png',
  'serpente':               'assets/images/species/species-serpenti.png',
  'serpente-non-velenoso':  'assets/images/species/species-serpenti.png',
  'rettile':                'assets/images/species/species-serpenti.png',
  // Anfibi
  'axolotl':                'assets/images/species/species-rana.png',
  'rana-pacman':            'assets/images/species/species-rana.png',
  'tritone':                'assets/images/species/species-rana.png',
  'salamandra':             'assets/images/species/species-rana.png',
  'anfibio':                'assets/images/species/species-rana.png',
  // Pesci
  'pesce':                  'assets/images/species/species-pesci.png',
  'pesce-rosso':            'assets/images/species/species-pesci.png',
  'betta-splendens':        'assets/images/species/species-pesci.png',
  'guppy':                  'assets/images/species/species-pesci.png',
  'molly':                  'assets/images/species/species-pesci.png',
  'platy':                  'assets/images/species/species-pesci.png',
  'discus':                 'assets/images/species/species-pesci.png',
  'neon':                   'assets/images/species/species-pesci.png',
  'corydoras':              'assets/images/species/species-pesci.png',
  'ciclidi-africani':       'assets/images/species/species-pesci.png',
  'pesci-tropicali':        'assets/images/species/species-pesci.png',
  // Invertebrati
  'invertebrato':           'assets/images/species/species-api.png',
  'ape':                    'assets/images/species/species-api.png',
  'gamberetto':             'assets/images/species/species-api.png',
  'granchio-acqua-dolce':   'assets/images/species/species-api.png',
  'insetto-stecco':         'assets/images/species/species-api.png',
  'insetto-foglia':         'assets/images/species/species-api.png',
  'tarantola':              'assets/images/species/species-api.png',
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
  private breedsService = inject(BreedsService);

  readonly categories = signal<SpeciesCategory[]>([]);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly selectedCategory = signal<string | null>(null);

  /** Search query passed from parent */
  @Input() searchQuery = '';

  @Output() categorySelected = new EventEmitter<SpeciesCategory>();

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.breedsService.loadSpecies().subscribe({
      next: (speciesList) => {
        const mapped: SpeciesCategory[] = speciesList.map(s => ({
          id: s.id,
          code: s.code,
          name: s.name,
          image: SPECIES_IMAGE_MAP[s.code] || s.imageUrl || DEFAULT_IMAGE,
          count: 0,
        }));
        this.categories.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load species for grid:', err);
        this.loadError.set('Impossibile caricare le specie.');
        this.isLoading.set(false);
      }
    });
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

  retry(): void {
    this.loadCategories();
  }
}
