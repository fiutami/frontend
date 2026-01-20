import {
  Component,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RecognitionResult {
  species: string;
  breed?: string;
  confidence: number;
  description: string;
}

@Component({
  selector: 'app-species-special',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './species-special.component.html',
  styleUrls: ['./species-special.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesSpecialComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly selectedImage = signal<string | null>(null);
  readonly isAnalyzing = signal(false);
  readonly result = signal<RecognitionResult | null>(null);
  readonly error = signal<string | null>(null);

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.error.set('Per favore seleziona un\'immagine valida');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.error.set('L\'immagine deve essere inferiore a 10MB');
        return;
      }

      this.error.set(null);
      this.result.set(null);

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  analyzeImage(): void {
    if (!this.selectedImage()) return;

    this.isAnalyzing.set(true);
    this.error.set(null);

    setTimeout(() => {
      this.result.set({
        species: 'Cane',
        breed: 'Meticcio',
        confidence: 87,
        description: 'Questo sembra essere un cane meticcio con caratteristiche miste. I meticci sono animali unici che combinano tratti di diverse razze, rendendoli compagni speciali e spesso più resistenti alle malattie genetiche.'
      });
      this.isAnalyzing.set(false);
    }, 2000);
  }

  clearImage(): void {
    this.selectedImage.set(null);
    this.result.set(null);
    this.error.set(null);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      const fakeEvent = { target: { files } } as unknown as Event;
      this.onFileSelected(fakeEvent);
    }
  }
}
