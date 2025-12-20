import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { PetService, PetCreateRequest, AuthService } from '../../core';
import { SpeciesQuestionnaireService, SpeciesDto } from '../../hero/species-questionnaire/species-questionnaire.service';
import { BreedsService } from '../../hero/breeds/breeds.service';
import { Breed } from '../../hero/breeds/models/breed.model';

/**
 * RegisterPetComponent - Single-form pet registration
 *
 * Onboarding flow for users who already have a pet.
 * Collects all pet details in a single scrollable form.
 *
 * Based on Figma design: node-id 12271-7592
 */
@Component({
  selector: 'app-register-pet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule,
  ],
  templateUrl: './register-pet.component.html',
  styleUrls: ['./register-pet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPetComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly petService = inject(PetService);
  private readonly authService = inject(AuthService);
  private readonly speciesService = inject(SpeciesQuestionnaireService);
  private readonly breedsService = inject(BreedsService);

  /** File input reference */
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /** Loading state */
  protected isLoading = signal(false);

  /** Uploading state */
  protected isUploading = signal(false);

  /** Error message */
  protected errorMessage = signal<string | null>(null);

  /** Selected photo file */
  protected selectedFile: File | null = null;

  /** Photo preview URL */
  protected photoPreview = signal<string | null>(null);

  /** Upload error */
  protected uploadError = signal<string | null>(null);

  /** Species from backend */
  protected backendSpecies = signal<SpeciesDto[]>([]);

  /** Breeds for selected species */
  protected breeds = signal<Breed[]>([]);

  /** Loading species state */
  protected isLoadingSpecies = signal(false);

  /** Loading breeds state */
  protected isLoadingBreeds = signal(false);

  /** Species load error */
  protected speciesError = signal<string | null>(null);

  /** Species options (from backend only - no fallback) */
  protected get speciesOptions(): { value: string; label: string }[] {
    return this.backendSpecies().map(s => ({
      value: s.id,
      label: s.name
    }));
  }

  /** Breed options for selected species */
  protected get breedOptions(): { value: string; label: string }[] {
    return this.breeds().map(b => ({
      value: b.id,
      label: b.name
    }));
  }

  /** Pet registration form */
  protected petForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    specie: ['', Validators.required],
    razza: [''],
    sesso: ['', Validators.required],
    dataNascita: [''],
    peso: [''],
    colore: [''],
    segniParticolari: [''],
  });

  /**
   * Load species from backend on init
   */
  async ngOnInit(): Promise<void> {
    this.isLoadingSpecies.set(true);
    this.speciesError.set(null);
    try {
      const species = await this.speciesService.getAllSpecies();
      if (species.length === 0) {
        this.speciesError.set('Nessuna specie disponibile. Riprova più tardi.');
      } else {
        this.backendSpecies.set(species);
      }
    } catch (error) {
      console.error('Failed to load species:', error);
      this.speciesError.set('Errore nel caricamento delle specie. Riprova più tardi.');
    } finally {
      this.isLoadingSpecies.set(false);
    }

    // Listen for species changes to load breeds
    this.petForm.get('specie')?.valueChanges.subscribe(speciesId => {
      if (speciesId) {
        this.loadBreedsForSpecies(speciesId);
      } else {
        this.breeds.set([]);
      }
    });
  }

  /**
   * Load breeds for selected species
   */
  private loadBreedsForSpecies(speciesId: string): void {
    this.isLoadingBreeds.set(true);
    this.breeds.set([]);
    // Reset breed selection when species changes
    this.petForm.get('razza')?.setValue('');

    // Use species UUID directly for API call
    this.breedsService.getBreedsBySpecies(speciesId).subscribe({
      next: (breeds) => {
        this.breeds.set(breeds);
        this.isLoadingBreeds.set(false);
      },
      error: () => {
        this.isLoadingBreeds.set(false);
      }
    });
  }

  /**
   * Navigate back to welcome screen
   */
  onBack(): void {
    this.router.navigate(['/onboarding/welcome']);
  }

  /**
   * Check if form is valid for submission
   */
  get isFormValid(): boolean {
    // Form must be valid AND species must be loaded from backend
    return this.petForm.valid && this.backendSpecies().length > 0 && !this.speciesError();
  }

  /**
   * Get error message for a field
   */
  getFieldError(fieldName: string): string {
    const control = this.petForm.get(fieldName);
    if (!control?.touched || !control?.errors) return '';

    if (control.errors['required']) {
      return 'Campo obbligatorio';
    }
    if (control.errors['minlength']) {
      return `Minimo ${control.errors['minlength'].requiredLength} caratteri`;
    }
    return '';
  }

  /**
   * Trigger file input click
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.uploadError.set('Formato non supportato. Usa JPG, PNG o WebP.');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.uploadError.set('File troppo grande (max 5MB)');
        return;
      }

      this.selectedFile = file;
      this.uploadError.set(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Remove selected photo
   */
  removePhoto(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.photoPreview.set(null);
    this.uploadError.set(null);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  /**
   * Submit form and create pet
   */
  async onSubmit(): Promise<void> {
    if (!this.isFormValid || this.isLoading()) return;

    // Mark all fields as touched to show validation errors
    Object.keys(this.petForm.controls).forEach(key => {
      this.petForm.get(key)?.markAsTouched();
    });

    if (!this.petForm.valid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.petForm.value;

    // Species ID is now directly from backend (selected from speciesOptions)
    const request: PetCreateRequest = {
      speciesId: formValue.specie,
      name: formValue.nome,
      sex: formValue.sesso,
      birthDate: formValue.dataNascita || null,
      origin: formValue.razza || null,
      color: formValue.colore || null,
      weight: formValue.peso ? parseFloat(formValue.peso) : null,
      specialMarks: formValue.segniParticolari || null,
    };

    this.petService.createPet(request).subscribe({
      next: (pet) => {
        // Upload photo if selected
        if (this.selectedFile && pet.id) {
          this.isUploading.set(true);
          this.petService.uploadPhoto(pet.id, this.selectedFile, true).subscribe({
            next: () => {
              this.completeRegistration();
            },
            error: () => {
              // Photo upload failed but pet was created, proceed anyway
              console.warn('Photo upload failed, but pet was created successfully');
              this.completeRegistration();
            },
          });
        } else {
          this.completeRegistration();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Errore durante la registrazione. Riprova.'
        );
      },
    });
  }

  /**
   * Complete registration and navigate to home
   */
  private completeRegistration(): void {
    this.authService.markOnboardingComplete();
    this.isLoading.set(false);
    this.isUploading.set(false);
    this.router.navigate(['/home/main']);
  }
}
