import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface PhotoItem {
  id: string;
  url: string;
  alt: string;
  uploadDate: Date;
}

@Component({
  selector: 'app-pet-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pet-gallery.component.html',
  styleUrls: ['./pet-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetGalleryComponent {
  // State signals
  isLoading = signal(false);
  photos = signal<PhotoItem[]>([
    // Mock data - replace with API call
    { id: '1', url: 'assets/images/default-pet-avatar.png', alt: 'Pet photo 1', uploadDate: new Date() },
    { id: '2', url: 'assets/images/default-pet-avatar.png', alt: 'Pet photo 2', uploadDate: new Date() },
    { id: '3', url: 'assets/images/default-pet-avatar.png', alt: 'Pet photo 3', uploadDate: new Date() },
    { id: '4', url: 'assets/images/default-pet-avatar.png', alt: 'Pet photo 4', uploadDate: new Date() },
    { id: '5', url: 'assets/images/default-pet-avatar.png', alt: 'Pet photo 5', uploadDate: new Date() },
    { id: '6', url: 'assets/images/default-pet-avatar.png', alt: 'Pet photo 6', uploadDate: new Date() },
  ]);

  get isEmpty(): boolean {
    return this.photos().length === 0;
  }

  goBack(): void {
    window.history.back();
  }

  onPhotoClick(photo: PhotoItem): void {
    // Navigate to photo detail or open lightbox
    console.log('Photo clicked:', photo);
  }

  onAddPhotoClick(): void {
    // Open file picker or camera
    console.log('Add photo clicked');
  }
}
