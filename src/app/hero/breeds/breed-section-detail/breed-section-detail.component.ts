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

  // Computed
  readonly sectionTitle = computed(() => this.sectionMeta()?.title || this.getFallbackTitle());
  readonly sectionIcon = computed(() => this.sectionMeta()?.icon || this.getFallbackIcon());

  readonly sectionItems = computed<SectionData[]>(() => {
    const b = this.breed();
    if (!b) return [];
    return this.buildSectionData(b);
  });

  readonly sectionList = computed<string[]>(() => {
    const b = this.breed();
    if (!b) return [];
    const code = this.sectionCode();
    if (code === 'rituals') return b.rituals || [];
    if (code === 'health') return b.healthRisks || [];
    return [];
  });

  readonly sectionText = computed<string | null>(() => {
    const b = this.breed();
    if (!b) return null;
    if (this.sectionCode() === 'history') return b.history || null;
    return null;
  });

  readonly isListSection = computed(() => {
    const code = this.sectionCode();
    return code === 'rituals' || code === 'health';
  });

  readonly isTextSection = computed(() => this.sectionCode() === 'history');
  readonly isDataSection = computed(() => !this.isListSection() && !this.isTextSection());

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

  private buildSectionData(b: Breed): SectionData[] {
    const code = this.sectionCode();

    switch (code) {
      case 'dna':
        if (!b.dna) return [];
        return [
          { label: 'Genetica', value: b.dna.genetics || '--' },
          { label: 'Gruppo FCI', value: b.dna.groupFCI || 'N/A' },
          { label: 'Ancestori', value: b.dna.ancestralBreeds?.join(', ') || 'N/A' },
        ].filter((d) => d.value !== '--');

      case 'size':
        if (!b.size) return [];
        const items: SectionData[] = [
          { label: 'Altezza', value: `${b.size.height.min}–${b.size.height.max} ${b.size.height.unit}` },
          { label: 'Peso', value: `${b.size.weight.min}–${b.size.weight.max} ${b.size.weight.unit}` },
          { label: 'Pelo', value: b.size.coat || '--' },
          { label: 'Colori', value: b.size.colors?.join(', ') || '--' },
        ];
        if (b.size.lifespan) {
          items.push({ label: 'Aspettativa di vita', value: `${b.size.lifespan.min}–${b.size.lifespan.max} anni` });
        }
        return items;

      case 'temperament':
        if (!b.temperament) return [];
        return [
          { label: 'Energia', value: b.temperament.energy },
          { label: 'Socialita\'', value: b.temperament.sociality },
          { label: 'Addestrabilita\'', value: b.temperament.trainability },
          { label: 'Tratti', value: b.temperament.traits?.join(', ') || '--' },
        ];

      default:
        return [];
    }
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
