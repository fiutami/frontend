import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  Output,
  EventEmitter,
  Input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SpeciesCategory {
  id: string;
  name: string;
  image: string;
  count: number;
}

@Component({
  selector: 'app-species-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './species-grid.component.html',
  styleUrls: ['./species-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesGridComponent implements OnInit {
  readonly categories = signal<SpeciesCategory[]>([]);
  readonly isLoading = signal(true);
  readonly selectedCategory = signal<string | null>(null);

  /** Search query passed from parent */
  @Input() searchQuery = '';

  @Output() categorySelected = new EventEmitter<SpeciesCategory>();

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    setTimeout(() => {
      this.categories.set([
        // Row 1
        { id: 'dogs', name: 'Cane', image: 'assets/images/species/species-cane.png', count: 350 },
        { id: 'horses', name: 'Cavallo', image: 'assets/images/species/species-cavallo.png', count: 30 },
        { id: 'fish', name: 'Pesci', image: 'assets/images/species/species-pesci.png', count: 200 },
        // Row 2
        { id: 'cats', name: 'Gatto', image: 'assets/images/species/species-gatto.png', count: 280 },
        { id: 'frogs', name: 'Rana', image: 'assets/images/species/species-rana.png', count: 25 },
        { id: 'birds', name: 'Pappagalli', image: 'assets/images/species/species-pappagalli.png', count: 120 },
        // Row 3
        { id: 'bees', name: 'Api', image: 'assets/images/species/species-api.png', count: 15 },
        { id: 'reptiles', name: 'Serpenti', image: 'assets/images/species/species-serpenti.png', count: 45 },
        { id: 'turtles', name: 'Tartarughe', image: 'assets/images/species/species-tartarughe.png', count: 60 },
      ]);
      this.isLoading.set(false);
    }, 500);
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
}
