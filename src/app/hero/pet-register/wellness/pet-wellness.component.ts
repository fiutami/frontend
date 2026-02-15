import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default/tab-page-shell-default.component';
import { SpeciesDto } from '../../species-questionnaire/species-questionnaire.service';

/**
 * PetWellnessComponent - Pet Wellness Guide Page
 *
 * Shows wellness information based on species type.
 * Content includes: Alimentazione, Peso, Comportamento, Habitat, Vaccinazioni, etc.
 *
 * Based on Figma design: FxJsfOV7R7qoXBM2xTyXRE
 */
@Component({
  selector: 'app-pet-wellness',
  standalone: true,
  imports: [CommonModule, TabPageShellDefaultComponent],
  templateUrl: './pet-wellness.component.html',
  styleUrls: ['./pet-wellness.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetWellnessComponent implements OnInit {
  /** Selected species from previous step (SpeciesDto with UUID) */
  selectedSpecies: SpeciesDto | null = null;

  /** Wellness guide categories */
  wellnessCategories = [
    {
      id: 'alimentazione',
      label: 'Alimentazione',
      icon: 'food',
      description: 'Consigli su dieta e nutrizione',
    },
    {
      id: 'peso',
      label: 'Peso ideale',
      icon: 'scale',
      description: 'Range di peso sano',
    },
    {
      id: 'comportamento',
      label: 'Comportamento',
      icon: 'behavior',
      description: 'Comportamenti tipici della specie',
    },
    {
      id: 'habitat',
      label: 'Habitat',
      icon: 'home',
      description: 'Ambiente ideale di vita',
    },
    {
      id: 'vaccinazioni',
      label: 'Vaccinazioni',
      icon: 'vaccine',
      description: 'Calendario vaccini consigliati',
    },
    {
      id: 'cure',
      label: 'Cure veterinarie',
      icon: 'vet',
      description: 'Visite e controlli periodici',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Retrieve selected species from session storage
    const storedSpecies = sessionStorage.getItem('selectedSpecies');
    if (storedSpecies) {
      this.selectedSpecies = JSON.parse(storedSpecies);
    }
  }

  /**
   * Navigate back to documentation
   */
  onBack(): void {
    this.router.navigate(['/home/pet-register/docs']);
  }

  /**
   * Complete registration
   */
  onComplete(): void {
    // Clear session storage and navigate to profile/dashboard
    // In real app, this would save to backend
    const petData = {
      species: JSON.parse(sessionStorage.getItem('selectedSpecies') || 'null'),
      details: JSON.parse(sessionStorage.getItem('petDetails') || 'null'),
      documents: JSON.parse(sessionStorage.getItem('petDocuments') || 'null'),
    };

    console.log('Pet registration complete:', petData);

    // Clear session storage
    sessionStorage.removeItem('selectedSpecies');
    sessionStorage.removeItem('petDetails');
    sessionStorage.removeItem('petDocuments');

    // Navigate to dashboard or pet profile
    this.router.navigate(['/home']);
  }

  /**
   * View wellness category details (Coming soon)
   */
  viewCategory(categoryId: string): void {
    console.log('View category:', categoryId);
    // In future, navigate to detailed wellness guide
  }
}
