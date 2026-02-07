import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Species } from '../data/species.data';
import { PetService, PetCreateRequest, AuthService } from '../../../core';
import { SpeciesQuestionnaireService, SpeciesDto } from '../../species-questionnaire/species-questionnaire.service';

/**
 * PetDetailsComponent - Pet Registration Details Form
 *
 * Form for entering pet details: Name, Sex, Birth date, Age, Origin, Color, etc.
 * Integrates with PetService to save pets to backend.
 *
 * Based on Figma design: FxJsfOV7R7qoXBM2xTyXRE
 */
@Component({
  selector: 'app-pet-details',
  templateUrl: './pet-details.component.html',
  styleUrls: ['./pet-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetDetailsComponent implements OnInit {
  private router = inject(Router);
  private petService = inject(PetService);
  private authService = inject(AuthService);
  private speciesService = inject(SpeciesQuestionnaireService);

  /** Selected species from previous step (local data) */
  selectedSpecies: Species | null = null;

  /** Species DTO with GUID from backend */
  speciesDto: SpeciesDto | null = null;

  /** All species loaded from backend */
  allSpecies = signal<SpeciesDto[]>([]);

  /** Loading state */
  isLoading = signal(false);

  /** Species loading state */
  isLoadingSpecies = signal(true);

  /** Error message */
  errorMessage = signal<string | null>(null);

  /** Species load error */
  speciesLoadError = signal<string | null>(null);

  /** Form fields */
  petName = '';
  sex: 'male' | 'female' | null = null;
  birthDate = '';
  origin = '';
  color = '';
  weight = '';
  specialMarks = '';
  microchipNumber = '';

  async ngOnInit(): Promise<void> {
    // Retrieve selected species from session storage (local data)
    const storedSpecies = sessionStorage.getItem('selectedSpecies');
    if (storedSpecies) {
      this.selectedSpecies = JSON.parse(storedSpecies);
    }

    // Load species from backend to get the GUID
    await this.loadSpeciesFromBackend();
  }

  /**
   * Load species from backend and map to local selection
   */
  async loadSpeciesFromBackend(): Promise<void> {
    this.isLoadingSpecies.set(true);
    this.speciesLoadError.set(null);

    try {
      const species = await this.speciesService.getAllSpecies();
      this.allSpecies.set(species);

      console.log('Backend species loaded:', species);
      console.log('Selected local species:', this.selectedSpecies);

      // Find matching species by multiple strategies
      if (this.selectedSpecies) {
        const localId = this.selectedSpecies.id.toLowerCase();
        const localName = this.selectedSpecies.name.toLowerCase();

        // Strategy 1: Match by code (exact)
        this.speciesDto = species.find(s =>
          s.code.toLowerCase() === localId
        ) ?? null;

        // Strategy 2: Match by name if code didn't work
        if (!this.speciesDto) {
          this.speciesDto = species.find(s =>
            s.name.toLowerCase() === localName
          ) ?? null;
        }

        // Strategy 3: Partial match on name
        if (!this.speciesDto) {
          this.speciesDto = species.find(s =>
            s.name.toLowerCase().includes(localId) ||
            localId.includes(s.code.toLowerCase())
          ) ?? null;
        }

        console.log('Matched speciesDto:', this.speciesDto);

        if (!this.speciesDto) {
          console.warn('No matching species found in backend for:', this.selectedSpecies);
          this.speciesLoadError.set(
            `Specie "${this.selectedSpecies.name}" non trovata nel database. ` +
            `Specie disponibili: ${species.map(s => s.name).join(', ')}`
          );
        }
      }
    } catch (error: any) {
      console.error('Failed to load species from backend:', error);
      this.speciesLoadError.set(
        'Impossibile caricare le specie dal server. Verifica la connessione e riprova.'
      );
    } finally {
      this.isLoadingSpecies.set(false);
    }
  }

  /**
   * Navigate back to species selection
   */
  onBack(): void {
    this.router.navigate(['/home/pet-register/specie']);
  }

  /**
   * Calculate age from birth date
   */
  get calculatedAge(): string {
    if (!this.birthDate) return '';
    const birth = new Date(this.birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();

    if (years > 0) {
      return `${years} ann${years === 1 ? 'o' : 'i'}`;
    } else if (months > 0) {
      return `${months} mes${months === 1 ? 'e' : 'i'}`;
    }
    return 'Meno di 1 mese';
  }

  /**
   * Check if form is valid
   */
  get isFormValid(): boolean {
    return !!(this.petName && this.sex && this.speciesDto);
  }

  /**
   * Submit form and create pet in backend
   */
  async onSubmit(): Promise<void> {
    if (!this.isFormValid) {
      this.errorMessage.set('Compila tutti i campi obbligatori');
      return;
    }

    if (!this.speciesDto) {
      this.errorMessage.set('Specie non trovata. Torna indietro e seleziona una specie.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request: PetCreateRequest = {
      speciesId: this.speciesDto.id,
      name: this.petName,
      sex: this.sex!,
      birthDate: this.birthDate || null,
      breedId: null,
      color: this.color || null,
      weight: this.weight ? parseFloat(this.weight) : null,
      specialMarks: this.specialMarks || null,
      microchipNumber: this.microchipNumber || null,
    };

    try {
      const createdPet = await new Promise<void>((resolve, reject) => {
        this.petService.createPet(request).subscribe({
          next: (pet) => {
            // Store pet ID for next steps
            sessionStorage.setItem('createdPetId', pet.id);
            sessionStorage.setItem('petDetails', JSON.stringify({
              species: this.selectedSpecies,
              speciesDto: this.speciesDto,
              ...request,
              petId: pet.id
            }));

            // Mark onboarding as complete in local storage
            this.authService.markOnboardingComplete();

            resolve();
          },
          error: (err) => reject(err)
        });
      });

      this.isLoading.set(false);
      this.router.navigate(['/home/pet-register/docs']);
    } catch (error: any) {
      this.isLoading.set(false);
      this.errorMessage.set(error?.error?.message || 'Errore durante la registrazione. Riprova.');
      console.error('Failed to create pet:', error);
    }
  }
}
