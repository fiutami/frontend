import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TabPageShellBlueComponent } from '../../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';
import { BreedsService } from '../breeds.service';
import { SpeciesInfoService } from '../../../core/services/species-info.service';
import { Breed, InfoSection } from '../models/breed.model';

interface SectionData {
  label: string;
  value: string;
}

@Component({
  selector: 'app-breed-section-detail',
  standalone: true,
  imports: [CommonModule, TabPageShellBlueComponent],
  templateUrl: './breed-section-detail.component.html',
  styleUrls: ['./breed-section-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedSectionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly breedsService = inject(BreedsService);
  private readonly speciesInfoService = inject(SpeciesInfoService);

  // State
  readonly breed = signal<Breed | null>(null);
  readonly isLoading = signal(true);
  readonly sectionCode = signal<string>('');
  readonly sectionMeta = signal<InfoSection | null>(null);

  // Computed — hero
  readonly breedName = computed(() => this.breed()?.name || '');

  readonly heroImageUrl = computed(() => {
    const b = this.breed();
    return b?.imageUrl || 'assets/images/breeds/placeholder-breed.png';
  });

  readonly originLabel = computed(() => {
    const b = this.breed();
    return b?.origin || 'Sconosciuta';
  });

  // Computed — section
  readonly sectionTitle = computed(() => this.sectionMeta()?.title || this.getFallbackTitle());
  readonly sectionIcon = computed(() => this.sectionMeta()?.icon || this.getFallbackIcon());

  readonly sectionContent = computed<string>(() => {
    const b = this.breed();
    if (!b) return '';
    const code = this.sectionCode();
    let result: string | null = null;

    switch (code) {
      case 'dna':
        if (b.dna) {
          const dnaParts: string[] = [];
          if (b.dna.genetics) dnaParts.push(b.dna.genetics);
          if (b.dna.groupFCI) dnaParts.push(`Gruppo FCI: ${b.dna.groupFCI}`);
          if (b.dna.ancestralBreeds?.length) dnaParts.push(`Ancestori: ${b.dna.ancestralBreeds.join(', ')}`);
          result = dnaParts.length > 0 ? dnaParts.join('\n\n') : null;
        }
        break;

      case 'size':
        if (b.size) {
          const sizeParts: string[] = [];
          if (b.size.weight.min || b.size.weight.max) {
            sizeParts.push(`Peso: ${b.size.weight.min}-${b.size.weight.max} ${b.size.weight.unit}`);
          }
          if (b.size.height.min || b.size.height.max) {
            sizeParts.push(`Altezza: ${b.size.height.min}-${b.size.height.max} ${b.size.height.unit}`);
          }
          if (b.size.coat) sizeParts.push(`Pelo: ${b.size.coat}`);
          if (b.size.colors?.length) sizeParts.push(`Colori: ${b.size.colors.join(', ')}`);
          if (b.size.lifespan) sizeParts.push(`Aspettativa di vita: ${b.size.lifespan.min}-${b.size.lifespan.max} anni`);
          result = sizeParts.length > 0 ? sizeParts.join('\n\n') : null;
        }
        break;

      case 'temperament':
        if (b.temperament) {
          const tempParts: string[] = [];
          tempParts.push(`Energia: ${b.temperament.energy}`);
          tempParts.push(`Socialità: ${b.temperament.sociality}`);
          tempParts.push(`Addestrabilità: ${b.temperament.trainability}`);
          if (b.temperament.traits?.length) tempParts.push(`Tratti: ${b.temperament.traits.join(', ')}`);
          if (b.temperament.suitableFor?.length) tempParts.push(`Adatto a: ${b.temperament.suitableFor.join(', ')}`);
          result = tempParts.join('\n\n');
        }
        break;

      case 'rituals':
        result = b.rituals?.filter(Boolean).join('\n\n') || null;
        break;

      case 'health':
        result = b.healthRisks?.filter(Boolean).join('\n\n') || null;
        break;

      case 'history':
        result = b.history || null;
        break;
    }

    return result || '';
  });

  ngOnInit(): void {
    const breedId = this.route.snapshot.paramMap.get('breedId') || '';
    const code = this.route.snapshot.paramMap.get('sectionCode') || '';
    this.sectionCode.set(code);

    this.loadSectionMeta(code);

    if (breedId) {
      this.loadBreed(breedId);
    }
  }

  private loadSectionMeta(code: string): void {
    this.speciesInfoService.getInsightSections().subscribe({
      next: (sections) => {
        const match = sections.find((s) => s.code === code);
        if (match) {
          this.sectionMeta.set({
            id: match.code,
            icon: match.icon,
            title: match.titleIt || match.title,
          });
        }
      },
    });
  }

  private loadBreed(breedId: string): void {
    // Try cached breed first
    const cached = this.breedsService.selectedBreed();
    if (cached && cached.id === breedId) {
      this.breed.set(cached);
      this.isLoading.set(false);
      return;
    }

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

  private getFallbackTitle(): string {
    const map: Record<string, string> = {
      dna: 'DNA Bestiale',
      size: 'Stazza & Pelliccia',
      temperament: 'Indole da Zampa',
      rituals: 'Rituali',
      health: 'Rischi, limiti e rogne',
      history: 'Oltre il Pedigree',
    };
    return map[this.sectionCode()] || 'Dettaglio';
  }

  private getFallbackIcon(): string {
    const map: Record<string, string> = {
      dna: 'biotech',
      size: 'straighten',
      temperament: 'pets',
      rituals: 'schedule',
      health: 'healing',
      history: 'auto_stories',
    };
    return map[this.sectionCode()] || 'info';
  }

  goBack(): void {
    this.location.back();
  }
}
