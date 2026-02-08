import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import {
  SPECIES_CATEGORIES,
  SPECIES,
  Species,
  SpeciesCategory,
  SpeciesCategoryInfo,
  getSpeciesByCategory,
} from '../data/species.data';

/**
 * SpecieComponent - Species Selection Page
 *
 * Allows users to select their pet's species from categorized options.
 * Shows expandable categories with species list.
 *
 * Based on Figma design: FxJsfOV7R7qoXBM2xTyXRE, node 12286:4434
 */
@Component({
  selector: 'app-specie',
  templateUrl: './specie.component.html',
  styleUrls: ['./specie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecieComponent {
  /** All species categories */
  readonly categories = SPECIES_CATEGORIES;

  /** Currently expanded category */
  expandedCategory: SpeciesCategory | null = null;

  /** Selected species */
  selectedSpecies: Species | null = null;

  constructor(private router: Router) {}

  /**
   * Navigate back to pet-register main page
   */
  onBack(): void {
    this.router.navigate(['/home/pet-register']);
  }

  /**
   * Toggle category expansion
   */
  toggleCategory(category: SpeciesCategoryInfo): void {
    if (this.expandedCategory === category.id) {
      this.expandedCategory = null;
    } else {
      this.expandedCategory = category.id;
    }
  }

  /**
   * Check if category is expanded
   */
  isCategoryExpanded(categoryId: SpeciesCategory): boolean {
    return this.expandedCategory === categoryId;
  }

  /**
   * Get species for a category
   */
  getSpeciesForCategory(categoryId: SpeciesCategory): Species[] {
    return getSpeciesByCategory(categoryId);
  }

  /**
   * Select a species and navigate to details
   */
  selectSpecies(species: Species): void {
    this.selectedSpecies = species;
    // Store selected species in session/state and navigate to details
    sessionStorage.setItem('selectedSpecies', JSON.stringify(species));
    this.router.navigate(['/home/pet-register/details']);
  }

  /**
   * Check if species is selected
   */
  isSpeciesSelected(speciesId: string): boolean {
    return this.selectedSpecies?.id === speciesId;
  }
}
