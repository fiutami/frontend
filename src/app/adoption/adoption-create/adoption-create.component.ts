import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AdoptionService } from '../services/adoption.service';
import { CreateAdoptionRequest } from '../models/adoption.models';
import { PetService } from '../../core/services/pet.service';
import { PetSummaryResponse } from '../../core/models/pet.models';

@Component({
  selector: 'app-adoption-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './adoption-create.component.html',
  styleUrls: ['./adoption-create.component.scss']
})
export class AdoptionCreateComponent implements OnInit, OnDestroy {
  form: FormGroup;
  userPets: PetSummaryResponse[] = [];
  loading = false;
  loadingPets = true;
  submitting = false;
  error = '';
  isEditMode = false;
  editId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private adoptionService: AdoptionService,
    private petService: PetService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      petId: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      adoptionFee: [null],
      location: ['', Validators.required],
      city: [''],
      requirements: [''],
      allowMessages: [true]
    });
  }

  ngOnInit() {
    // Check if edit mode
    this.editId = this.route.snapshot.queryParamMap.get('edit');
    this.isEditMode = !!this.editId;

    this.loadUserPets();

    if (this.isEditMode && this.editId) {
      this.loadExistingAdoption(this.editId);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserPets() {
    this.loadingPets = true;

    this.petService.loadPets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.userPets = response.pets || [];
          this.loadingPets = false;
        },
        error: () => {
          this.loadingPets = false;
          this.error = 'errors.serverError';
        }
      });
  }

  loadExistingAdoption(id: string) {
    this.loading = true;

    this.adoptionService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (adoption) => {
          this.form.patchValue({
            petId: adoption.petId,
            description: adoption.description,
            adoptionFee: adoption.adoptionFee,
            location: adoption.location,
            city: adoption.city,
            requirements: adoption.requirements,
            allowMessages: adoption.allowMessages
          });
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = 'errors.notFound';
        }
      });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';

    const request: CreateAdoptionRequest = {
      petId: this.form.value.petId,
      description: this.form.value.description,
      adoptionFee: this.form.value.adoptionFee || undefined,
      location: this.form.value.location,
      city: this.form.value.city || undefined,
      requirements: this.form.value.requirements || undefined,
      allowMessages: this.form.value.allowMessages
    };

    const operation$ = this.isEditMode && this.editId
      ? this.adoptionService.update(this.editId, request)
      : this.adoptionService.create(request);

    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (adoption) => {
          this.submitting = false;
          this.router.navigate(['/adoption', adoption.id]);
        },
        error: () => {
          this.submitting = false;
          this.error = 'errors.serverError';
        }
      });
  }

  goBack() {
    this.router.navigate(['/adoption']);
  }

  getSelectedPet(): PetSummaryResponse | undefined {
    const petId = this.form.value.petId;
    return this.userPets.find(p => p.id === petId);
  }
}
