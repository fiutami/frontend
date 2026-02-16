import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default/tab-page-shell-default.component';
import { PetService, PetCreateRequest, AuthService } from '../../../core';
import { Species } from '../../breeds/models/breed.model';

/**
 * PetDetailsComponent - Pet Registration Details Form
 *
 * Form for entering pet details: Name, Sex, Birth date, Age, Origin, Color, etc.
 * The Species (with real UUID) comes directly from sessionStorage,
 * set by the specie selection page.
 */
@Component({
  selector: 'app-pet-details',
  standalone: true,
  imports: [CommonModule, FormsModule, TabPageShellDefaultComponent],
  templateUrl: './pet-details.component.html',
  styleUrls: ['./pet-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetDetailsComponent implements OnInit {
  private router = inject(Router);
  private petService = inject(PetService);
  private authService = inject(AuthService);

  /** Species DTO with UUID from backend (loaded from sessionStorage) */
  speciesDto: Species | null = null;

  /** Selected breed ID (may be null if breedPolicy is None or user skipped) */
  selectedBreedId: string | null = null;
  selectedBreedName: string | null = null;

  /** Loading state */
  isLoading = signal(false);

  /** Error message */
  errorMessage = signal<string | null>(null);

  /** Form fields */
  petName = '';
  sex: 'male' | 'female' | null = null;
  birthDate = '';
  origin = '';
  color = '';
  weight = '';
  specialMarks = '';
  microchipNumber = '';

  ngOnInit(): void {
    // Read Species directly from sessionStorage (already has UUID from API)
    const stored = sessionStorage.getItem('selectedSpecies');
    if (stored) {
      try {
        this.speciesDto = JSON.parse(stored) as Species;
      } catch {
        this.speciesDto = null;
      }
    }

    if (!this.speciesDto) {
      this.errorMessage.set('Nessuna specie selezionata. Torna indietro e seleziona una specie.');
    }

    // Read selected breed from sessionStorage (set by breed-select step)
    const storedBreed = sessionStorage.getItem('selectedBreed');
    if (storedBreed) {
      try {
        const breed = JSON.parse(storedBreed);
        this.selectedBreedId = breed.id;
        this.selectedBreedName = breed.name;
      } catch {
        this.selectedBreedId = null;
      }
    }
  }

  onBack(): void {
    // Go back to breed-select if species has breeds, otherwise to specie
    if (this.speciesDto && this.speciesDto.breedPolicy !== 'None') {
      this.router.navigate(['/home/pet-register/breed-select']);
    } else {
      this.router.navigate(['/home/pet-register/specie']);
    }
  }

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

  get isFormValid(): boolean {
    return !!(this.petName && this.sex && this.speciesDto);
  }

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
      breedId: this.selectedBreedId,
      color: this.color || null,
      weight: this.weight ? parseFloat(this.weight) : null,
      specialMarks: this.specialMarks || null,
      microchipNumber: this.microchipNumber || null,
    };

    try {
      const createdPet = await new Promise<void>((resolve, reject) => {
        this.petService.createPet(request).subscribe({
          next: (pet) => {
            sessionStorage.setItem('createdPetId', pet.id);
            sessionStorage.setItem('petDetails', JSON.stringify({
              speciesDto: this.speciesDto,
              ...request,
              petId: pet.id
            }));

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
