import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PetCreateRequest,
  PetUpdateRequest,
  PetResponse,
  PetListResponse,
  PetPhotoResponse
} from '../models/pet.models';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  // State signals
  private petsSignal = signal<PetListResponse | null>(null);
  private selectedPetSignal = signal<PetResponse | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly pets = this.petsSignal.asReadonly();
  readonly selectedPet = this.selectedPetSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signals
  readonly petCount = computed(() => this.petsSignal()?.totalCount ?? 0);
  readonly hasPets = computed(() => this.petCount() > 0);

  private readonly baseUrl = `${environment.apiUrl}/pet`;

  constructor(private http: HttpClient) {}

  // ============================================================
  // Pet CRUD Operations
  // ============================================================

  /**
   * Load all pets for the current user
   */
  loadPets(): Observable<PetListResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<PetListResponse>(this.baseUrl).pipe(
      tap(response => {
        this.petsSignal.set(response);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error?.error?.message || 'Failed to load pets');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a specific pet by ID
   */
  getPet(petId: string): Observable<PetResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<PetResponse>(`${this.baseUrl}/${petId}`).pipe(
      tap(response => {
        this.selectedPetSignal.set(response);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error?.error?.message || 'Failed to load pet');
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new pet
   */
  createPet(request: PetCreateRequest): Observable<PetResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<PetResponse>(this.baseUrl, request).pipe(
      tap(() => {
        this.loadingSignal.set(false);
        // Reload pets list to include the new pet
        this.loadPets().subscribe();
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error?.error?.message || 'Failed to create pet');
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing pet
   */
  updatePet(petId: string, request: PetUpdateRequest): Observable<PetResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<PetResponse>(`${this.baseUrl}/${petId}`, request).pipe(
      tap(response => {
        this.selectedPetSignal.set(response);
        this.loadingSignal.set(false);
        // Reload pets list to reflect changes
        this.loadPets().subscribe();
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error?.error?.message || 'Failed to update pet');
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a pet (soft delete)
   */
  deletePet(petId: string, reason?: string): Observable<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const options = reason ? { params: { reason } } : {};

    return this.http.delete<void>(`${this.baseUrl}/${petId}`, options).pipe(
      tap(() => {
        this.loadingSignal.set(false);
        // Clear selected pet if it was deleted
        if (this.selectedPetSignal()?.id === petId) {
          this.selectedPetSignal.set(null);
        }
        // Reload pets list
        this.loadPets().subscribe();
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error?.error?.message || 'Failed to delete pet');
        return throwError(() => error);
      })
    );
  }

  // ============================================================
  // Pet Photo Operations
  // ============================================================

  /**
   * Get all photos for a pet
   */
  getPhotos(petId: string): Observable<PetPhotoResponse[]> {
    return this.http.get<PetPhotoResponse[]>(`${this.baseUrl}/${petId}/photos`);
  }

  /**
   * Upload a photo for a pet
   */
  uploadPhoto(petId: string, file: File, isProfilePhoto = false): Observable<PetPhotoResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const options = isProfilePhoto
      ? { params: { isProfilePhoto: 'true' } }
      : {};

    return this.http.post<PetPhotoResponse>(
      `${this.baseUrl}/${petId}/photos`,
      formData,
      options
    ).pipe(
      tap(() => {
        // Refresh pet details to update photo count
        this.getPet(petId).subscribe();
      })
    );
  }

  /**
   * Delete a photo
   */
  deletePhoto(petId: string, photoId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${petId}/photos/${photoId}`).pipe(
      tap(() => {
        // Refresh pet details to update photo count
        this.getPet(petId).subscribe();
      })
    );
  }

  /**
   * Set a photo as the primary/profile photo
   */
  setPrimaryPhoto(petId: string, photoId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${petId}/photos/${photoId}/primary`, {}).pipe(
      tap(() => {
        // Refresh pet details to update primary photo URL
        this.getPet(petId).subscribe();
      })
    );
  }

  // ============================================================
  // State Management
  // ============================================================

  /**
   * Clear selected pet
   */
  clearSelectedPet(): void {
    this.selectedPetSignal.set(null);
  }

  /**
   * Clear all state
   */
  clearState(): void {
    this.petsSignal.set(null);
    this.selectedPetSignal.set(null);
    this.errorSignal.set(null);
    this.loadingSignal.set(false);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSignal.set(null);
  }
}
