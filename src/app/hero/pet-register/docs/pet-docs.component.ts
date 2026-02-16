import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default/tab-page-shell-default.component';
import { Species } from '../../breeds/models/breed.model';

/**
 * PetDocsComponent - Pet Documentation Page
 *
 * Shows required documents based on species type.
 * Documents may include: microchip, health booklet, passport, insurance, CITES, etc.
 *
 * Based on Figma design: FxJsfOV7R7qoXBM2xTyXRE
 */
@Component({
  selector: 'app-pet-docs',
  standalone: true,
  imports: [CommonModule, TabPageShellDefaultComponent],
  templateUrl: './pet-docs.component.html',
  styleUrls: ['./pet-docs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetDocsComponent implements OnInit {
  /** Selected species from previous step (Species with UUID) */
  selectedSpecies: Species | null = null;

  /** Document checklist items */
  documentItems = [
    { id: 'microchip', label: 'Microchip', required: true, checked: false },
    { id: 'libretto', label: 'Libretto sanitario', required: true, checked: false },
    { id: 'passaporto', label: 'Passaporto europeo', required: false, checked: false },
    { id: 'assicurazione', label: 'Assicurazione', required: false, checked: false },
    { id: 'pedigree', label: 'Pedigree/Certificato', required: false, checked: false },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Retrieve selected species from session storage
    const storedSpecies = sessionStorage.getItem('selectedSpecies');
    if (storedSpecies) {
      this.selectedSpecies = JSON.parse(storedSpecies);
      this.updateDocumentsForSpecies();
    }
  }

  /**
   * Update document requirements based on species
   */
  private updateDocumentsForSpecies(): void {
    if (!this.selectedSpecies) return;

    // Adjust documents based on species category
    const category = this.selectedSpecies.category;

    if (category === 'rettile' || category === 'anfibio') {
      // Add CITES for exotic species
      this.documentItems.push({
        id: 'cites',
        label: 'Certificato CITES',
        required: true,
        checked: false,
      });
    }

    if (category === 'pesce' || category === 'invertebrato') {
      // Remove microchip requirement for fish/invertebrates
      const microchipItem = this.documentItems.find((d) => d.id === 'microchip');
      if (microchipItem) {
        microchipItem.required = false;
      }
    }
  }

  /**
   * Navigate back to pet details
   */
  onBack(): void {
    this.router.navigate(['/home/pet-register/details']);
  }

  /**
   * Toggle document checkbox
   */
  toggleDocument(item: { checked: boolean }): void {
    item.checked = !item.checked;
  }

  /**
   * Continue to wellness guide
   */
  onContinue(): void {
    // Save document status to session storage
    sessionStorage.setItem('petDocuments', JSON.stringify(this.documentItems));
    this.router.navigate(['/home/pet-register/wellness']);
  }
}
