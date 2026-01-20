import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SpeciesCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
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
  readonly searchQuery = signal('');

  @Output() categorySelected = new EventEmitter<SpeciesCategory>();

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    setTimeout(() => {
      this.categories.set([
        { id: 'dogs', name: 'Cani', icon: 'pets', count: 350, color: '#F5A623' },
        { id: 'cats', name: 'Gatti', icon: 'pets', count: 280, color: '#4A90E2' },
        { id: 'birds', name: 'Uccelli', icon: 'flutter_dash', count: 120, color: '#7ED321' },
        { id: 'rodents', name: 'Roditori', icon: 'pest_control_rodent', count: 85, color: '#9B59B6' },
        { id: 'reptiles', name: 'Rettili', icon: 'pest_control', count: 45, color: '#E74C3C' },
        { id: 'fish', name: 'Pesci', icon: 'water', count: 200, color: '#3498DB' },
        { id: 'horses', name: 'Cavalli', icon: 'sports_mma', count: 30, color: '#8B4513' },
        { id: 'exotic', name: 'Esotici', icon: 'eco', count: 60, color: '#1ABC9C' },
      ]);
      this.isLoading.set(false);
    }, 500);
  }

  selectCategory(category: SpeciesCategory): void {
    this.selectedCategory.set(category.id);
    this.categorySelected.emit(category);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  get filteredCategories(): SpeciesCategory[] {
    const query = this.searchQuery().toLowerCase();
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
