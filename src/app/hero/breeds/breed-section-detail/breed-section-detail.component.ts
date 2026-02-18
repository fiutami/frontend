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
    if (!b) return this.getLoremIpsum();
    const code = this.sectionCode();
    let result: string | null = null;

    switch (code) {
      case 'dna':
        if (b.dna) {
          const dnaParts = [b.dna.genetics];
          if (b.dna.groupFCI) dnaParts.push(`Gruppo FCI: ${b.dna.groupFCI}`);
          if (b.dna.ancestralBreeds?.length) dnaParts.push(`Ancestori: ${b.dna.ancestralBreeds.join(', ')}`);
          result = dnaParts.filter(Boolean).join(' - ');
        }
        break;

      case 'size':
        if (b.size) {
          const sizeParts = [
            `Taglia "${b.name}": ${b.size.weight.min}-${b.size.weight.max} ${b.size.weight.unit}, alto ${b.size.height.min}-${b.size.height.max} ${b.size.height.unit}`,
            `Pelo ${b.size.coat}`,
          ];
          if (b.size.colors?.length) sizeParts.push(`Colore: ${b.size.colors.join(', ')}`);
          if (b.size.lifespan) sizeParts.push(`Aspettativa di vita: ${b.size.lifespan.min}-${b.size.lifespan.max} anni`);
          result = sizeParts.join('. - ');
        }
        break;

      case 'temperament':
        if (b.temperament) {
          const tempParts = [
            `Energia: ${b.temperament.energy}`,
            `Socialita\u0300: ${b.temperament.sociality}`,
            `Addestrabilita\u0300: ${b.temperament.trainability}`,
          ];
          if (b.temperament.traits?.length) tempParts.push(`Tratti: ${b.temperament.traits.join(', ')}`);
          result = tempParts.join('. - ');
        }
        break;

      case 'rituals':
        result = b.rituals?.join('. - ') || null;
        break;

      case 'health':
        result = b.healthRisks?.join('. - ') || null;
        break;

      case 'history':
        result = b.history || null;
        break;
    }

    return result || this.getLoremIpsum();
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

  private getLoremIpsum(): string {
    const loremMap: Record<string, string> = {
      dna: '(Aspetti genetici ed ereditari) Lorem ipsum canibus randagius, concentrato di geni da meme ma anche di problemi ereditari: brachicefalia cronica, rischio altissimo di sindrome respiratoria ostruttiva, occhi sporgenti delicatissimi, tendenza alle allergie e alla dermatite. - Predisposizione a obesita\u0300, displasia, problemi vertebrali e tutto cio\u0300 che rende le visite dal veterinario un appuntamento fisso.',
      size: '(Aspetti fisici) - Taglia "intrasportabile ma soffice": 6-8 kg, molto compatto, bassotto, panciuto. - Pelo corto, denso, a doppio strato; perde piu\u0300 peli di una pecora in crisi mistica. - Colore: beige/fulvo classico, nero meno comune. - Occhi giganti, testa larga e rugosa, coda arricciata a cavatappi (che letteralmente non serve a nulla).',
      temperament: '(Carattere e comportamento) - Spassoso, simpaticone, perseguitato da una voglia di compagnia implacabile ("ombra di chiunque abbia cibo"). - Si crede grande anche se e\u0300 mini, adora i bambini e pure le nonne. - Intelligenza media, ma sa manipolare chiunque con lo sguardo pietoso. Testardo che sembra programmato, ma con un cuore d\'oro.',
      rituals: '(Gestione e bisogni quotidiani) - Passeggiate brevi, niente maratone: suda da fermo, rischiando coppiate tra cuore e respiro se fa lo scatto olimpico. - Occhi e pieghe vanno puliti spesso\u2014senno\u0300 si trasforma in colonia batterica da incubo. - Appetito devastante: puo\u0300 divorare la cena di famiglia in un attimo, attenti alla dieta. - Zero vita all\'aperto se fa caldo: meglio un divano, un po\' di aria fresca e tante carezze.',
      health: '(Limitazioni o rischi legati alla razza) - Problemi respiratori cronici: occhio al caldo, all\'umidita\u0300, al movimento e al sovrappeso! - Molto soggetto a problemi agli occhi (ulcere, ferite da urto... hanno occhi tipo parabrezza senza tergicristallo). - Fragile a infezioni cutanee tra le pieghe\u2014richiedono manutenzione costante. - Non adatto a padroni pigroni (paradossalmente!): va "manutenuto" con controlli veterinari serrati.',
      history: '(Cosa NON si puo\u0300 capire solo dalla razza) - Questo animale e\u0300 l\'apoteosi della leggenda personale: dietro ogni "palla tozza" c\'e\u0300 un\'anima diversa (piu\u0300 teatrale, piu\u0300 nerd, piu\u0300 finto duro...). - Non tutti russano uguale, non tutti sono pigri come sembra; qualcuno puo\u0300 essere insospettabilmente atletico. - Dipende moltissimo dall\'allevamento e, soprattutto, dal clima psicologico della casa.',
    };
    return loremMap[this.sectionCode()] || 'Lorem ipsum canibus randagius, dati in arrivo dal backend. Questa sezione sara\u0300 popolata con informazioni dettagliate sulla razza selezionata.';
  }

  goBack(): void {
    this.location.back();
  }
}
