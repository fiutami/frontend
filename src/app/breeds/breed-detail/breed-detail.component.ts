import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { BreedsService } from '../../hero/breeds/breeds.service';
import { Breed } from '../../hero/breeds/models/breed.model';

@Component({
  selector: 'app-breed-detail',
  standalone: true,
  imports: [CommonModule, SharedModule, TranslateModule],
  templateUrl: './breed-detail.component.html',
  styleUrls: ['./breed-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly breedsService = inject(BreedsService);
  private readonly destroyRef = inject(DestroyRef);

  protected breed = signal<Breed | null>(null);
  protected loading = signal<boolean>(false);
  protected error = signal<string | null>(null);

  // Tab management
  readonly activeTab = signal<'overview' | 'size' | 'health' | 'history'>('overview');

  readonly tabs = [
    { id: 'overview' as const, labelKey: 'breedDetail.overview' },
    { id: 'size' as const, labelKey: 'breedDetail.size' },
    { id: 'health' as const, labelKey: 'breedDetail.health' },
    { id: 'history' as const, labelKey: 'breedDetail.history' },
  ];

  setTab(tab: 'overview' | 'size' | 'health' | 'history'): void {
    this.activeTab.set(tab);
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.error.set('ID razza mancante');
          return [];
        }
        this.loading.set(true);
        this.error.set(null);
        return this.breedsService.getBreedDetails(id);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (breed) => {
        this.breed.set(breed ?? null);
        if (!breed) {
          this.error.set('Razza non trovata');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Errore nel caricamento');
        this.loading.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/home/species']);
  }

  onSelectBreed(): void {
    const breed = this.breed();
    if (breed) {
      this.router.navigate(['/onboarding/register-pet'], {
        queryParams: { breed: breed.id },
      });
    }
  }
}
