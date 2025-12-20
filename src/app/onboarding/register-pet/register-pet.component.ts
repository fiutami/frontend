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
import { SharedModule } from '../../shared/shared.module';
import { PetService, PetCreateRequest, AuthService } from '../../core';
import { SpeciesQuestionnaireService, SpeciesDto } from '../../hero/species-questionnaire/species-questionnaire.service';

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

  /** Loading species state */
  protected isLoadingSpecies = signal(false);

  /** Species options (computed from backend) */
  protected get speciesOptions(): { value: string; label: string }[] {
    const species = this.backendSpecies();
    if (species.length === 0) {
      // Fallback while loading
      return [
        { value: 'dog', label: 'Cane' },
        { value: 'cat', label: 'Gatto' },
        { value: 'other', label: 'Altro' },
      ];
    }
    return species.map(s => ({
      value: s.id,
      label: s.name
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
    try {
      const species = await this.speciesService.getAllSpecies();
      this.backendSpecies.set(species);
    } catch (error) {
      console.error('Failed to load species:', error);
    } finally {
      this.isLoadingSpecies.set(false);
    }
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
    return this.petForm.valid;
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
