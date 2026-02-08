import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TabPageShellPetProfileComponent } from '../../shared/components/tab-page-shell-pet-profile';
import { environment } from '../../../environments/environment';
import { PetService } from '../../core/services/pet.service';
import { PetResponse } from '../../core/models/pet.models';

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TabPageShellPetProfileComponent,
  ],
  templateUrl: './pet-profile.component.html',
  styleUrl: './pet-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetProfileComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly petService = inject(PetService);
  private readonly translate = inject(TranslateService);

  /** Pet data loaded from API */
  pet = signal<PetResponse | null>(null);

  /** Loading state */
  isLoading = signal(true);

  /** Error state */
  error = signal<string | null>(null);

  /** Display name */
  petName = computed(() => this.pet()?.name ?? '');

  /** Display breed + age */
  petSubtitle = computed(() => {
    const p = this.pet();
    if (!p) return '';
    return `${p.speciesName} · ${p.calculatedAge}`;
  });

  /** Profile photo URL */
  photoUrl = computed(() => this.pet()?.profilePhotoUrl ?? null);

  ngOnInit(): void {
    const petId = this.route.snapshot.paramMap.get('id');
    if (petId) {
      this.loadPet(petId);
    } else if (!environment.production) {
      // Dev fallback: show preview without API
      this.pet.set(FALLBACK_PET);
      this.isLoading.set(false);
    } else {
      this.error.set('pet_profile.errors.no_id');
      this.isLoading.set(false);
    }
  }

  private loadPet(petId: string): void {
    this.petService.getPet(petId).subscribe({
      next: (pet) => {
        this.pet.set(pet);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[PetProfile] Failed to load pet, using fallback:', err);
        if (!environment.production) {
          this.pet.set(FALLBACK_PET);
        } else {
          this.error.set('pet_profile.errors.load_failed');
        }
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}

/** Dev-only fallback when backend is unavailable */
const FALLBACK_PET: PetResponse = {
  id: 'fallback-001',
  userId: 'dev-user',
  speciesId: 'sp-dog',
  speciesName: 'Cane',
  speciesCategory: 'dog',
  name: 'LUNA',
  sex: 'F',
  birthDate: '2020-03-15',
  calculatedAge: '5 anni',
  profilePhotoUrl: 'assets/images/species/species-cane.png',
  photoCount: 3,
  status: 'active',
  isNeutered: true,
  microchip: '380260000123456',
  color: 'Bianco e marrone',
  weight: 12,
  notes: null,
  createdAt: '2024-06-01T10:00:00Z',
  updatedAt: '2025-01-15T14:30:00Z',
};
