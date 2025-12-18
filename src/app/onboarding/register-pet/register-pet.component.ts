import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PetService, PetCreateRequest, AuthService } from '../../core';

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
export class RegisterPetComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly petService = inject(PetService);
  private readonly authService = inject(AuthService);

  /** Loading state */
  protected isLoading = signal(false);

  /** Error message */
  protected errorMessage = signal<string | null>(null);

  /** Species options */
  protected readonly speciesOptions = [
    { value: 'dog', label: 'Cane' },
    { value: 'cat', label: 'Gatto' },
    { value: 'other', label: 'Altro' },
  ];

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

    // Map species to backend ID (placeholder - in production would fetch from API)
    const speciesIdMap: Record<string, string> = {
      dog: '00000000-0000-0000-0000-000000000001',
      cat: '00000000-0000-0000-0000-000000000002',
      other: '00000000-0000-0000-0000-000000000003',
    };

    const request: PetCreateRequest = {
      speciesId: speciesIdMap[formValue.specie] || speciesIdMap['other'],
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
        // Mark onboarding as complete
        this.authService.markOnboardingComplete();

        // Navigate to main home
        this.isLoading.set(false);
        this.router.navigate(['/home/main']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Errore durante la registrazione. Riprova.'
        );
      },
    });
  }
}
