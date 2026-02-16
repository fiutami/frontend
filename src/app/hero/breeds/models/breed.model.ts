/**
 * Fiutami - Breeds Module Models
 * Data models for Species and Breed entities
 */

// Species category types
export type SpeciesCategory = 'mammiferi' | 'uccelli' | 'rettili' | 'anfibi' | 'pesci' | 'invertebrati';

// Energy and trait levels
export type TraitLevel = 'bassa' | 'media' | 'alta';

/**
 * Species - Represents a pet species category (e.g., Dog, Cat, Horse)
 */
export interface Species {
  id: string;
  name: string;
  icon: string;
  imageUrl: string;
  category: SpeciesCategory;
  description?: string;
}

/**
 * Breed DNA information
 */
export interface BreedDNA {
  genetics: string;
  ancestralBreeds: string[];
  percentages?: Record<string, number>;
  groupFCI?: string;
}

/**
 * Breed size and physical characteristics
 */
export interface BreedSize {
  height: {
    min: number;
    max: number;
    unit: string;
  };
  weight: {
    min: number;
    max: number;
    unit: string;
  };
  coat: string;
  colors: string[];
  lifespan?: {
    min: number;
    max: number;
  };
}

/**
 * Breed temperament and behavior traits
 */
export interface BreedTemperament {
  energy: TraitLevel;
  sociality: TraitLevel;
  trainability: TraitLevel;
  traits: string[];
  suitableFor?: string[];
}

/**
 * Breed - Full breed information
 */
export interface Breed {
  id: string;
  speciesId: string;
  name: string;
  origin: string;
  recognition: string;
  imageUrl: string;

  // Breed classification
  breedType?: 'Pure' | 'Mixed' | 'Hybrid';
  allowsUserVariantLabel?: boolean;

  // Detailed info sections
  dna?: BreedDNA;
  size?: BreedSize;
  temperament?: BreedTemperament;
  rituals?: string[];
  healthRisks?: string[];
  history?: string;

  // Additional metadata
  popularity?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Info section for breed detail page
 */
export interface InfoSection {
  id: string;
  icon: string;
  title: string;
  route?: string;
  content?: string;
  isExpanded?: boolean;
}

/**
 * Breed analysis result from AI photo analysis
 */
export interface BreedAnalysisResult {
  breed: Breed;
  confidence: number;
  alternativeBreeds?: Array<{
    breed: Breed;
    confidence: number;
  }>;
  analysisDetails?: string;
}

