/**
 * Species Data Model and Constants
 *
 * Complete list of pet species organized by category.
 * Based on Figma design: FxJsfOV7R7qoXBM2xTyXRE, node 12286:4434
 */

export interface Species {
  id: string;
  name: string;
  category: SpeciesCategory;
}

export type SpeciesCategory =
  | 'mammiferi'
  | 'uccelli'
  | 'rettili'
  | 'anfibi'
  | 'pesci'
  | 'invertebrati';

export interface SpeciesCategoryInfo {
  id: SpeciesCategory;
  label: string;
  icon: string;
}

/**
 * Species categories with labels and icons
 */
export const SPECIES_CATEGORIES: SpeciesCategoryInfo[] = [
  { id: 'mammiferi', label: 'Mammiferi', icon: 'paw' },
  { id: 'uccelli', label: 'Uccelli', icon: 'bird' },
  { id: 'rettili', label: 'Rettili', icon: 'reptile' },
  { id: 'anfibi', label: 'Anfibi', icon: 'frog' },
  { id: 'pesci', label: "Pesci d'acquario", icon: 'fish' },
  { id: 'invertebrati', label: 'Invertebrati', icon: 'bug' },
];

/**
 * Complete species list organized by category
 */
export const SPECIES: Species[] = [
  // ===========================================
  // MAMMIFERI
  // ===========================================
  { id: 'cane', name: 'Cane', category: 'mammiferi' },
  { id: 'gatto', name: 'Gatto', category: 'mammiferi' },
  { id: 'coniglio', name: 'Coniglio', category: 'mammiferi' },
  { id: 'furetto', name: 'Furetto', category: 'mammiferi' },
  { id: 'roditore', name: 'Roditore', category: 'mammiferi' },

  // ===========================================
  // UCCELLI
  // ===========================================
  { id: 'canarino', name: 'Canarino', category: 'uccelli' },
  { id: 'cocorita', name: 'Cocorita', category: 'uccelli' },
  { id: 'calopsita', name: 'Calopsita', category: 'uccelli' },
  { id: 'inseparabile', name: 'Inseparabile', category: 'uccelli' },
  { id: 'parrocchetto', name: 'Parrocchetto', category: 'uccelli' },
  { id: 'diamantino', name: 'Diamantino', category: 'uccelli' },
  { id: 'piccione-viaggiatore', name: 'Piccione viaggiatore', category: 'uccelli' },

  // ===========================================
  // RETTILI
  // ===========================================
  { id: 'tartaruga-terra', name: 'Tartaruga di terra', category: 'rettili' },
  { id: 'tartaruga-acqua', name: "Tartaruga d'acqua", category: 'rettili' },
  { id: 'pogona', name: 'Pogona', category: 'rettili' },
  { id: 'geco-leopardino', name: 'Geco leopardino', category: 'rettili' },
  { id: 'serpente-non-velenoso', name: 'Serpente non velenoso', category: 'rettili' },

  // ===========================================
  // ANFIBI
  // ===========================================
  { id: 'axolotl', name: 'Axolotl', category: 'anfibi' },
  { id: 'rana-pacman', name: 'Rana pacman', category: 'anfibi' },
  { id: 'tritone', name: 'Tritone', category: 'anfibi' },
  { id: 'salamandra', name: 'Salamandra', category: 'anfibi' },

  // ===========================================
  // PESCI D'ACQUARIO
  // ===========================================
  { id: 'pesce-rosso', name: 'Pesce rosso', category: 'pesci' },
  { id: 'betta-splendens', name: 'Betta splendens', category: 'pesci' },
  { id: 'guppy', name: 'Guppy', category: 'pesci' },
  { id: 'molly', name: 'Molly', category: 'pesci' },
  { id: 'platy', name: 'Platy', category: 'pesci' },
  { id: 'discus', name: 'Discus', category: 'pesci' },
  { id: 'neon', name: 'Neon', category: 'pesci' },
  { id: 'corydoras', name: 'Corydoras', category: 'pesci' },
  { id: 'ciclidi-africani', name: 'Ciclidi africani', category: 'pesci' },
  { id: 'pesci-tropicali', name: 'Pesci tropicali', category: 'pesci' },

  // ===========================================
  // INVERTEBRATI
  // ===========================================
  { id: 'ape', name: 'Ape', category: 'invertebrati' },
  { id: 'gamberetto', name: 'Gamberetto', category: 'invertebrati' },
  { id: 'granchio-acqua-dolce', name: "Granchio d'acqua dolce", category: 'invertebrati' },
  { id: 'insetto-stecco', name: 'Insetto stecco', category: 'invertebrati' },
  { id: 'insetto-foglia', name: 'Insetto foglia', category: 'invertebrati' },
  { id: 'tarantola', name: 'Tarantola', category: 'invertebrati' },
];

/**
 * Get species by category
 */
export function getSpeciesByCategory(category: SpeciesCategory): Species[] {
  return SPECIES.filter((s) => s.category === category);
}

/**
 * Get species by ID
 */
export function getSpeciesById(id: string): Species | undefined {
  return SPECIES.find((s) => s.id === id);
}

/**
 * Get category info by ID
 */
export function getCategoryById(id: SpeciesCategory): SpeciesCategoryInfo | undefined {
  return SPECIES_CATEGORIES.find((c) => c.id === id);
}
