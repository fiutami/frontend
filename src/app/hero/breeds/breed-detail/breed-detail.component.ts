import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TabPageShellBlueComponent } from '../../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';
import { BreedsService } from '../breeds.service';
import { SpeciesInfoService, InsightSection } from '../../../core/services/species-info.service';
import { Breed, InfoSection } from '../models/breed.model';

@Component({
  selector: 'app-breed-detail',
  standalone: true,
  imports: [CommonModule, TabPageShellBlueComponent],
  templateUrl: './breed-detail.component.html',
  styleUrls: ['./breed-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly breedsService = inject(BreedsService);
  private readonly speciesInfoService = inject(SpeciesInfoService);

  // State
  readonly breed = signal<Breed | null>(null);
  readonly isLoading = signal(true);
  readonly infoSections = signal<InfoSection[]>([]);

  // Computed
  readonly breedName = computed(() => this.breed()?.name || 'Dettaglio Razza');

  readonly heroImageUrl = computed(() => {
    const b = this.breed();
    return b?.imageUrl || 'assets/images/breeds/placeholder-breed.png';
  });

  readonly originLabel = computed(() => {
    const b = this.breed();
    return b?.origin || 'Sconosciuta';
  });

  ngOnInit(): void {
    this.loadInsightSections();

    const breedId = this.route.snapshot.paramMap.get('breedId');
    if (breedId) {
      this.loadBreed(breedId);
    }
  }

  private loadInsightSections(): void {
    this.speciesInfoService.getInsightSections().subscribe({
      next: (sections) => {
        const mapped: InfoSection[] = sections
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((s) => ({
            id: s.code,
            icon: s.icon,
            title: s.titleIt || s.title,
          }));
        this.infoSections.set(mapped);
      },
      error: () => {
        this.infoSections.set([
          { id: 'dna', icon: 'biotech', title: 'DNA Bestiale' },
          { id: 'size', icon: 'straighten', title: 'Stazza & Pelliccia' },
          { id: 'temperament', icon: 'pets', title: 'Indole da Zampa' },
          { id: 'rituals', icon: 'schedule', title: 'Rituali' },
          { id: 'health', icon: 'healing', title: 'Rischi, limiti e rogne' },
          { id: 'history', icon: 'auto_stories', title: 'Oltre il Pedigree' },
        ]);
      },
    });
  }

  private loadBreed(breedId: string): void {
    this.isLoading.set(true);
    this.breedsService.getBreedDetails(breedId).subscribe({
      next: (result) => {
        this.breed.set(result);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  goToSection(sectionCode: string): void {
    const breedId = this.breed()?.id;
    if (breedId) {
      this.router.navigate(['/home/breeds/detail', breedId, sectionCode]);
    }
  }

  goBack(): void {
    this.location.back();
  }

  trackBySection(_index: number, section: InfoSection): string {
    return section.id;
  }
}
