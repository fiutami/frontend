import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Adoption, AdoptionListResponse, CreateAdoptionRequest, AdoptionSearchParams } from '../models/adoption.models';

@Injectable({
  providedIn: 'root'
})
export class AdoptionService {
  private apiUrl = `${environment.apiUrl}/adoptions`;

  constructor(private http: HttpClient) {}

  search(params: AdoptionSearchParams): Observable<AdoptionListResponse> {
    let httpParams = new HttpParams();
    if (params.species) httpParams = httpParams.set('species', params.species);
    if (params.city) httpParams = httpParams.set('city', params.city);
    if (params.maxFee) httpParams = httpParams.set('maxFee', params.maxFee.toString());
    if (params.lat) httpParams = httpParams.set('lat', params.lat.toString());
    if (params.lng) httpParams = httpParams.set('lng', params.lng.toString());
    if (params.radiusKm) httpParams = httpParams.set('radiusKm', params.radiusKm.toString());
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<AdoptionListResponse>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<Adoption> {
    return this.http.get<Adoption>(`${this.apiUrl}/${id}`);
  }

  getMyAdoptions(): Observable<{ items: Adoption[] }> {
    return this.http.get<{ items: Adoption[] }>(`${this.apiUrl}/mine`);
  }

  create(request: CreateAdoptionRequest): Observable<Adoption> {
    return this.http.post<Adoption>(this.apiUrl, request);
  }

  update(id: string, request: Partial<CreateAdoptionRequest>): Observable<Adoption> {
    return this.http.put<Adoption>(`${this.apiUrl}/${id}`, request);
  }

  cancel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  markAdopted(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/adopted`, {});
  }
}
