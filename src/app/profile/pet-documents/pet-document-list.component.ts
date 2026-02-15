import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PetDocumentService } from '../../core/services/pet-document.service';
import { PetDocument, PetDocumentType, DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ICONS } from '../../core/models/pet-document.models';

@Component({
  selector: 'app-pet-document-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="doc-list">
      <header class="doc-list__header">
        <button class="doc-list__back" (click)="goBack()" type="button">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="doc-list__title">{{ 'pet.documents.title' | translate }}</h1>
      </header>

      <!-- Filter chips -->
      <div class="doc-list__filters">
        <button
          class="doc-list__chip"
          [class.doc-list__chip--active]="!activeFilter()"
          (click)="setFilter(null)"
          type="button">
          {{ 'pet.documents.allTypes' | translate }}
        </button>
        @for (type of documentTypes; track type) {
          <button
            class="doc-list__chip"
            [class.doc-list__chip--active]="activeFilter() === type"
            (click)="setFilter(type)"
            type="button">
            <span class="material-icons doc-list__chip-icon">{{ getIcon(type) }}</span>
            {{ getLabel(type) }}
          </button>
        }
      </div>

      @if (isLoading()) {
        <div class="doc-list__loading">
          <div class="spinner"></div>
        </div>
      } @else if (filteredDocuments().length === 0) {
        <div class="doc-list__empty">
          <span class="material-icons doc-list__empty-icon">folder_open</span>
          <p>{{ 'pet.documents.empty' | translate }}</p>
        </div>
      } @else {
        <div class="doc-list__items">
          @for (doc of filteredDocuments(); track doc.id) {
            <div class="doc-card" (click)="openDocument(doc)">
              <div class="doc-card__icon">
                <span class="material-icons">{{ getIcon(doc.documentType) }}</span>
              </div>
              <div class="doc-card__info">
                <h3 class="doc-card__title">{{ doc.title }}</h3>
                <p class="doc-card__type">{{ getLabel(doc.documentType) }}</p>
                @if (doc.expiryDate) {
                  <span class="doc-card__expiry"
                    [class.doc-card__expiry--expired]="isExpired(doc)"
                    [class.doc-card__expiry--warning]="isExpiringSoon(doc)">
                    <span class="material-icons">schedule</span>
                    {{ formatDate(doc.expiryDate) }}
                  </span>
                }
              </div>
              @if (doc.isVerified) {
                <span class="material-icons doc-card__verified">verified</span>
              }
            </div>
          }
        </div>
      }

      <!-- FAB -->
      <button class="doc-list__fab" (click)="addDocument()" type="button">
        <span class="material-icons">add</span>
      </button>
    </div>
  `,
  styles: [`
    .doc-list { padding: 0 16px 80px; }
    .doc-list__header { display: flex; align-items: center; gap: 12px; padding: 16px 0; }
    .doc-list__back { background: none; border: none; cursor: pointer; padding: 8px; }
    .doc-list__back .material-icons { font-size: 24px; }
    .doc-list__title { font-size: 20px; font-weight: 600; margin: 0; }

    .doc-list__filters { display: flex; gap: 8px; overflow-x: auto; padding: 8px 0 16px; -webkit-overflow-scrolling: touch; }
    .doc-list__chip { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 20px; border: 1px solid #ddd; background: white; font-size: 13px; white-space: nowrap; cursor: pointer; }
    .doc-list__chip--active { background: #F2B830; border-color: #F2B830; color: #1a1a1a; font-weight: 600; }
    .doc-list__chip-icon { font-size: 16px; }

    .doc-list__loading { display: flex; justify-content: center; padding: 48px 0; }
    .spinner { width: 32px; height: 32px; border: 3px solid #eee; border-top: 3px solid #F2B830; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .doc-list__empty { text-align: center; padding: 48px 0; color: #888; }
    .doc-list__empty-icon { font-size: 48px; color: #ccc; }

    .doc-list__items { display: flex; flex-direction: column; gap: 12px; }

    .doc-card { display: flex; align-items: center; gap: 12px; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); cursor: pointer; transition: box-shadow 0.2s; }
    .doc-card:active { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .doc-card__icon { width: 44px; height: 44px; border-radius: 10px; background: #FFF3D0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .doc-card__icon .material-icons { color: #F2B830; font-size: 22px; }
    .doc-card__info { flex: 1; min-width: 0; }
    .doc-card__title { font-size: 15px; font-weight: 600; margin: 0 0 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .doc-card__type { font-size: 13px; color: #666; margin: 0; }
    .doc-card__expiry { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #888; margin-top: 4px; }
    .doc-card__expiry .material-icons { font-size: 14px; }
    .doc-card__expiry--expired { color: #E53935; }
    .doc-card__expiry--warning { color: #FB8C00; }
    .doc-card__verified { color: #4CAF50; font-size: 20px; }

    .doc-list__fab { position: fixed; bottom: 80px; right: 20px; width: 56px; height: 56px; border-radius: 28px; background: #F2B830; border: none; box-shadow: 0 4px 12px rgba(242,184,48,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }
    .doc-list__fab .material-icons { font-size: 28px; color: #1a1a1a; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetDocumentListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly docService = inject(PetDocumentService);

  documents = signal<PetDocument[]>([]);
  isLoading = signal(true);
  activeFilter = signal<PetDocumentType | null>(null);
  petId = '';

  documentTypes: PetDocumentType[] = ['vaccination', 'health_record', 'pedigree', 'adoption_paper', 'prescription', 'insurance', 'other'];

  filteredDocuments = computed(() => {
    const filter = this.activeFilter();
    const docs = this.documents();
    return filter ? docs.filter(d => d.documentType === filter) : docs;
  });

  ngOnInit(): void {
    this.petId = this.route.snapshot.paramMap.get('id') || '';
    if (this.petId) this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading.set(true);
    this.docService.getDocuments(this.petId).subscribe({
      next: docs => { this.documents.set(docs); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  setFilter(type: PetDocumentType | null): void { this.activeFilter.set(type); }
  getLabel(type: PetDocumentType): string { return DOCUMENT_TYPE_LABELS[type] || type; }
  getIcon(type: PetDocumentType): string { return DOCUMENT_TYPE_ICONS[type] || 'insert_drive_file'; }

  isExpired(doc: PetDocument): boolean {
    return doc.expiryDate ? new Date(doc.expiryDate) < new Date() : false;
  }

  isExpiringSoon(doc: PetDocument): boolean {
    if (!doc.expiryDate) return false;
    const expiry = new Date(doc.expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  openDocument(doc: PetDocument): void {
    this.router.navigate(['/home/pet-profile', this.petId, 'documents', doc.id]);
  }

  addDocument(): void {
    this.router.navigate(['/home/pet-profile', this.petId, 'documents', 'upload']);
  }

  goBack(): void {
    this.router.navigate(['/home/pet-profile', this.petId]);
  }
}
