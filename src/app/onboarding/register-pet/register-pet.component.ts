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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { PetService, PetCreateRequest, AuthService } from '../../core';
import { BreedsService } from '../../hero/breeds/breeds.service';
import { Species, Breed } from '../../hero/breeds/models/breed.model';
import { BackgroundRemovalService } from '../../core/services/background-removal.service';

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
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly petService = inject(PetService);
  private readonly authService = inject(AuthService);
  private readonly breedsService = inject(BreedsService);
  private readonly bgRemovalService = inject(BackgroundRemovalService);

  /** File input reference */
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /** Max pets limit */
  readonly MAX_PETS = 2;

  /** Whether user has reached max pets */
  readonly maxPetsReached = signal(false);

  /** Loading state */
  protected isLoading = signal(false);

  /** Uploading state */
  protected isUploading = signal(false);

  /** Error message */
  protected errorMessage = signal<string | null>(null);

  /** Selected photo file */
  protected selectedFile: File | null = null;

  /** Original file before bg removal */
  private originalFile: File | null = null;

  /** Processed file with bg removed */
  private processedFile: File | null = null;

  /** Original preview URL */
  private originalPreview: string | null = null;

  /** Processed preview URL */
  private processedPreview: string | null = null;

  /** Background removal toggle */
  protected removeBgEnabled = signal(true);

  /** Background removal in progress */
  protected isRemovingBg = signal(false);

  /** Whether the current preview has bg removed */
  protected isBgRemoved = signal(false);

  /** Photo preview URL */
  protected photoPreview = signal<string | null>(null);

  /** Upload error */
  protected uploadError = signal<string | null>(null);

  /** Species from backend */
  protected backendSpecies = signal<Species[]>([]);

  /** Breeds for selected species */
  protected breeds = signal<Breed[]>([]);

  /** Loading species state */
  protected isLoadingSpecies = signal(false);

  /** Loading breeds state */
  protected isLoadingBreeds = signal(false);

  /** Species load error */
  protected speciesError = signal<string | null>(null);

  /** Breed policy for the currently selected species */
  protected selectedBreedPolicy = signal<'None' | 'Optional' | 'Required'>('Optional');

  /** Whether the selected breed allows a user variant label */
  protected showVariantLabel = signal(false);

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
    variantLabel: [''],
    sesso: ['', Validators.required],
    dataNascita: [''],
    peso: [''],
    colore: [''],
    segniParticolari: [''],
  });

  /**
   * Load species from backend on init
   */
  ngOnInit(): void {
    // Check if user has reached max pets
    this.petService.loadPets().subscribe({
      next: (res: any) => {
        const pets = res?.pets || res || [];
        if (Array.isArray(pets) && pets.length >= this.MAX_PETS) {
          this.maxPetsReached.set(true);
        }
      },
      error: () => { /* ignore - allow registration anyway */ }
    });

    this.isLoadingSpecies.set(true);
    this.speciesError.set(null);

    this.breedsService.loadSpecies().subscribe({
      next: (species) => {
        if (species.length === 0) {
          this.speciesError.set(this.translate.instant('onboarding.registerPetErrors.noSpeciesAvailable'));
        } else {
          this.backendSpecies.set(species);
        }
        this.isLoadingSpecies.set(false);
      },
      error: (err) => {
        console.error('Failed to load species:', err);
        this.speciesError.set(this.translate.instant('onboarding.registerPetErrors.speciesLoadError'));
        this.isLoadingSpecies.set(false);
      }
    });

    // Listen for species changes to load breeds and update breed policy
    this.petForm.get('specie')?.valueChanges.subscribe(speciesId => {
      if (speciesId) {
        const species = this.backendSpecies().find(s => s.id === speciesId);
        const policy = species?.breedPolicy ?? 'Optional';
        this.selectedBreedPolicy.set(policy);

        // Update breed field validators based on policy
        const breedControl = this.petForm.get('razza');
        if (policy === 'Required') {
          breedControl?.setValidators(Validators.required);
        } else {
          breedControl?.clearValidators();
        }
        breedControl?.updateValueAndValidity();

        if (policy !== 'None') {
          this.loadBreedsForSpecies(speciesId);
        } else {
          this.breeds.set([]);
          breedControl?.setValue('');
          this.showVariantLabel.set(false);
        }
      } else {
        this.breeds.set([]);
        this.selectedBreedPolicy.set('Optional');
        this.showVariantLabel.set(false);
      }
    });

    // Listen for breed changes to show/hide variant label
    this.petForm.get('razza')?.valueChanges.subscribe(breedId => {
      if (breedId) {
        const breed = this.breeds().find(b => b.id === breedId);
        this.showVariantLabel.set(breed?.allowsUserVariantLabel ?? false);
      } else {
        this.showVariantLabel.set(false);
      }
      // Clear variant label when breed changes
      this.petForm.get('variantLabel')?.setValue('');
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

      this.uploadError.set(null);

      // Reset previous state
      this.originalFile = file;
      this.processedFile = null;
      this.processedPreview = null;
      this.isBgRemoved.set(false);

      // Create original preview
      const reader = new FileReader();
      reader.onload = () => {
        this.originalPreview = reader.result as string;
        this.photoPreview.set(this.originalPreview);
        this.selectedFile = file;

        // Auto-process bg removal if toggle is on
        if (this.removeBgEnabled()) {
          this.processBackgroundRemoval(file);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Toggle background removal on/off
   */
  toggleRemoveBg(): void {
    this.removeBgEnabled.update(v => !v);

    if (!this.originalFile) return;

    if (this.removeBgEnabled()) {
      // Turning ON: use processed version if available, otherwise process
      if (this.processedFile && this.processedPreview) {
        this.selectedFile = this.processedFile;
        this.photoPreview.set(this.processedPreview);
        this.isBgRemoved.set(true);
      } else {
        this.processBackgroundRemoval(this.originalFile);
      }
    } else {
      // Turning OFF: revert to original
      this.selectedFile = this.originalFile;
      this.photoPreview.set(this.originalPreview);
      this.isBgRemoved.set(false);
    }
  }

  /**
   * Process background removal on the given file
   */
  private async processBackgroundRemoval(file: File): Promise<void> {
    this.isRemovingBg.set(true);
    try {
      const resultBlob = await this.bgRemovalService.removeBackground(file);
      this.processedFile = new File([resultBlob], file.name.replace(/\.\w+$/, '.png'), {
        type: 'image/png',
      });

      // Create preview for processed file
      const reader = new FileReader();
      reader.onload = () => {
        this.processedPreview = reader.result as string;
        // Only apply if toggle is still on
        if (this.removeBgEnabled()) {
          this.selectedFile = this.processedFile;
          this.photoPreview.set(this.processedPreview);
          this.isBgRemoved.set(true);
        }
        this.isRemovingBg.set(false);
      };
      reader.readAsDataURL(this.processedFile);
    } catch (err) {
      console.error('Background removal failed:', err);
      this.uploadError.set('Rimozione sfondo fallita. Foto originale mantenuta.');
      this.isRemovingBg.set(false);
    }
  }

  /**
   * Remove selected photo
   */
  removePhoto(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.originalFile = null;
    this.processedFile = null;
    this.originalPreview = null;
    this.processedPreview = null;
    this.photoPreview.set(null);
    this.uploadError.set(null);
    this.isBgRemoved.set(false);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  /**
   * Submit form and create pet
   */
  async onSubmit(): Promise<void> {
    if (!this.isFormValid || this.isLoading() || this.isRemovingBg()) return;

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
      breedId: formValue.razza || null,
      breedVariantLabel: formValue.variantLabel?.trim() || null,
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
