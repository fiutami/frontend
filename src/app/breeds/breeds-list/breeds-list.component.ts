import {
  Component,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { Species, SPECIES_CONFIG, SpeciesConfig } from '../breeds.models';
import { AvatarButtonComponent } from '../../shared/components/avatar-button';

type ViewMode = 'species' | 'breeds';

/**
 * BreedsListComponent - Species selection grid (mob_breeds design)
 *
 * Features:
 * - Background gradient with decorative header
 * - Species selector switch (Specie/Razze)
 * - 3-column scrollable grid of species cards
 * - Interactive mascot with speech bubble
 * - Bottom tab bar navigation
 */
@Component({
  selector: 'app-breeds-list',
  standalone: true,
  imports: [CommonModule, SharedModule, TranslateModule, AvatarButtonComponent],
  templateUrl: './breeds-list.component.html',
  styleUrls: ['./breeds-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedsListComponent {
  /** All available species */
  protected readonly species = SPECIES_CONFIG;

  /** Current view mode */
  protected viewMode = signal<ViewMode>('species');

  /** View mode labels */
  protected readonly viewLabels: Record<ViewMode, string> = {
    species: 'Specie',
    breeds: 'Razze',
  };

  /** Tab bar configuration */
  protected readonly tabs = [
    { id: 'home', icon: 'home', route: '/home' },
    { id: 'calendar', icon: 'calendar_today', route: '/calendar' },
    { id: 'location', icon: 'place', route: '/map' },
    { id: 'pet', icon: 'pets', route: '/pet' },
    { id: 'profile', icon: 'person', route: '/profile' },
  ];

  constructor(private router: Router) {}

  /**
   * Get current view label
   */
  get currentLabel(): string {
    return this.viewLabels[this.viewMode()];
  }

  /**
   * Switch to previous view mode
   */
  onPreviousView(): void {
    this.viewMode.set(this.viewMode() === 'species' ? 'breeds' : 'species');
  }

  /**
   * Switch to next view mode
   */
  onNextView(): void {
    this.viewMode.set(this.viewMode() === 'species' ? 'breeds' : 'species');
  }

  /**
   * Navigate to species detail (breeds of this species)
   */
  onSpeciesClick(species: SpeciesConfig): void {
    this.router.navigate(['/breeds'], {
      queryParams: { species: species.id },
    });
  }

  /**
   * Navigate back
   */
  onBack(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Open drawer menu
   */
  onOpenDrawer(): void {
    // TODO: Implement drawer service
    console.log('Open drawer');
  }

  /**
   * Check if label should be small (for long species names)
   */
  isSmallLabel(label: string): boolean {
    return label.length > 6;
  }

  /**
   * TrackBy function for species
   */
  trackBySpeciesId(_index: number, species: SpeciesConfig): string {
    return species.id;
  }
}
