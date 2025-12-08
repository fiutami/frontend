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

/**
 * Mock data for MVP development
 */
export const MOCK_SPECIES: Species[] = [
  { id: 'dog', name: 'CANE', icon: 'pets', imageUrl: '/assets/species/dog.jpg', category: 'mammiferi', description: 'Il miglior amico dell\'uomo' },
  { id: 'cat', name: 'GATTO', icon: 'pets', imageUrl: '/assets/species/cat.jpg', category: 'mammiferi', description: 'Compagno indipendente e affettuoso' },
  { id: 'horse', name: 'CAVALLO', icon: 'pets', imageUrl: '/assets/species/horse.jpg', category: 'mammiferi', description: 'Nobile e maestoso' },
  { id: 'fish', name: 'PESCI', icon: 'water', imageUrl: '/assets/species/fish.jpg', category: 'pesci', description: 'Colorati abitanti dell\'acquario' },
  { id: 'bird', name: 'UCCELLI', icon: 'flutter_dash', imageUrl: '/assets/species/bird.jpg', category: 'uccelli', description: 'Cantori alati' },
  { id: 'snake', name: 'SERPENTI', icon: 'pets', imageUrl: '/assets/species/snake.jpg', category: 'rettili', description: 'Affascinanti rettili' },
  { id: 'turtle', name: 'TARTARUGHE', icon: 'pets', imageUrl: '/assets/species/turtle.jpg', category: 'rettili', description: 'Lente ma sagge' },
  { id: 'frog', name: 'RANA', icon: 'pets', imageUrl: '/assets/species/frog.jpg', category: 'anfibi', description: 'Saltellanti anfibi' },
];

export const MOCK_BREEDS: Breed[] = [
  {
    id: 'pug',
    speciesId: 'dog',
    name: 'Carlino',
    origin: 'Cina',
    recognition: 'FCI Riconosciuta',
    imageUrl: '/assets/breeds/pug.jpg',
    dna: {
      genetics: 'Brachicefalo',
      ancestralBreeds: ['Mastiff Tibetano', 'Shih Tzu'],
      groupFCI: 'Gruppo 9 - Cani da compagnia'
    },
    size: {
      height: { min: 25, max: 30, unit: 'cm' },
      weight: { min: 6, max: 8, unit: 'kg' },
      coat: 'Corto e liscio',
      colors: ['Fulvo', 'Nero', 'Argento', 'Albicocca'],
      lifespan: { min: 12, max: 15 }
    },
    temperament: {
      energy: 'media',
      sociality: 'alta',
      trainability: 'media',
      traits: ['Affettuoso', 'Giocherellone', 'Testardo', 'Socievole'],
      suitableFor: ['Appartamento', 'Famiglie', 'Anziani']
    },
    rituals: [
      'Passeggiate brevi 2-3 volte al giorno',
      'Pulizia pieghe del muso quotidiana',
      'Alimentazione controllata (tende ad ingrassare)'
    ],
    healthRisks: [
      'Problemi respiratori (brachicefalia)',
      'Problemi oculari',
      'Obesità',
      'Displasia dell\'anca'
    ],
    history: 'Il Carlino è una delle razze più antiche, originaria della Cina dove era considerato un cane imperiale.'
  },
  {
    id: 'labrador',
    speciesId: 'dog',
    name: 'Labrador Retriever',
    origin: 'Canada',
    recognition: 'FCI Riconosciuta',
    imageUrl: '/assets/breeds/labrador.jpg',
    dna: {
      genetics: 'Retriever',
      ancestralBreeds: ['St. John\'s Water Dog'],
      groupFCI: 'Gruppo 8 - Cani da riporto'
    },
    size: {
      height: { min: 55, max: 62, unit: 'cm' },
      weight: { min: 25, max: 36, unit: 'kg' },
      coat: 'Corto e denso, resistente all\'acqua',
      colors: ['Nero', 'Giallo', 'Chocolate'],
      lifespan: { min: 10, max: 14 }
    },
    temperament: {
      energy: 'alta',
      sociality: 'alta',
      trainability: 'alta',
      traits: ['Intelligente', 'Amichevole', 'Attivo', 'Leale'],
      suitableFor: ['Famiglie con bambini', 'Case con giardino', 'Sportivi']
    },
    rituals: [
      'Esercizio intenso quotidiano (1-2 ore)',
      'Addestramento regolare',
      'Nuoto (adora l\'acqua)'
    ],
    healthRisks: [
      'Displasia dell\'anca e del gomito',
      'Obesità',
      'Atrofia progressiva della retina'
    ],
    history: 'Originario di Terranova, Canada, il Labrador era usato dai pescatori per recuperare le reti.'
  },
  {
    id: 'persian',
    speciesId: 'cat',
    name: 'Persiano',
    origin: 'Persia (Iran)',
    recognition: 'FIFe Riconosciuta',
    imageUrl: '/assets/breeds/persian.jpg',
    dna: {
      genetics: 'Brachicefalo felino',
      ancestralBreeds: ['Angora Turco'],
      groupFCI: 'Gatti a pelo lungo'
    },
    size: {
      height: { min: 25, max: 30, unit: 'cm' },
      weight: { min: 3, max: 7, unit: 'kg' },
      coat: 'Lungo, folto e setoso',
      colors: ['Bianco', 'Nero', 'Blu', 'Crema', 'Rosso', 'Tabby'],
      lifespan: { min: 12, max: 17 }
    },
    temperament: {
      energy: 'bassa',
      sociality: 'media',
      trainability: 'bassa',
      traits: ['Calmo', 'Affettuoso', 'Tranquillo', 'Riservato'],
      suitableFor: ['Appartamento', 'Vita indoor', 'Anziani']
    },
    rituals: [
      'Spazzolatura quotidiana del pelo',
      'Pulizia occhi giornaliera',
      'Ambiente tranquillo'
    ],
    healthRisks: [
      'Malattia renale policistica',
      'Problemi respiratori',
      'Problemi oculari'
    ],
    history: 'Il gatto Persiano è una delle razze più antiche e pregiate, simbolo di eleganza e raffinatezza.'
  }
];
