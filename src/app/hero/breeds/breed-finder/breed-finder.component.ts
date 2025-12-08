import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreedsService } from '../breeds.service';

@Component({
  selector: 'app-breed-finder',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './breed-finder.component.html',
  styleUrls: ['./breed-finder.component.scss']
})
export class BreedFinderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly breedsService = inject(BreedsService);

  // State
  readonly photoFile = signal<File | null>(null);
  readonly photoPreview = signal<string | null>(null);
  readonly description = signal<string>('');
  readonly isAnalyzing = signal<boolean>(false);
  readonly analysisProgress = signal<number>(0);
  readonly searchQuery = signal<string>('');
  readonly selectedSpeciesId = signal<string | null>(null);

  // From service
  readonly speciesList = this.breedsService.speciesList;
  readonly isLoading = this.breedsService.isLoading;

  // Computed
  readonly canAnalyze = computed(() =>
    this.photoFile() !== null && !this.isAnalyzing()
  );

  readonly selectedSpeciesName = computed(() => {
    const id = this.selectedSpeciesId();
    if (!id) return null;
    const species = this.breedsService.getSpeciesById(id);
    return species?.name || null;
  });

  ngOnInit(): void {
    // Load species if not loaded
    if (this.speciesList().length === 0) {
      this.breedsService.loadSpecies().subscribe();
    }

    // Check for species query param
    this.route.queryParams.subscribe(params => {
      if (params['species']) {
        this.selectedSpeciesId.set(params['species']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Per favore seleziona un\'immagine');
      return;
    }

    this.photoFile.set(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.photoFile.set(null);
    this.photoPreview.set(null);
  }

  async analyzePhoto(): Promise<void> {
    const file = this.photoFile();
    if (!file) return;

    this.isAnalyzing.set(true);
    this.analysisProgress.set(0);

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      this.analysisProgress.update(p => {
        if (p >= 90) return p;
        return p + Math.random() * 15;
      });
    }, 200);

    // Call service
    this.breedsService.analyzePhoto(file, this.description()).subscribe({
      next: (result) => {
        clearInterval(progressInterval);
        this.analysisProgress.set(100);

        // Navigate to result after short delay
        setTimeout(() => {
          this.isAnalyzing.set(false);
          this.router.navigate(['/home/breeds/result', result.breed.id]);
        }, 500);
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.isAnalyzing.set(false);
        console.error('Analysis error:', err);
        alert('Errore durante l\'analisi. Riprova.');
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.breedsService.searchBreeds(query).subscribe();
    }
  }

  goBack(): void {
    this.router.navigate(['/home/breeds']);
  }

  goToHome(): void {
    this.router.navigate(['/home/main']);
  }
}
