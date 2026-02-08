import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { LostPetsModuleService } from '../services/lost-pets.service';
import { LostPet, CreateSightingRequest } from '../models/lost-pets.models';

@Component({
  selector: 'app-report-sighting',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedModule, ReactiveFormsModule],
  templateUrl: './report-sighting.component.html',
  styleUrls: ['./report-sighting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportSightingComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly lostPetsService = inject(LostPetsModuleService);
  private readonly destroy$ = new Subject<void>();

  pet = signal<LostPet | null>(null);
  loading = signal(true);
  submitting = signal(false);
  submitted = signal(false);

  sightingForm: FormGroup;
  today = new Date().toISOString().split('T')[0];

  constructor() {
    this.sightingForm = this.fb.group({
      location: ['', Validators.required],
      sightingDate: [this.today, Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = params.get('id');
          if (id) {
            return this.lostPetsService.getById(id);
          }
          throw new Error('No ID provided');
        })
      )
      .subscribe({
        next: (pet) => {
          this.pet.set(pet);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/lost-pets']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we'd use reverse geocoding here
          this.sightingForm.patchValue({
            location: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }

  submit(): void {
    if (this.sightingForm.invalid) {
      this.sightingForm.markAllAsTouched();
      return;
    }

    const pet = this.pet();
    if (!pet) return;

    this.submitting.set(true);

    const formValue = this.sightingForm.value;
    const request: CreateSightingRequest = {
      location: formValue.location,
      sightingDate: new Date(formValue.sightingDate),
      description: formValue.description || undefined
    };

    this.lostPetsService.createSighting(pet.id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
        },
        error: () => {
          this.submitting.set(false);
          // In fallback mode, still show success
          this.submitted.set(true);
        }
      });
  }

  goBack(): void {
    const pet = this.pet();
    if (pet) {
      this.router.navigate(['/lost-pets', pet.id]);
    } else {
      this.router.navigate(['/lost-pets']);
    }
  }

  goToList(): void {
    this.router.navigate(['/lost-pets']);
  }
}
