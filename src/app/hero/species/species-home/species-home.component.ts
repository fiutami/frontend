import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BottomTabBarComponent } from '../../../shared/components/bottom-tab-bar';
import { MascotPeekComponent } from '../../../shared/components/mascot-peek';
import { MascotBottomSheetComponent } from '../../../shared/components/mascot-bottom-sheet';
import { MAIN_TAB_BAR_CONFIG } from '../../../core/config/tab-bar.config';
import { PageBackgroundComponent } from '../../../shared/components/page-background';

export interface SpeciesCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-species-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BottomTabBarComponent,
    PageBackgroundComponent,
    MascotPeekComponent,
    MascotBottomSheetComponent,
  ],
  templateUrl: './species-home.component.html',
  styleUrls: ['./species-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesHomeComponent implements OnInit {
  private readonly router = inject(Router);

  // Mascot sheet state
  showMascotSheet = signal(false);
  @ViewChild('mascotPeek') mascotPeek!: MascotPeekComponent;

  // State
  readonly categories = signal<SpeciesCategory[]>([]);
  readonly isLoading = signal(true);
  readonly selectedCategory = signal<string | null>(null);

  // Bottom tab bar - configurazione centralizzata
  tabs = MAIN_TAB_BAR_CONFIG;

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    // Mock data - replace with API call
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
    // Navigate to category detail or show breeds
    // For now, just set the selected category
  }

  goBack(): void {
    this.router.navigate(['/home/main']);
  }

  trackByCategory(index: number, category: SpeciesCategory): string {
    return category.id;
  }

  // Mascot methods
  onMascotClick(): void {
    this.showMascotSheet.set(true);
  }

  closeMascotSheet(): void {
    this.showMascotSheet.set(false);
    this.mascotPeek?.returnToPeek();
  }
}
