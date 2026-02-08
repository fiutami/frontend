import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { LostPetsModuleService } from '../services/lost-pets.service';
import { PetService } from '../../core/services/pet.service';
import { CreateLostPetRequest } from '../models/lost-pets.models';

interface UserPet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  photoUrl?: string;
}

@Component({
  selector: 'app-report-lost',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedModule, ReactiveFormsModule],
  templateUrl: './report-lost.component.html',
  styleUrls: ['./report-lost.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportLostComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly lostPetsService = inject(LostPetsModuleService);
  private readonly petService = inject(PetService);
  private readonly destroy$ = new Subject<void>();

  userPets = signal<UserPet[]>([]);
  selectedPet = signal<UserPet | null>(null);
  loading = signal(false);
  submitting = signal(false);
  currentStep = signal(1);

  reportForm: FormGroup;
  today = new Date().toISOString().split('T')[0];

  constructor() {
    this.reportForm = this.fb.group({
      petId: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      lastSeenLocation: ['', Validators.required],
      lastSeenCity: [''],
      lastSeenDate: [new Date().toISOString().split('T')[0], Validators.required],
      contactPhone: ['', Validators.pattern(/^\+?[\d\s-]+$/)],
      contactEmail: ['', Validators.email],
      reward: [null, [Validators.min(0), Validators.max(10000)]]
    });
  }

  ngOnInit(): void {
    this.loadUserPets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserPets(): void {
    this.loading.set(true);

    this.petService.loadPets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const pets: UserPet[] = response.pets.map((p: any) => ({
            id: p.id,
            name: p.name,
            species: p.species,
            breed: p.breed,
            photoUrl: p.photoUrl
          }));
          this.userPets.set(pets);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          // Mock data for development
          this.userPets.set([
            { id: '1', name: 'Luna', species: 'dog', breed: 'Golden Retriever', photoUrl: 'assets/images/pets/placeholder-dog.png' },
            { id: '2', name: 'Micio', species: 'cat', breed: 'Europeo', photoUrl: 'assets/images/pets/placeholder-cat.png' }
          ]);
        }
      });
  }

  selectPet(pet: UserPet): void {
    this.selectedPet.set(pet);
    this.reportForm.patchValue({ petId: pet.id });
    this.currentStep.set(2);
  }

  nextStep(): void {
    if (this.currentStep() < 3) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we'd use reverse geocoding here
          this.reportForm.patchValue({
            lastSeenLocation: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }

  submit(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const formValue = this.reportForm.value;
    const request: CreateLostPetRequest = {
      petId: formValue.petId,
      description: formValue.description,
      lastSeenLocation: formValue.lastSeenLocation,
      lastSeenCity: formValue.lastSeenCity,
      lastSeenDate: new Date(formValue.lastSeenDate),
      contactPhone: formValue.contactPhone || undefined,
      contactEmail: formValue.contactEmail || undefined,
      reward: formValue.reward ? Number(formValue.reward) : undefined
    };

    this.lostPetsService.create(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/lost-pets'], {
            queryParams: { success: 'created' }
          });
        },
        error: () => {
          this.submitting.set(false);
          // Show error message
        }
      });
  }

  goBack(): void {
    if (this.currentStep() > 1) {
      this.prevStep();
    } else {
      this.router.navigate(['/lost-pets']);
    }
  }

  trackByPet(index: number, pet: UserPet): string {
    return pet.id;
  }
}
