import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TabPageShellBlueComponent } from '../../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';
import { PhotoUploadModalComponent } from '../../../shared/components/photo-upload-modal/photo-upload-modal.component';
import { PetService } from '../../../core/services/pet.service';
import { PhotoUploadService } from '../../../core/services/photo-upload.service';
import { PetResponse } from '../../../core/models/pet.models';

export interface PetEditForm {
  name: string;
  breed: string;
  sex: 'Maschio' | 'Femmina';
  birthDate: string;
  weight: number | null;
  bio: string;
}

export interface PersonalityChip {
  id: string;
  label: string;
}

@Component({
  selector: 'app-pet-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TabPageShellBlueComponent, PhotoUploadModalComponent],
  templateUrl: './pet-edit.component.html',
  styleUrls: ['./pet-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly petService = inject(PetService);
  private readonly photoUploadService = inject(PhotoUploadService);
  private readonly cdr = inject(ChangeDetectorRef);

  // The pet being edited
  private petId = '';

  // Loading / error
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  // Profile photo
  readonly profilePhoto = signal('assets/images/default-pet-avatar.png');

  // Cover / gallery photos
  readonly coverPhotos = signal<string[]>([]);

  // Photo upload modal state
  readonly showPhotoUpload = signal(false);
  readonly photoUploadMode = signal<'profile' | 'gallery'>('profile');
  readonly isUploadingPhoto = signal(false);
  readonly uploadProgress = signal(0);

  // Form data
  readonly form = signal<PetEditForm>({
    name: '',
    breed: '',
    sex: 'Maschio',
    birthDate: '',
    weight: null,
    bio: '',
  });

  // Personality chips
  readonly chips = signal<PersonalityChip[]>([]);

  // Saving state
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);

  // Delete confirmation slide-to-confirm
  readonly showDeleteModal = signal(false);
  readonly slideProgress = signal(0); // 0..1
  private slideTrackWidth = 0;
  private slideStartX = 0;
  private isSliding = false;

  // Sex options for the select
  readonly sexOptions: Array<'Maschio' | 'Femmina'> = ['Maschio', 'Femmina'];

  ngOnInit(): void {
    const pet = this.petService.selectedPet();
    if (!pet) {
      this.errorMessage.set('Nessun pet selezionato');
      this.isLoading.set(false);
      return;
    }

    this.petId = pet.id;
    this.mapPetToForm(pet);
    this.loadGalleryPhotos(pet.id);
    this.isLoading.set(false);
  }

  private mapPetToForm(pet: PetResponse): void {
    // Build breed display
    let breedDisplay = pet.speciesName;
    if (pet.breedName) {
      breedDisplay = pet.breedVariantLabel
        ? `${pet.breedName} - ${pet.breedVariantLabel}`
        : pet.breedName;
    }

    this.profilePhoto.set(pet.profilePhotoUrl || 'assets/images/default-pet-avatar.png');

    this.form.set({
      name: pet.name,
      breed: breedDisplay,
      sex: pet.sex === 'male' ? 'Maschio' : 'Femmina',
      birthDate: pet.birthDate || '',
      weight: pet.weight,
      bio: pet.notes || '',
    });
  }

  private loadGalleryPhotos(petId: string): void {
    this.petService.getPetGallery(petId).subscribe({
      next: (photos) => {
        this.coverPhotos.set(photos.map(p => p.thumbnailUrl || p.url));
        this.cdr.markForCheck();
      },
      error: () => {
        // Gallery not available, leave empty
        this.coverPhotos.set([]);
      },
    });
  }

  // --- Navigation ---

  goBack(): void {
    window.history.back();
  }

  // --- Profile Photo ---

  onChangeProfilePhoto(): void {
    this.photoUploadMode.set('profile');
    this.showPhotoUpload.set(true);
  }

  // --- Cover Photos ---

  onCoverPhotoClick(index: number): void {
    console.log('Cover photo clicked:', index);
  }

  onAddCoverPhoto(): void {
    this.photoUploadMode.set('gallery');
    this.showPhotoUpload.set(true);
  }

  // --- Photo Upload Modal Handlers ---

  async onPhotoConfirmed(blob: Blob): Promise<void> {
    this.showPhotoUpload.set(false);
    if (!this.petId) return;

    this.isUploadingPhoto.set(true);
    this.uploadProgress.set(0);
    this.cdr.markForCheck();

    const fileName = this.photoUploadMode() === 'profile' ? 'profile-photo.jpg' : 'gallery-photo.jpg';
    const file = new File([blob], fileName, { type: 'image/jpeg' });

    try {
      if (this.photoUploadMode() === 'profile') {
        await this.photoUploadService.uploadProfilePhoto(
          this.petId,
          file,
          (p) => {
            this.uploadProgress.set(p);
            this.cdr.markForCheck();
          },
        );
        // Refresh pet data to get new profile photo URL
        this.petService.getPet(this.petId).subscribe({
          next: (pet) => {
            this.profilePhoto.set(pet.profilePhotoUrl || 'assets/images/default-pet-avatar.png');
            this.isUploadingPhoto.set(false);
            this.cdr.markForCheck();
          },
          error: () => {
            this.isUploadingPhoto.set(false);
            this.cdr.markForCheck();
          },
        });
      } else {
        await this.photoUploadService.uploadGalleryPhoto(
          this.petId,
          file,
          (p) => {
            this.uploadProgress.set(p);
            this.cdr.markForCheck();
          },
        );
        // Refresh gallery
        this.loadGalleryPhotos(this.petId);
        this.isUploadingPhoto.set(false);
        this.cdr.markForCheck();
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
      this.isUploadingPhoto.set(false);
      this.cdr.markForCheck();
    }
  }

  onPhotoCancelled(): void {
    this.showPhotoUpload.set(false);
  }

  // --- Form Updates ---

  updateField<K extends keyof PetEditForm>(field: K, value: PetEditForm[K]): void {
    this.form.update(current => ({ ...current, [field]: value }));
  }

  // --- Personality Chips ---

  removeChip(chipId: string): void {
    this.chips.update(current => current.filter(c => c.id !== chipId));
  }

  addChip(): void {
    const label = prompt('Aggiungi tratto di personalita:');
    if (label && label.trim()) {
      const newId = Date.now().toString();
      this.chips.update(current => [
        ...current,
        { id: newId, label: label.trim() },
      ]);
    }
  }

  // --- Actions ---

  onSave(): void {
    if (!this.petId) return;

    this.isSaving.set(true);
    const formData = this.form();

    this.petService.updatePet(this.petId, {
      name: formData.name || null,
      sex: formData.sex === 'Maschio' ? 'male' : 'female',
      birthDate: formData.birthDate || null,
      weight: formData.weight,
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.goBack();
      },
      error: (err) => {
        console.error('Failed to update pet:', err);
        this.isSaving.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  // --- Delete with slide-to-confirm ---

  onDeleteProfile(): void {
    this.showDeleteModal.set(true);
    this.slideProgress.set(0);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.slideProgress.set(0);
    this.isSliding = false;
  }

  onSlideStart(e: PointerEvent | TouchEvent): void {
    const track = (e.target as HTMLElement).closest('.delete-confirm__track');
    if (!track) return;
    this.slideTrackWidth = track.clientWidth - 56; // track width minus handle width
    this.slideStartX = this.getClientX(e);
    this.isSliding = true;
  }

  onSlideMove(e: PointerEvent | TouchEvent): void {
    if (!this.isSliding) return;
    e.preventDefault();

    const currentX = this.getClientX(e);
    const delta = currentX - this.slideStartX;
    const progress = Math.max(0, Math.min(1, delta / this.slideTrackWidth));
    this.slideProgress.set(progress);
    this.cdr.markForCheck();
  }

  onSlideEnd(): void {
    if (!this.isSliding) return;
    this.isSliding = false;

    if (this.slideProgress() >= 0.9) {
      this.executeDelete();
    } else {
      this.slideProgress.set(0);
      this.cdr.markForCheck();
    }
  }

  private getClientX(e: PointerEvent | TouchEvent): number {
    if ('touches' in e) {
      return e.touches[0]?.clientX ?? 0;
    }
    return e.clientX;
  }

  private executeDelete(): void {
    if (!this.petId) return;
    this.isDeleting.set(true);

    this.petService.deletePet(this.petId).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.isDeleting.set(false);
        this.router.navigate(['/home/main']);
      },
      error: (err) => {
        console.error('Failed to delete pet:', err);
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.slideProgress.set(0);
        this.cdr.markForCheck();
      },
    });
  }
}
