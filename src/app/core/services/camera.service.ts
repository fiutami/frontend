import { Injectable, signal, computed } from '@angular/core';

/**
 * CameraService - PWA camera access with fallback
 *
 * Provides camera access for photo capture on mobile/desktop.
 * Falls back to file input if getUserMedia is not available (iOS Safari issues).
 *
 * Usage:
 * ```typescript
 * const stream = await cameraService.open();
 * if (!stream) {
 *   // Show file input fallback
 * }
 * const blob = await cameraService.captureFrame(videoElement);
 * cameraService.close();
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CameraService {
  /** Current media stream */
  private stream = signal<MediaStream | null>(null);

  /** Whether camera is currently active */
  isActive = computed(() => this.stream() !== null);

  /** Whether camera is supported on this device/browser */
  isSupported = computed(() =>
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices
  );

  /**
   * Opens the camera and returns the media stream.
   * Returns null if camera is not available or permission denied.
   *
   * @returns MediaStream if successful, null otherwise
   */
  async open(): Promise<MediaStream | null> {
    if (!this.isSupported()) {
      console.warn('Camera not supported on this device');
      return null;
    }

    // Close any existing stream
    this.close();

    try {
      // Use 'ideal' for facingMode to improve iOS compatibility
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },  // Rear camera for pets
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      this.stream.set(stream);
      return stream;
    } catch (err) {
      console.warn('Camera access failed, fallback to file input:', err);
      return null;
    }
  }

  /**
   * Captures a frame from the video element as a Blob.
   *
   * @param video HTMLVideoElement showing the camera stream
   * @param quality JPEG quality (0-1), default 0.92
   * @returns Blob of the captured frame
   */
  async captureFrame(video: HTMLVideoElement, quality = 0.92): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to capture frame'));
            }
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Closes the camera and releases resources.
   */
  close(): void {
    const currentStream = this.stream();
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      this.stream.set(null);
    }
  }

  /**
   * Gets the current stream (for binding to video element).
   */
  getStream(): MediaStream | null {
    return this.stream();
  }
}
