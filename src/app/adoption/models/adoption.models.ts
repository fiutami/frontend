export interface Adoption {
  id: string;
  petId: string;
  petName: string;
  petSpecies: string;
  petBreed?: string;
  petAge?: string;
  petPhotoUrl?: string;
  description: string;
  adoptionFee?: number;
  location: string;
  city?: string;
  ownerUserId: string;
  ownerName: string;
  status: 'available' | 'pending' | 'adopted' | 'cancelled';
  requirements?: string;
  allowMessages: boolean;
  viewCount: number;
  createdAt: Date;
}

export interface AdoptionListResponse {
  items: Adoption[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateAdoptionRequest {
  petId: string;
  description: string;
  adoptionFee?: number;
  location: string;
  city?: string;
  requirements?: string;
  allowMessages: boolean;
}

export interface AdoptionSearchParams {
  species?: string;
  city?: string;
  maxFee?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
}
