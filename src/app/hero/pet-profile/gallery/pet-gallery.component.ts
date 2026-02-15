import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default/tab-page-shell-default.component';
import {
  QuickActionsRowComponent,
  QuickActionItem,
} from '../../../shared/components/quick-actions-row/quick-actions-row.component';
import { PhotoUploadModalComponent } from '../../../shared/components/photo-upload-modal';
import { PhotoUploadService } from '../../../core/services/photo-upload.service';
import { PetService } from '../../../core/services/pet.service';
import { PetPhoto } from '../../../core/models/pet.models';

export interface PhotoItem {
  id: string;
  url: string;
  alt: string;
  uploadDate: Date;
}

export interface GallerySlot {
  type: 'large' | 'small';
  photo?: PhotoItem;
  isFavorite: boolean;
}

@Component({
  selector: 'app-pet-gallery',
  standalone: true,
  imports: [
    CommonModule,
    TabPageShellDefaultComponent,
    QuickActionsRowComponent,
    PhotoUploadModalComponent,
  ],
  templateUrl: './pet-gallery.component.html',
  styleUrls: ['./pet-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetGalleryComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly photoUploadService = inject(PhotoUploadService);
  private readonly petService = inject(PetService);

  // State signals
  viewMode = signal<'list' | 'grid'>('grid');
  isEditMode = signal(false);
  photos = signal<PhotoItem[]>([]);
  petId = signal<string>('');
  showUploadModal = signal(false);
  uploadProgress = signal(0);
  isUploading = signal(false);

  // Quick actions config
  quickActions: QuickActionItem[] = [
    { id: 'delete', icon: 'delete', ariaLabel: 'Elimina' },
    { id: 'bookmark', icon: 'bookmark', ariaLabel: 'Salva' },
  ];

  // Masonry grid slots: pattern = 1 large + 2 small, then 3 small, repeat
  gridSlots = computed<GallerySlot[]>(() => {
    const photos = this.photos();
    const slots: GallerySlot[] = [];
    const totalSlots = Math.max(9, photos.length);

    // Pattern: [large, small, small, small, small, small] repeating
    // Visual: large spans 2 rows left, 2 small stacked right, then 3 small row
    let photoIndex = 0;
    for (let i = 0; i < totalSlots; i++) {
      const patternPos = i % 6;
      const isLarge = patternPos === 0;
      const photo = photoIndex < photos.length ? photos[photoIndex] : undefined;
      slots.push({
        type: isLarge ? 'large' : 'small',
        photo,
        isFavorite: false,
      });
      photoIndex++;
    }
    return slots;
  });

  ngOnInit(): void {
    this.petId.set(this.route.snapshot.paramMap.get('id') || '');
    if (this.petId()) {
      this.loadPhotos();
    }
  }

  goBack(): void {
    this.location.back();
  }

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode.set(mode);
  }

  toggleEditMode(): void {
    this.isEditMode.update(v => !v);
  }

  onQuickAction(id: string): void {
    console.log('Quick action:', id);
  }

  onFavoriteToggle(slot: GallerySlot): void {
    if (slot.photo && this.petId()) {
      this.petService.togglePhotoFavorite(this.petId(), slot.photo.id).subscribe(() => {
        this.loadPhotos();
      });
    }
  }

  onUploadClick(): void {
    this.showUploadModal.set(true);
  }

  async onPhotoConfirmed(blob: Blob): Promise<void> {
    this.showUploadModal.set(false);
    this.isUploading.set(true);
    const file = new File([blob], 'gallery-photo.jpg', { type: 'image/jpeg' });
    try {
      await this.photoUploadService.uploadGalleryPhoto(
        this.petId(), file, (p) => this.uploadProgress.set(p)
      );
      this.loadPhotos();
    } finally {
      this.isUploading.set(false);
      this.uploadProgress.set(0);
    }
  }

  private loadPhotos(): void {
    this.petService.getPetGallery(this.petId()).subscribe(photos => {
      this.photos.set(photos.map(p => ({
        id: p.id,
        url: p.url,
        alt: p.caption || '',
        uploadDate: new Date(p.uploadedAt),
      })));
    });
  }
}
