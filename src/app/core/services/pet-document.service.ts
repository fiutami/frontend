import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, firstValueFrom, filter, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PetDocument, CreatePetDocumentRequest, UpdatePetDocumentRequest } from '../models/pet-document.models';

@Injectable({ providedIn: 'root' })
export class PetDocumentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pets`;

  getDocuments(petId: string, type?: string): Observable<PetDocument[]> {
    const params: Record<string, string> = {};
    if (type) params['type'] = type;
    return this.http.get<PetDocument[]>(`${this.baseUrl}/${petId}/documents`, { params });
  }

  getDocument(petId: string, docId: string): Observable<PetDocument> {
    return this.http.get<PetDocument>(`${this.baseUrl}/${petId}/documents/${docId}`);
  }

  async uploadDocument(
    petId: string,
    file: File,
    metadata: CreatePetDocumentRequest,
    onProgress?: (percent: number) => void
  ): Promise<PetDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    formData.append('documentType', metadata.documentType);
    if (metadata.documentDate) formData.append('documentDate', metadata.documentDate);
    if (metadata.expiryDate) formData.append('expiryDate', metadata.expiryDate);
    if (metadata.notes) formData.append('notes', metadata.notes);
    if (metadata.vetName) formData.append('vetName', metadata.vetName);

    const request = new HttpRequest('POST', `${this.baseUrl}/${petId}/documents`, formData, {
      reportProgress: true
    });

    return firstValueFrom(
      this.http.request<PetDocument>(request).pipe(
        tap(event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            onProgress?.(progress);
          }
        }),
        filter(event => event.type === HttpEventType.Response),
        map(event => {
          const response = event as HttpResponse<PetDocument>;
          if (!response.body) throw new Error('Upload response is empty');
          return response.body;
        }),
        catchError(err => {
          return throwError(() => new Error(
            err.error?.message || 'Impossibile caricare il documento. Riprova.'
          ));
        })
      )
    );
  }

  updateDocument(petId: string, docId: string, request: UpdatePetDocumentRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${petId}/documents/${docId}`, request);
  }

  deleteDocument(petId: string, docId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${petId}/documents/${docId}`);
  }
}
