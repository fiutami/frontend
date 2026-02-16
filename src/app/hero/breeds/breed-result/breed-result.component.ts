import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { BreedsService } from '../breeds.service';
import { Breed, InfoSection } from '../models/breed.model';
import { SpeciesInfoService, InsightSection } from '../../../core/services/species-info.service';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default/tab-page-shell-default.component';

@Component({
  selector: 'app-breed-result',
  standalone: true,
  imports: [CommonModule, RouterLink, TabPageShellDefaultComponent],
  templateUrl: './breed-result.component.html',
  styleUrls: ['./breed-result.component.scss']
})
export class BreedResultComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly breedsService = inject(BreedsService);
  private readonly speciesInfoService = inject(SpeciesInfoService);

  // State
  readonly breed = signal<Breed | null>(null);
  readonly isLoading = this.breedsService.isLoading;
  readonly error = this.breedsService.error;
  readonly expandedSectionId = signal<string | null>(null);

  // Info sections from backend
  readonly infoSections = signal<InfoSection[]>([]);

  // Computed values
  readonly speciesName = computed(() => {
    const breedData = this.breed();
    if (!breedData) return '';
    const species = this.breedsService.getSpeciesById(breedData.speciesId);
    return species?.name || '';
  });

  ngOnInit(): void {
    // Load insight sections from backend
    this.loadInsightSections();

    // Get breed ID from route
    this.route.params.subscribe(params => {
      const breedId = params['id'];
      if (breedId) {
        // Check if breed is already loaded in service (e.g. synthetic species entry)
        const existing = this.breedsService.selectedBreed();
        if (existing && existing.id === breedId) {
          this.breed.set(existing);
        } else {
          this.loadBreed(breedId);
        }
      }
    });
  }

  private loadInsightSections(): void {
    this.speciesInfoService.getInsightSections().subscribe({
      next: (sections) => {
        // Map backend InsightSection to frontend InfoSection format
        const mapped: InfoSection[] = sections
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(s => ({
            id: s.code,
            icon: s.icon,
            title: s.titleIt || s.title
          }));
        this.infoSections.set(mapped);
      },
      error: (err) => {
        console.error('Error loading insight sections:', err);
        // Use defaults
        this.infoSections.set([
          { id: 'dna', icon: 'biotech', title: 'DNA Bestiale' },
          { id: 'size', icon: 'straighten', title: 'Stazza & Pelliccia' },
          { id: 'temperament', icon: 'pets', title: 'Indole da Zampa' },
          { id: 'rituals', icon: 'schedule', title: 'Rituali' },
          { id: 'health', icon: 'healing', title: 'Rischi di salute' },
          { id: 'history', icon: 'auto_stories', title: 'Oltre l\'aspetto' },
        ]);
      }
    });
  }

  private loadBreed(breedId: string): void {
    this.breedsService.getBreedDetails(breedId).subscribe({
      next: (result) => {
        this.breed.set(result);
      },
      error: (err) => {
        console.error('Error loading breed:', err);
      }
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
        return `${breedData.dna.genetics}\nGruppo: ${breedData.dna.groupFCI || 'N/A'}\nAncestori: ${breedData.dna.ancestralBreeds?.join(', ') || 'N/A'}`;

      case 'size':
        if (!breedData.size) return null;
        return `Altezza: ${breedData.size.height.min}-${breedData.size.height.max} ${breedData.size.height.unit}\nPeso: ${breedData.size.weight.min}-${breedData.size.weight.max} ${breedData.size.weight.unit}\nPelo: ${breedData.size.coat}\nColori: ${breedData.size.colors.join(', ')}`;

      case 'temperament':
        if (!breedData.temperament) return null;
        return `Energia: ${breedData.temperament.energy}\nSocialità: ${breedData.temperament.sociality}\nAddestrabilità: ${breedData.temperament.trainability}\nTratti: ${breedData.temperament.traits.join(', ')}`;

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

  goBack(): void {
    this.location.back();
  }

  goToFinder(): void {
    this.router.navigate(['/home/breeds/finder']);
  }

  trackBySection(index: number, section: InfoSection): string {
    return section.id;
  }
}
