/**
 * Breed models for breeds module
 */

export type Species =
  | 'Cane'
  | 'Gatto'
  | 'Cavallo'
  | 'Pesci'
  | 'Rana'
  | 'Pappagalli'
  | 'Api'
  | 'Serpenti'
  | 'Canarini'
  | 'Tartarughe'
  | 'Coniglio'
  | 'Uccello';

/**
 * Species configuration for the grid display
 */
export interface SpeciesConfig {
  id: Species;
  label: string;
  image: string;
  color: string;
}

/**
 * All available species with their display configuration
 */
export const SPECIES_CONFIG: SpeciesConfig[] = [
  { id: 'Cane', label: 'CANE', image: 'assets/images/species/species-cane.png', color: '#4A74F0' },
  { id: 'Cavallo', label: 'CAVALLO', image: 'assets/images/species/species-cavallo.png', color: '#8B4513' },
  { id: 'Pesci', label: 'PESCI', image: 'assets/images/species/species-pesci.png', color: '#00CED1' },
  { id: 'Gatto', label: 'GATTO', image: 'assets/images/species/species-gatto.png', color: '#FF6B6B' },
  { id: 'Rana', label: 'RANA', image: 'assets/images/species/species-rana.png', color: '#32CD32' },
  { id: 'Pappagalli', label: 'PAPPAGALLI', image: 'assets/images/species/species-pappagalli.png', color: '#FF4500' },
  { id: 'Api', label: 'API', image: 'assets/images/species/species-api.png', color: '#FFD700' },
  { id: 'Serpenti', label: 'SERPENTI', image: 'assets/images/species/species-serpenti.png', color: '#2F4F4F' },
  { id: 'Canarini', label: 'CANARINI', image: 'assets/images/species/species-canarini.png', color: '#FFFF00' },
  { id: 'Tartarughe', label: 'TARTARUGHE', image: 'assets/images/species/species-tartarughe.png', color: '#228B22' },
];

export interface Breed {
  id: string;
  name: string;
  species: Species;
  image: string;
  popularity: number;
  origin?: string;
  description?: string;
}

export interface BreedDetail extends Breed {
  dna: {
    origin: string;
    history: string;
    genetics: string;
  };
  size: {
    weight: string;
    height: string;
    coat: string;
  };
  temperament: {
    character: string;
    behavior: string;
    sociability: string;
  };
  care: {
    feeding: string;
    exercise: string;
    grooming: string;
  };
  risks: {
    commonDiseases: string[];
    lifeExpectancy: string;
  };
  pedigree: {
    standard: string;
    recognitions: string[];
  };
}

export type BreedTabId = 'dna' | 'size' | 'temperament' | 'care' | 'risks' | 'pedigree';

export interface BreedTab {
  id: BreedTabId;
  label: string;
  icon: string;
}

export const BREED_TABS: BreedTab[] = [
  { id: 'dna', label: 'DNA', icon: '🧬' },
  { id: 'size', label: 'Taglia', icon: '📏' },
  { id: 'temperament', label: 'Temperamento', icon: '💚' },
  { id: 'care', label: 'Cura', icon: '🛁' },
  { id: 'risks', label: 'Rischi', icon: '⚠️' },
  { id: 'pedigree', label: 'Pedigree', icon: '📜' },
];

/**
 * Mock breeds data for MVP
 */
export const MOCK_BREEDS: Breed[] = [
  { id: 'golden-retriever', name: 'Golden Retriever', species: 'Cane', image: '🐕', popularity: 95 },
  { id: 'labrador', name: 'Labrador', species: 'Cane', image: '🐕', popularity: 98 },
  { id: 'pastore-tedesco', name: 'Pastore Tedesco', species: 'Cane', image: '🐕', popularity: 90 },
  { id: 'europeo', name: 'Europeo', species: 'Gatto', image: '🐱', popularity: 85 },
  { id: 'persiano', name: 'Persiano', species: 'Gatto', image: '🐱', popularity: 80 },
  { id: 'siamese', name: 'Siamese', species: 'Gatto', image: '🐱', popularity: 75 },
  { id: 'nano', name: 'Coniglio Nano', species: 'Coniglio', image: '🐰', popularity: 60 },
  { id: 'canarino', name: 'Canarino', species: 'Uccello', image: '🐦', popularity: 50 },
];

/**
 * Mock breed detail data for MVP
 */
