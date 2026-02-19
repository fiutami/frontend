import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PetDocumentService } from '../../core/services/pet-document.service';
import { PetDocumentType, DOCUMENT_TYPE_LABELS, CreatePetDocumentRequest } from '../../core/models/pet-document.models';

@Component({
  selector: 'app-pet-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="doc-upload">
      <header class="doc-upload__header">
        <button class="doc-upload__back" (click)="goBack()" type="button">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="doc-upload__title">{{ 'pet.documents.upload' | translate }}</h1>
      </header>

      <form class="doc-upload__form" (ngSubmit)="submit()">
        <!-- File selection -->
        <div class="doc-upload__file-area" (click)="fileInput.click()" [class.doc-upload__file-area--selected]="selectedFile()">
          @if (!selectedFile()) {
            <span class="material-icons doc-upload__file-icon">cloud_upload</span>
            <p class="doc-upload__file-text">{{ 'pet.documents.selectFile' | translate }}</p>
            <p class="doc-upload__file-hint">PDF, JPEG, PNG, WebP - max 25MB</p>
          } @else {
            <span class="material-icons doc-upload__file-icon">check_circle</span>
            <p class="doc-upload__file-text">{{ selectedFile()!.name }}</p>
            <p class="doc-upload__file-hint">{{ formatFileSize(selectedFile()!.size) }}</p>
          }
          <input #fileInput type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" (change)="onFileSelected($event)" hidden>
        </div>

        <!-- Title -->
        <div class="doc-upload__field">
          <label class="doc-upload__label">{{ 'pet.documents.titleLabel' | translate }} *</label>
          <input class="doc-upload__input" type="text" [(ngModel)]="title" name="title" required maxlength="200">
        </div>

        <!-- Document type -->
        <div class="doc-upload__field">
          <label class="doc-upload__label">{{ 'pet.documents.typeLabel' | translate }} *</label>
          <select class="doc-upload__select" [(ngModel)]="documentType" name="documentType" required>
            @for (type of documentTypes; track type) {
              <option [value]="type">{{ getTypeLabel(type) }}</option>
            }
          </select>
        </div>

        <!-- Document date -->
        <div class="doc-upload__field">
          <label class="doc-upload__label">{{ 'pet.documents.dateLabel' | translate }}</label>
          <input class="doc-upload__input" type="date" [(ngModel)]="documentDate" name="documentDate">
        </div>

        <!-- Expiry date -->
        <div class="doc-upload__field">
          <label class="doc-upload__label">{{ 'pet.documents.expiryLabel' | translate }}</label>
          <input class="doc-upload__input" type="date" [(ngModel)]="expiryDate" name="expiryDate">
        </div>

        <!-- Vet name -->
        <div class="doc-upload__field">
          <label class="doc-upload__label">{{ 'pet.documents.vetLabel' | translate }}</label>
          <input class="doc-upload__input" type="text" [(ngModel)]="vetName" name="vetName" maxlength="200">
        </div>

        <!-- Notes -->
        <div class="doc-upload__field">
          <label class="doc-upload__label">{{ 'pet.documents.notesLabel' | translate }}</label>
          <textarea class="doc-upload__textarea" [(ngModel)]="notes" name="notes" maxlength="1000" rows="3"></textarea>
        </div>

        @if (uploadProgress() > 0 && uploadProgress() < 100) {
          <div class="doc-upload__progress">
            <div class="doc-upload__progress-bar" [style.width.%]="uploadProgress()"></div>
          </div>
        }

        @if (error()) {
          <p class="doc-upload__error">{{ error() }}</p>
        }

        <button class="doc-upload__submit" type="submit"
          [disabled]="isUploading() || !selectedFile() || !title">
          @if (isUploading()) {
            {{ 'pet.documents.uploading' | translate }}
          } @else {
            {{ 'pet.documents.uploadBtn' | translate }}
          }
        </button>
      </form>
    </div>
  `,
  styles: [`
    .doc-upload { padding: 0 16px 32px; }
    .doc-upload__header { display: flex; align-items: center; gap: 12px; padding: 16px 0; }
    .doc-upload__back { background: none; border: none; cursor: pointer; padding: 8px; }
    .doc-upload__title { font-size: 20px; font-weight: 600; margin: 0; }

    .doc-upload__form { display: flex; flex-direction: column; gap: 16px; }

    .doc-upload__file-area { border: 2px dashed #ddd; border-radius: 12px; padding: 32px 16px; text-align: center; cursor: pointer; transition: border-color 0.2s; }
    .doc-upload__file-area:hover { border-color: #F2B830; }
    .doc-upload__file-area--selected { border-color: #4CAF50; background: #F1F8E9; }
    .doc-upload__file-icon { font-size: 36px; color: #999; }
    .doc-upload__file-area--selected .doc-upload__file-icon { color: #4CAF50; }
    .doc-upload__file-text { margin: 8px 0 4px; font-weight: 500; }
    .doc-upload__file-hint { font-size: 13px; color: #888; margin: 0; }

    .doc-upload__field { display: flex; flex-direction: column; gap: 4px; }
    .doc-upload__label { font-size: 14px; font-weight: 500; color: #333; }
    .doc-upload__input, .doc-upload__select, .doc-upload__textarea { padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; font-family: inherit; }
    .doc-upload__input:focus, .doc-upload__select:focus, .doc-upload__textarea:focus { outline: none; border-color: #F2B830; }

    .doc-upload__progress { height: 4px; background: #eee; border-radius: 2px; overflow: hidden; }
    .doc-upload__progress-bar { height: 100%; background: #F2B830; transition: width 0.3s; }

    .doc-upload__error { color: #E53935; font-size: 14px; margin: 0; }

    .doc-upload__submit { padding: 14px; border: none; border-radius: 12px; background: #F2B830; color: #1a1a1a; font-size: 16px; font-weight: 600; cursor: pointer; }
    .doc-upload__submit:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetDocumentUploadComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly docService = inject(PetDocumentService);

  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  uploadProgress = signal(0);
  error = signal('');
  petId = this.route.snapshot.paramMap.get('id') || '';

  title = '';
  documentType: PetDocumentType = 'other';
  documentDate = '';
  expiryDate = '';
  vetName = '';
  notes = '';

  documentTypes: PetDocumentType[] = ['vaccination', 'health_record', 'pedigree', 'adoption_paper', 'prescription', 'insurance', 'other'];

  getTypeLabel(type: PetDocumentType): string { return DOCUMENT_TYPE_LABELS[type] || type; }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSize) {
        this.error.set('File troppo grande. Massimo 25MB.');
        return;
      }
      this.selectedFile.set(file);
      this.error.set('');
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async submit(): Promise<void> {
    const file = this.selectedFile();
    if (!file || !this.title || this.isUploading()) return;

    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.error.set('');

    const metadata: CreatePetDocumentRequest = {
      title: this.title,
      documentType: this.documentType,
      documentDate: this.documentDate || null,
      expiryDate: this.expiryDate || null,
      notes: this.notes || null,
      vetName: this.vetName || null
    };

    try {
      await this.docService.uploadDocument(
        this.petId, file, metadata,
        p => this.uploadProgress.set(p)
      );
      this.router.navigate(['/home/pet-profile', this.petId, 'documents']);
    } catch (err: any) {
      this.error.set(err.message || 'Upload fallito');
      this.isUploading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/home/pet-profile', this.petId, 'documents']);
  }
}
