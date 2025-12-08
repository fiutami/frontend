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
  origin?: string | null;
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
