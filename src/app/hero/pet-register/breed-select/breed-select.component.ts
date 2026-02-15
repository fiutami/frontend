import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default/tab-page-shell-default.component';
import { SpeciesDto } from '../../species-questionnaire/species-questionnaire.service';
import { environment } from '../../../../environments/environment';

interface BreedSummary {
  id: string;
  speciesId: string;
  speciesName: string;
  name: string;
  origin: string | null;
  imageUrl: string | null;
  popularity: number;
  breedType: string;
  allowsUserVariantLabel: boolean;
}

interface BreedListResponse {
  breeds: BreedSummary[];
  totalCount: number;
}

/**
 * BreedSelectComponent - Breed Selection for Pet Registration
 *
 * Shown after species selection when the species has breedPolicy != 'None'.
 * Loads breeds from GET /api/breed?speciesId=... and lets the user pick one.
 */
@Component({
  selector: 'app-breed-select',
  standalone: true,
  imports: [CommonModule, TabPageShellDefaultComponent],
  templateUrl: './breed-select.component.html',
  styleUrls: ['./breed-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedSelectComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  /** Species selected in previous step */
  speciesDto: SpeciesDto | null = null;

  /** Breeds loaded from API */
  breeds = signal<BreedSummary[]>([]);

  /** Loading state */
  isLoading = signal(true);

  /** Error message */
  loadError = signal<string | null>(null);

  /** Selected breed */
  selectedBreed = signal<BreedSummary | null>(null);

  /** Meticcio breed (shown separately) */
  meticcioBeed = computed(() =>
    this.breeds().find(b => b.breedType === 'Mixed')
  );

  /** Pure breeds (excluding meticcio) */
  pureBreeds = computed(() =>
    this.breeds().filter(b => b.breedType !== 'Mixed')
  );

  async ngOnInit(): Promise<void> {
    const stored = sessionStorage.getItem('selectedSpecies');
    if (stored) {
      try {
        this.speciesDto = JSON.parse(stored) as SpeciesDto;
      } catch {
        this.speciesDto = null;
      }
    }

    if (!this.speciesDto) {
      this.router.navigate(['/home/pet-register/specie']);
      return;
    }

    await this.loadBreeds();
  }

  private async loadBreeds(): Promise<void> {
    if (!this.speciesDto) return;

    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const res = await firstValueFrom(
        this.http.get<BreedListResponse>(
          `${environment.apiUrl}/breed`,
          { params: { speciesId: this.speciesDto.id, take: '100' } }
        )
      );
      this.breeds.set(res.breeds);
    } catch (error) {
      console.error('Failed to load breeds:', error);
      this.loadError.set('Impossibile caricare le razze. Riprova.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onBack(): void {
    this.router.navigate(['/home/pet-register/specie']);
  }

  selectBreed(breed: BreedSummary): void {
    this.selectedBreed.set(breed);
    sessionStorage.setItem('selectedBreed', JSON.stringify(breed));
    this.router.navigate(['/home/pet-register/details']);
  }

  skipBreed(): void {
    sessionStorage.removeItem('selectedBreed');
    this.router.navigate(['/home/pet-register/details']);
  }

  isBreedSelected(breedId: string): boolean {
    return this.selectedBreed()?.id === breedId;
  }

  async retry(): Promise<void> {
    await this.loadBreeds();
  }
}
