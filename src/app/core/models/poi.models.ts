// POI Models - Points of Interest for dog-friendly map

export type POIType = 'vet' | 'groomer' | 'park' | 'shop' | 'restaurant' | 'hotel' | 'beach';

export interface POI {
  id: string;
  name: string;
  type: POIType;
  lat: number;
  lng: number;
  address: string;
  rating?: number;
  reviewCount?: number;
  distance?: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  imageUrl?: string;
  isFavorite?: boolean;
}

export interface POIFilter {
  type: POIType;
  label: string;
  icon: string;
  color: string;
  active: boolean;
}

export interface MapLocation {
  lat: number;
  lng: number;
}
