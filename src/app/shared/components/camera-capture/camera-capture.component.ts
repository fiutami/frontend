import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  output,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService } from '../../../core/services/camera.service';

/**
 * CameraCaptureComponent - Camera capture with file input fallback
 *
 * Attempts to open the camera. If not available (iOS Safari, permission denied),
 * automatically shows a file input with capture="environment" attribute.
 *
 * Usage:
 * ```html
 * <app-camera-capture
 *   (captured)="onPhotoCaptured($event)"
 *   (cancelled)="onCancelled()">
 * </app-camera-capture>
 * ```
 */
@Component({
  selector: 'app-camera-capture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './camera-capture.component.html',
  styleUrls: ['./camera-capture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CameraCaptureComponent implements AfterViewInit, OnDestroy {
  private readonly cameraService = inject(CameraService);

  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  /** Whether camera is available (if false, show file input fallback) */
  cameraAvailable = signal(false);

  /** Loading state while initializing camera */
  loading = signal(true);

  /** Error message if something goes wrong */
  error = signal<string | null>(null);

  /** Emits captured photo as Blob */
  captured = output<Blob>();

  /** Emits when user cancels */
  cancelled = output<void>();

  async ngAfterViewInit(): Promise<void> {
    await this.initCamera();
  }

  ngOnDestroy(): void {
    this.cameraService.close();
  }

  /**
   * Initialize camera or fall back to file input
   */
  private async initCamera(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const stream = await this.cameraService.open();

    if (stream && this.videoRef) {
      // Camera available - bind stream to video
      this.cameraAvailable.set(true);
      this.videoRef.nativeElement.srcObject = stream;
      await this.videoRef.nativeElement.play();
    } else {
      // Camera not available - show file input fallback
      this.cameraAvailable.set(false);
    }

    this.loading.set(false);
  }

  /**
   * Capture photo from video stream
   */
  async capturePhoto(): Promise<void> {
    if (!this.videoRef) return;

    try {
      const blob = await this.cameraService.captureFrame(this.videoRef.nativeElement);
      this.cameraService.close();
      this.captured.emit(blob);
    } catch (err) {
      console.error('Failed to capture photo:', err);
      this.error.set('Impossibile catturare la foto. Riprova.');
    }
  }

  /**
   * Handle file selected from file input (fallback)
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // Convert File to Blob and emit
      this.captured.emit(file);
    }
  }

  /**
   * Trigger file input click (for custom button styling)
   */
  triggerFileInput(): void {
    this.fileInputRef?.nativeElement.click();
  }

  /**
   * Cancel capture
   */
  cancel(): void {
    this.cameraService.close();
    this.cancelled.emit();
  }
}
