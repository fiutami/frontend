import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { CameraCaptureComponent } from '../camera-capture';
import { UploadModalStep } from './photo-upload-modal.types';

/**
 * PhotoUploadModalComponent - Modal for photo selection and cropping
 *
 * Provides a complete flow for:
 * 1. Selecting photo source (camera or gallery)
 * 2. Capturing/selecting image
 * 3. Cropping with aspect ratio
 *
 * IMPORTANT: This modal emits a Blob on confirm.
 * It does NOT upload directly - the parent component handles upload via PhotoUploadService.
 *
 * Usage:
 * ```html
 * <app-photo-upload-modal
 *   [aspectRatio]="1"
 *   [maxSize]="800"
 *   (confirmed)="onPhotoConfirmed($event)"
 *   (cancelled)="onCancelled()">
 * </app-photo-upload-modal>
 * ```
 */
@Component({
  selector: 'app-photo-upload-modal',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent, CameraCaptureComponent],
  templateUrl: './photo-upload-modal.component.html',
  styleUrls: ['./photo-upload-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhotoUploadModalComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  /** Aspect ratio for cropper (1 = square, 4/3 = landscape) */
  aspectRatio = input<number>(1);

  /** Maximum output width in pixels */
  maxSize = input<number>(800);

  /** Title shown in modal header */
  title = input<string>('Carica foto');

  /** Emits cropped image as Blob when confirmed */
  confirmed = output<Blob>();

  /** Emits when user cancels */
  cancelled = output<void>();

  /** Current step in the upload flow */
  step = signal<UploadModalStep>('source');

  /** Selected file for cropping */
  selectedFile = signal<File | null>(null);

  /** Cropped image blob */
  croppedImage = signal<Blob | null>(null);

  /** Error message */
  error = signal<string | null>(null);

  /** Whether cropper is ready */
  cropperReady = signal(false);

  /** Whether image is loading in cropper */
  imageLoading = signal(false);

  /**
   * Handle camera capture result
   */
  onCameraCapture(blob: Blob): void {
    const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
    this.selectedFile.set(file);
    this.imageLoading.set(true);
    this.step.set('crop');
  }

  /**
   * Handle camera cancelled
   */
  onCameraCancelled(): void {
    this.step.set('source');
  }

  /**
   * Open file picker for gallery selection
   */
  openGallery(): void {
    this.fileInputRef?.nativeElement.click();
  }

  /**
   * Handle file selected from gallery
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && this.validateFile(file)) {
      this.selectedFile.set(file);
      this.imageLoading.set(true);
      this.step.set('crop');
    }

    // Reset input so same file can be selected again
    input.value = '';
  }

  /**
   * Open camera capture
   */
  openCamera(): void {
    this.step.set('camera');
  }

  /**
   * Handle cropper image loaded
   */
  onImageLoaded(image: LoadedImage): void {
    this.imageLoading.set(false);
    this.cropperReady.set(true);
    this.error.set(null);
  }

  /**
   * Handle cropper load failed
   */
  onLoadImageFailed(): void {
    this.imageLoading.set(false);
    this.cropperReady.set(false);
    this.error.set('Impossibile caricare l\'immagine. Prova con un\'altra.');
  }

  /**
   * Handle image cropped
   */
  onImageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.croppedImage.set(event.blob);
    }
  }

  /**
   * Confirm and emit cropped image
   */
  confirm(): void {
    const blob = this.croppedImage();
    if (blob) {
      this.confirmed.emit(blob);
    }
  }

  /**
   * Go back to previous step
   */
  goBack(): void {
    const currentStep = this.step();

    if (currentStep === 'crop') {
      this.selectedFile.set(null);
      this.croppedImage.set(null);
      this.cropperReady.set(false);
      this.step.set('source');
    } else if (currentStep === 'camera') {
      this.step.set('source');
    }
  }

  /**
   * Cancel and close modal
   */
  cancel(): void {
    // Prevent accidental close during crop with unsaved changes
    if (!this.canClose()) {
      // Could show confirmation dialog here
      // For now, just close anyway
    }
    this.cancelled.emit();
  }

  /**
   * Check if modal can be safely closed
   */
  canClose(): boolean {
    return this.step() === 'source' || !this.croppedImage();
  }

  /**
   * Validate file type and size
   */
  private validateFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      this.error.set('Formato non supportato. Usa JPEG, PNG o WebP.');
      return false;
    }

    if (file.size > maxSize) {
      this.error.set('File troppo grande. Massimo 10MB.');
      return false;
    }

    this.error.set(null);
    return true;
  }
}
