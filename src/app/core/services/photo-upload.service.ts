import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, Subject, firstValueFrom, filter, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Upload progress event
 */
export interface UploadProgressEvent {
  type: 'progress' | 'complete' | 'error';
  progress?: number;
  result?: PhotoUploadResult;
  error?: string;
}

/**
 * Photo upload result
 */
export interface PhotoUploadResult {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  isFavorite?: boolean;
  isPrimary?: boolean;
  createdAt?: string;
}

/**
 * PhotoUploadService - Orchestrates photo uploads with progress tracking
 *
 * Provides a clean separation between the UI (PhotoUploadModal) and the actual
 * upload logic. The modal emits Blob/File, this service handles the HTTP upload.
 *
 * Usage:
 * ```typescript
 * // In component:
 * async onPhotoConfirmed(blob: Blob) {
 *   const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
 *   try {
 *     const result = await this.photoUploadService.uploadGalleryPhoto(
 *       this.petId,
 *       file,
 *       (progress) => this.uploadProgress.set(progress)
 *     );
 *     // Success - refresh gallery
 *   } catch (err) {
 *     // Error handling
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class PhotoUploadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pets`;

  /**
   * Upload a photo to pet gallery with progress tracking
   *
   * @param petId Pet ID
   * @param file File to upload
   * @param onProgress Optional callback for progress updates (0-100)
   * @param caption Optional photo caption
   * @returns Promise with upload result
   */
  async uploadGalleryPhoto(
    petId: string,
    file: File,
    onProgress?: (percent: number) => void,
    caption?: string
  ): Promise<PhotoUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    return this.uploadWithProgress(
      `${this.baseUrl}/${petId}/gallery`,
      formData,
      onProgress
    );
  }

  /**
   * Upload a profile photo with progress tracking
   *
   * @param petId Pet ID
   * @param file File to upload
   * @param onProgress Optional callback for progress updates (0-100)
   * @returns Promise with upload result
   */
  async uploadProfilePhoto(
    petId: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<PhotoUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.uploadWithProgress(
      `${this.baseUrl}/${petId}/photos?isProfilePhoto=true`,
      formData,
      onProgress
    );
  }

  /**
   * Upload file with progress tracking using HttpClient reportProgress
   */
  private async uploadWithProgress(
    url: string,
    formData: FormData,
    onProgress?: (percent: number) => void
  ): Promise<PhotoUploadResult> {
    const request = new HttpRequest('POST', url, formData, {
      reportProgress: true
    });

    return firstValueFrom(
      this.http.request<PhotoUploadResult>(request).pipe(
        tap(event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            onProgress?.(progress);
          }
        }),
        filter(event => event.type === HttpEventType.Response),
        map(event => {
          const response = event as HttpResponse<PhotoUploadResult>;
          if (!response.body) {
            throw new Error('Upload response is empty');
          }
          return response.body;
        }),
        catchError(err => {
          console.error('Photo upload failed:', err);
          return throwError(() => new Error(
            err.error?.message || 'Impossibile caricare la foto. Riprova.'
          ));
        })
      )
    );
  }

  /**
   * Create observable for upload with progress events
   * Useful when you want more control over the upload lifecycle
   */
  uploadGalleryPhotoWithEvents(
    petId: string,
    file: File,
    caption?: string
  ): Observable<UploadProgressEvent> {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    const subject = new Subject<UploadProgressEvent>();
    const request = new HttpRequest('POST', `${this.baseUrl}/${petId}/gallery`, formData, {
      reportProgress: true
    });

    this.http.request<PhotoUploadResult>(request).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round((100 * event.loaded) / event.total);
          subject.next({ type: 'progress', progress });
        } else if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<PhotoUploadResult>;
          subject.next({ type: 'complete', result: response.body ?? undefined });
          subject.complete();
        }
      },
      error: (err) => {
        subject.next({
          type: 'error',
          error: err.error?.message || 'Impossibile caricare la foto. Riprova.'
        });
        subject.complete();
      }
    });

    return subject.asObservable();
  }
}
