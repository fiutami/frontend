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
  readonly isFavorite = signal(false);
  readonly expandedSectionId = signal<string | null>(null);
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

  readonly weightLabel = computed(() => {
    const size = this.breed()?.size;
    if (!size) return '--';
    return `${size.weight.min}-${size.weight.max} ${size.weight.unit}`;
  });

  readonly heightLabel = computed(() => {
    const size = this.breed()?.size;
    if (!size) return '--';
    return `${size.height.min}-${size.height.max} ${size.height.unit}`;
  });

  readonly coatLabel = computed(() => {
    const size = this.breed()?.size;
    return size?.coat || '--';
  });

  readonly energyLabel = computed(() => {
    const temperament = this.breed()?.temperament;
    if (!temperament) return '--';
    const map: Record<string, string> = {
      bassa: 'Bassa',
      media: 'Media',
      alta: 'Alta',
    };
    return map[temperament.energy] || temperament.energy;
  });

  readonly lifespanLabel = computed(() => {
    const size = this.breed()?.size;
    if (!size?.lifespan) return null;
    return `${size.lifespan.min}-${size.lifespan.max} anni`;
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
          { id: 'health', icon: 'healing', title: 'Rischi di salute' },
          { id: 'history', icon: 'auto_stories', title: "Oltre l'aspetto" },
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

  toggleSection(sectionId: string): void {
    if (this.expandedSectionId() === sectionId) {
      this.expandedSectionId.set(null);
    } else {
      this.expandedSectionId.set(sectionId);
    }
  }

  isSectionExpanded(sectionId: string): boolean {
    return this.expandedSectionId() === sectionId;
  }

  getSectionContent(sectionId: string): string | string[] | null {
    const breedData = this.breed();
    if (!breedData) return null;

    switch (sectionId) {
      case 'dna':
        if (!breedData.dna) return null;
        return `${breedData.dna.genetics}\nGruppo FCI: ${breedData.dna.groupFCI || 'N/A'}\nAncestori: ${breedData.dna.ancestralBreeds?.join(', ') || 'N/A'}`;

      case 'size':
        if (!breedData.size) return null;
        const parts = [
          `Altezza: ${breedData.size.height.min}-${breedData.size.height.max} ${breedData.size.height.unit}`,
          `Peso: ${breedData.size.weight.min}-${breedData.size.weight.max} ${breedData.size.weight.unit}`,
          `Pelo: ${breedData.size.coat}`,
          `Colori: ${breedData.size.colors.join(', ')}`,
        ];
        if (breedData.size.lifespan) {
          parts.push(`Aspettativa di vita: ${breedData.size.lifespan.min}-${breedData.size.lifespan.max} anni`);
        }
        return parts.join('\n');

      case 'temperament':
        if (!breedData.temperament) return null;
        return `Energia: ${breedData.temperament.energy}\nSocialit\u00e0: ${breedData.temperament.sociality}\nAddestrabilit\u00e0: ${breedData.temperament.trainability}\nTratti: ${breedData.temperament.traits.join(', ')}`;

      case 'rituals':
        return breedData.rituals || null;

      case 'health':
        return breedData.healthRisks || null;

      case 'history':
        return breedData.history || null;

      default:
        return null;
    }
  }

  toggleFavorite(): void {
    this.isFavorite.update((v) => !v);
  }

  goBack(): void {
    this.location.back();
  }

  goToFindPuppy(): void {
    this.router.navigate(['/home/breeds/finder']);
  }

  goToCompare(): void {
    // Placeholder: compare feature
    console.log('Compare breeds - coming soon');
  }

  trackBySection(_index: number, section: InfoSection): string {
    return section.id;
  }
}
