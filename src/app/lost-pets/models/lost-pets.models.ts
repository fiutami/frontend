export interface LostPet {
  id: string;
  petId: string;
  petName: string;
  petSpecies: string;
  petBreed?: string;
  petColor?: string;
  petPhotoUrl?: string;
  description: string;
  lastSeenLocation: string;
  lastSeenCity?: string;
  lastSeenDate: Date;
  lastSeenLatitude?: number;
  lastSeenLongitude?: number;
  contactPhone?: string;
  contactEmail?: string;
  reward?: number;
  status: 'lost' | 'found' | 'closed';
  ownerUserId: string;
  ownerName: string;
  sightingsCount: number;
  createdAt: Date;
}

export interface LostPetSighting {
  id: string;
  lostPetId: string;
  reporterUserId: string;
  reporterName: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  photoUrl?: string;
  sightingDate: Date;
  isVerified: boolean;
  createdAt: Date;
}

export interface CreateLostPetRequest {
  petId: string;
  description: string;
  lastSeenLocation: string;
  lastSeenCity?: string;
  lastSeenDate: Date;
  lastSeenLatitude?: number;
  lastSeenLongitude?: number;
  contactPhone?: string;
  contactEmail?: string;
  reward?: number;
}

export interface CreateSightingRequest {
  location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  sightingDate: Date;
}
