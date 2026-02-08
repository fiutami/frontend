import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetService } from '../../../core/services/pet.service';
import { BreedFacts, PetProfile, PetResponse } from '../../../core/models/pet.models';

type NeedLevel = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-your-breed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './your-breed.component.html',
  styleUrls: ['./your-breed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YourBreedComponent implements OnInit {
  private readonly petService = inject(PetService);

  readonly pet = signal<PetResponse | null>(null);
  readonly profile = signal<PetProfile | null>(null);
  readonly breedFacts = signal<BreedFacts | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly hasPet = computed(() => !!this.pet());
  readonly hasBreed = computed(() => !!this.profile()?.breedId);

  constructor() {
    effect(() => {
      const selectedPet = this.petService.selectedPet();
      if (selectedPet) {
        this.pet.set(selectedPet);
        this.loadPetProfile(selectedPet.id);
      } else {
        this.isLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    const selectedPet = this.petService.selectedPet();
    if (!selectedPet) {
      this.isLoading.set(false);
    }
  }

  private loadPetProfile(petId: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.petService.getPetProfile(petId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        if (profile.breedId) {
          this.loadBreedFacts(profile.breedId);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.error.set('Impossibile caricare il profilo del pet');
        this.isLoading.set(false);
        console.error('Error loading pet profile:', err);
      }
    });
  }

  private loadBreedFacts(breedId: string): void {
    this.petService.getBreedFacts(breedId).subscribe({
      next: (facts) => {
        this.breedFacts.set(facts);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error loading breed facts:', err);
      }
    });
  }

  getNeedLevelLabel(level: NeedLevel): string {
    const labels: Record<NeedLevel, string> = {
      low: 'Basso',
      medium: 'Medio',
      high: 'Alto'
    };
    return labels[level] || level;
  }

  getNeedLevelClass(level: NeedLevel): string {
    return `your-breed__need--${level}`;
  }
}
