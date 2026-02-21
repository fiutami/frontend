import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabPageShellBlueComponent } from '../../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';
import { PetService } from '../../../core/services/pet.service';
import { BreedsService } from '../../breeds/breeds.service';
import { Species, Breed } from '../../breeds/models/breed.model';

export interface AddPetForm {
  name: string;
  speciesId: string;
  breedId: string | null;
  sex: 'male' | 'female';
  birthDate: string;
  weight: number | null;
  bio: string;
}

@Component({
  selector: 'app-add-pet',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, TabPageShellBlueComponent],
  templateUrl: './add-pet.component.html',
  styleUrls: ['./add-pet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPetComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly petService = inject(PetService);
  private readonly breedsService = inject(BreedsService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Loading states
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingBreeds = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Species and breeds
  readonly speciesList = signal<Species[]>([]);
  readonly breedsList = signal<Breed[]>([]);

  // Form data
  readonly form = signal<AddPetForm>({
    name: '',
    speciesId: '',
    breedId: null,
    sex: 'male',
    birthDate: '',
    weight: null,
    bio: '',
  });

  // Sex options
  readonly sexOptions: Array<{ value: 'male' | 'female'; labelKey: string }> = [
    { value: 'male', labelKey: 'addPet.male' },
    { value: 'female', labelKey: 'addPet.female' },
  ];

  ngOnInit(): void {
    this.loadSpecies();
  }

  private loadSpecies(): void {
    this.isLoading.set(true);
    this.breedsService.loadSpecies().subscribe({
      next: (species) => {
        this.speciesList.set(species);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.speciesList.set([]);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  onSpeciesChange(speciesId: string): void {
    this.updateField('speciesId', speciesId);
    this.updateField('breedId', null);
    this.breedsList.set([]);

    if (speciesId) {
      this.isLoadingBreeds.set(true);
      this.cdr.markForCheck();

      this.breedsService.getBreedsBySpecies(speciesId).subscribe({
        next: (breeds) => {
          this.breedsList.set(breeds);
          this.isLoadingBreeds.set(false);
          this.cdr.markForCheck();
        },
        error: () => {
          this.breedsList.set([]);
          this.isLoadingBreeds.set(false);
          this.cdr.markForCheck();
        },
      });
    }
  }

  updateField<K extends keyof AddPetForm>(field: K, value: AddPetForm[K]): void {
    this.form.update(current => ({ ...current, [field]: value }));
  }

  onSave(): void {
    const formData = this.form();

    if (!formData.name.trim()) {
      this.errorMessage.set('addPet.errorNameRequired');
      return;
    }
    if (!formData.speciesId) {
      this.errorMessage.set('addPet.errorSpeciesRequired');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.petService.createPet({
      speciesId: formData.speciesId,
      name: formData.name.trim(),
      sex: formData.sex,
      birthDate: formData.birthDate ? `${formData.birthDate}T00:00:00.000Z` : null,
      breedId: formData.breedId || null,
      weight: formData.weight,
    }).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        // Navigate to the newly created pet profile
        this.router.navigate(['/home/pet-profile', response.id]);
      },
      error: (err) => {
        console.error('Failed to create pet:', err);
        this.errorMessage.set('addPet.errorGeneric');
        this.isSaving.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  goBack(): void {
    window.history.back();
  }
}
