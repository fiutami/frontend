import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PetDocumentService } from '../../core/services/pet-document.service';
import { PetDocument, DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ICONS } from '../../core/models/pet-document.models';

@Component({
  selector: 'app-pet-document-viewer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="doc-viewer">
      <header class="doc-viewer__header">
        <button class="doc-viewer__back" (click)="goBack()" type="button">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="doc-viewer__title">{{ petDoc()?.title }}</h1>
        <button class="doc-viewer__delete" (click)="confirmDelete()" type="button">
          <span class="material-icons">delete_outline</span>
        </button>
      </header>

      @if (isLoading()) {
        <div class="doc-viewer__loading"><div class="spinner"></div></div>
      } @else if (petDoc()) {
        <!-- File preview -->
        <div class="doc-viewer__preview">
          @if (isImage(petDoc()!.contentType)) {
            <img [src]="petDoc()!.fileUrl" [alt]="petDoc()!.title" class="doc-viewer__image">
          } @else if (petDoc()!.contentType === 'application/pdf' && petDoc()!.fileUrl) {
            <iframe [src]="petDoc()!.fileUrl" class="doc-viewer__pdf" title="PDF Preview"></iframe>
          } @else {
            <div class="doc-viewer__no-preview">
              <span class="material-icons">{{ getIcon(petDoc()!.documentType) }}</span>
              <p>{{ 'pet.documents.noPreview' | translate }}</p>
            </div>
          }
        </div>

        <!-- Metadata -->
        <div class="doc-viewer__meta">
          <div class="doc-viewer__meta-item">
            <span class="doc-viewer__meta-label">{{ 'pet.documents.typeLabel' | translate }}</span>
            <span class="doc-viewer__meta-value">
              <span class="material-icons">{{ getIcon(petDoc()!.documentType) }}</span>
              {{ getLabel(petDoc()!.documentType) }}
            </span>
          </div>

          @if (petDoc()!.documentDate) {
            <div class="doc-viewer__meta-item">
              <span class="doc-viewer__meta-label">{{ 'pet.documents.dateLabel' | translate }}</span>
              <span class="doc-viewer__meta-value">{{ formatDate(petDoc()!.documentDate!) }}</span>
            </div>
          }

          @if (petDoc()!.expiryDate) {
            <div class="doc-viewer__meta-item">
              <span class="doc-viewer__meta-label">{{ 'pet.documents.expiryLabel' | translate }}</span>
              <span class="doc-viewer__meta-value">{{ formatDate(petDoc()!.expiryDate!) }}</span>
            </div>
          }

          @if (petDoc()!.vetName) {
            <div class="doc-viewer__meta-item">
              <span class="doc-viewer__meta-label">{{ 'pet.documents.vetLabel' | translate }}</span>
              <span class="doc-viewer__meta-value">{{ petDoc()!.vetName }}</span>
            </div>
          }

          @if (petDoc()!.notes) {
            <div class="doc-viewer__meta-item">
              <span class="doc-viewer__meta-label">{{ 'pet.documents.notesLabel' | translate }}</span>
              <p class="doc-viewer__meta-value">{{ petDoc()!.notes }}</p>
            </div>
          }
        </div>

        <!-- Download -->
        @if (petDoc()!.fileUrl) {
          <a [href]="petDoc()!.fileUrl" download class="doc-viewer__download" target="_blank" rel="noopener">
            <span class="material-icons">file_download</span>
            {{ 'pet.documents.download' | translate }}
          </a>
        }
      }
    </div>

    @if (showDeleteConfirm()) {
      <div class="modal-overlay" (click)="cancelDelete()">
        <div class="modal" (click)="$event.stopPropagation()">
          <p>{{ 'pet.documents.confirmDelete' | translate }}</p>
          <div class="modal__actions">
            <button type="button" (click)="cancelDelete()">{{ 'common.cancel' | translate }}</button>
            <button type="button" class="modal__danger" (click)="deleteDocument()">{{ 'common.delete' | translate }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .doc-viewer { padding: 0 16px 32px; }
    .doc-viewer__header { display: flex; align-items: center; gap: 12px; padding: 16px 0; }
    .doc-viewer__back, .doc-viewer__delete { background: none; border: none; cursor: pointer; padding: 8px; }
    .doc-viewer__title { flex: 1; font-size: 18px; font-weight: 600; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .doc-viewer__delete .material-icons { color: #E53935; }

    .doc-viewer__loading { display: flex; justify-content: center; padding: 48px 0; }
    .spinner { width: 32px; height: 32px; border: 3px solid #eee; border-top: 3px solid #F2B830; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .doc-viewer__preview { margin-bottom: 24px; border-radius: 12px; overflow: hidden; background: #f5f5f5; }
    .doc-viewer__image { width: 100%; display: block; }
    .doc-viewer__pdf { width: 100%; height: 400px; border: none; }
    .doc-viewer__no-preview { text-align: center; padding: 48px; }
    .doc-viewer__no-preview .material-icons { font-size: 48px; color: #ccc; }

    .doc-viewer__meta { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
    .doc-viewer__meta-item { display: flex; flex-direction: column; gap: 4px; }
    .doc-viewer__meta-label { font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .doc-viewer__meta-value { display: flex; align-items: center; gap: 6px; font-size: 15px; }
    .doc-viewer__meta-value .material-icons { font-size: 18px; color: #F2B830; }

    .doc-viewer__download { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; border-radius: 12px; background: #F2B830; color: #1a1a1a; font-size: 16px; font-weight: 600; text-decoration: none; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal { background: white; padding: 24px; border-radius: 16px; max-width: 320px; width: 90%; }
    .modal__actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .modal__actions button { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; }
    .modal__danger { background: #E53935; color: white; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetDocumentViewerComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly docService = inject(PetDocumentService);

  petDoc = signal<PetDocument | null>(null);
  isLoading = signal(true);
  showDeleteConfirm = signal(false);
  petId = '';

  ngOnInit(): void {
    this.petId = this.route.snapshot.paramMap.get('id') || '';
    const docId = this.route.snapshot.paramMap.get('docId') || '';
    if (this.petId && docId) {
      this.docService.getDocument(this.petId, docId).subscribe({
        next: doc => { this.petDoc.set(doc); this.isLoading.set(false); },
        error: () => this.isLoading.set(false)
      });
    }
  }

  isImage(contentType: string): boolean {
    return contentType?.startsWith('image/');
  }

  getLabel(type: string): string { return DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS] || type; }
  getIcon(type: string): string { return DOCUMENT_TYPE_ICONS[type as keyof typeof DOCUMENT_TYPE_ICONS] || 'insert_drive_file'; }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  confirmDelete(): void { this.showDeleteConfirm.set(true); }
  cancelDelete(): void { this.showDeleteConfirm.set(false); }

  deleteDocument(): void {
    const doc = this.petDoc();
    if (!doc) return;
    this.docService.deleteDocument(this.petId, doc.id).subscribe({
      next: () => this.router.navigate(['/home/pet-profile', this.petId, 'documents']),
      error: () => this.showDeleteConfirm.set(false)
    });
  }

  goBack(): void {
    this.router.navigate(['/home/pet-profile', this.petId, 'documents']);
  }
}
