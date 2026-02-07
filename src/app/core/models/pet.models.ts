// Pet Models - TypeScript interfaces matching backend DTOs

// ============================================================
// Request Models
// ============================================================

export interface PetCreateRequest {
  speciesId: string;
  name: string;
  sex: string;
  birthDate?: string | null;
  estimatedAgeMonths?: number | null;
  breedId?: string | null;
  color?: string | null;
  weight?: number | null;
  specialMarks?: string | null;
  microchipNumber?: string | null;
}

export interface PetUpdateRequest {
  name?: string | null;
  sex?: string | null;
  birthDate?: string | null;
  color?: string | null;
  weight?: number | null;
  specialMarks?: string | null;
  microchipNumber?: string | null;
  isNeutered?: boolean | null;
}

// ============================================================
// Response Models
// ============================================================

export interface PetResponse {
  id: string;
  userId: string;
  speciesId: string;
  speciesName: string;
  speciesCategory: string;
  name: string;
  sex: string;
  birthDate: string | null;
  calculatedAge: string;
  profilePhotoUrl: string | null;
  photoCount: number;
  status: string;
  isNeutered: boolean;
  microchip: string | null;
  color: string | null;
  weight: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PetSummaryResponse {
  id: string;
  name: string;
  speciesName: string;
  profilePhotoUrl: string | null;
  calculatedAge: string;
}

export interface PetListResponse {
  pets: PetSummaryResponse[];
  totalCount: number;
}

export interface PetPhotoResponse {
  id: string;
  petId: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  isProfilePhoto: boolean;
  sortOrder: number;
  uploadedAt: string;
}

// ============================================================
// Notification Models
// ============================================================

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string | null;
  actionUrl: string | null;
  imageUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  totalCount: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface MarkAllReadResponse {
  markedCount: number;
}

// ============================================================
// Helper Types
// ============================================================

export type PetStatus = 'active' | 'archived' | 'deleted';

export type NotificationType =
  | 'pet_reminder'
  | 'health_alert'
  | 'vaccination_due'
  | 'appointment'
  | 'system'
  | 'promotion';

// ============================================================
// Pet Profile Models (Path A - Real Pet Profile)
// ============================================================

export interface PetProfile {
  id: string;
  name: string;
  species: string;
  speciesId: string;
  breed: string;
  breedId?: string;
  birthDate: string | null;
  age: string;
  weight: number | null;
  sex: 'M' | 'F';
  color: string | null;
  microchip: string | null;
  profilePhotoUrl: string | null;
  coverPhotoUrl: string | null;
  notes: string | null;
  isNeutered: boolean;
  createdAt: string;
}

export interface PetPhoto {
  id: string;
  petId: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  isProfilePhoto: boolean;
  isFavorite: boolean;
  location: string | null;
  takenAt: string | null;
  uploadedAt: string;
}

export interface PetFriendProfile {
  id: string;
  petId: string;
  name: string;
  species: string;
  breed: string;
  profilePhotoUrl: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  ownerName: string;
  location: string | null;
  friendsSince: string;
}

export interface PetMemory {
  id: string;
  petId: string;
  title: string;
  description: string | null;
  date: string;
  type: MemoryType;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  location: string | null;
  createdAt: string;
}

export type MemoryType =
  | 'milestone'
  | 'adventure'
  | 'health'
  | 'birthday'
  | 'adoption'
  | 'achievement'
  | 'other';

export interface CreateMemoryRequest {
  title: string;
  description?: string | null;
  date: string;
  type: MemoryType;
  location?: string | null;
}

export interface BreedFacts {
  breedId: string;
  breedName: string;
  species: string;
  origin: string | null;
  lifespan: string | null;
  temperament: string[];
  characteristics: string[];
  funFacts: string[];
  careLevel: 'low' | 'medium' | 'high';
  exerciseNeeds: 'low' | 'medium' | 'high';
  groomingNeeds: 'low' | 'medium' | 'high';
}