export const MOCK_BREED_DETAILS: Record<string, BreedDetail> = {
  'golden-retriever': {
    id: 'golden-retriever',
    name: 'Golden Retriever',
    species: 'Cane',
    image: '🐕',
    popularity: 95,
    origin: 'Scozia',
    description: 'Il Golden Retriever e un cane di taglia grande, amichevole e affidabile.',
    dna: {
      origin: 'Sviluppato in Scozia nel XIX secolo',
      history: 'Originariamente allevato per il recupero della selvaggina durante la caccia.',
      genetics: 'Incrocio tra Tweed Water Spaniel e altri retriever.',
    },
    size: {
      weight: '25-34 kg',
      height: '51-61 cm',
      coat: 'Pelo lungo, denso, impermeabile, dorato',
    },
    temperament: {
      character: 'Amichevole, affidabile, gentile',
      behavior: 'Molto socievole, ama giocare e nuotare',
      sociability: 'Eccellente con bambini e altri animali',
    },
    care: {
      feeding: 'Dieta bilanciata, attenzione al sovrappeso',
      exercise: '1-2 ore al giorno di attivita fisica',
      grooming: 'Spazzolatura 2-3 volte a settimana',
    },
    risks: {
      commonDiseases: ['Displasia dell\'anca', 'Problemi cardiaci', 'Cancro'],
      lifeExpectancy: '10-12 anni',
    },
    pedigree: {
      standard: 'FCI Gruppo 8 - Cani da riporto',
      recognitions: ['AKC', 'FCI', 'KC', 'ENCI'],
    },
  },
  'labrador': {
    id: 'labrador',
    name: 'Labrador',
    species: 'Cane',
    image: '🐕',
    popularity: 98,
    origin: 'Canada',
    description: 'Il Labrador Retriever e uno dei cani piu popolari al mondo.',
    dna: {
      origin: 'Originario di Terranova, Canada',
      history: 'Usato dai pescatori per recuperare reti e pesci.',
      genetics: 'Discende dal St. John\'s Water Dog.',
    },
    size: {
      weight: '25-36 kg',
      height: '55-62 cm',
      coat: 'Pelo corto, denso, nero/giallo/cioccolato',
    },
    temperament: {
      character: 'Attivo, estroverso, giocoso',
      behavior: 'Molto energico, adora l\'acqua',
      sociability: 'Perfetto per famiglie',
    },
    care: {
      feeding: 'Tendenza all\'obesita, porzioni controllate',
      exercise: '1-2 ore al giorno minimo',
      grooming: 'Spazzolatura settimanale, muta stagionale',
    },
    risks: {
      commonDiseases: ['Displasia', 'Obesita', 'Problemi oculari'],
      lifeExpectancy: '10-14 anni',
    },
    pedigree: {
      standard: 'FCI Gruppo 8 - Cani da riporto',
      recognitions: ['AKC', 'FCI', 'KC', 'ENCI'],
    },
  },
};

/**
 * Get breed detail by ID (returns mock data or generates placeholder)
 */
export function getBreedDetail(id: string): BreedDetail | null {
  if (MOCK_BREED_DETAILS[id]) {
    return MOCK_BREED_DETAILS[id];
  }

  const breed = MOCK_BREEDS.find(b => b.id === id);
  if (!breed) return null;

  // Generate placeholder detail for breeds without full mock data
  return {
    ...breed,
    origin: 'Da definire',
    description: `Informazioni su ${breed.name} in arrivo.`,
    dna: {
      origin: 'Informazioni in arrivo',
      history: 'Informazioni in arrivo',
      genetics: 'Informazioni in arrivo',
    },
    size: {
      weight: 'Da definire',
      height: 'Da definire',
      coat: 'Da definire',
    },
    temperament: {
      character: 'Informazioni in arrivo',
      behavior: 'Informazioni in arrivo',
      sociability: 'Informazioni in arrivo',
    },
    care: {
      feeding: 'Informazioni in arrivo',
      exercise: 'Informazioni in arrivo',
      grooming: 'Informazioni in arrivo',
    },
    risks: {
      commonDiseases: ['Informazioni in arrivo'],
      lifeExpectancy: 'Da definire',
    },
    pedigree: {
      standard: 'Informazioni in arrivo',
      recognitions: ['Informazioni in arrivo'],
    },
  };
}
