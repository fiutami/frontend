/**
 * Pet info item interface
 */
export interface PetInfoItem {
  /** Label (e.g., "SESSO", "ANNI", "PESO", "RAZZA") */
  label: string;
  /** Value (e.g., "Maschio", "3", "12kg", "Golden Retriever") */
  value: string;
  /** Optional icon name */
  icon?: string;
  /** Optional icon source URL */
  iconSrc?: string;
}

/**
 * Layout options for PetInfoCard
 */
export type PetInfoLayout = 'horizontal' | 'vertical' | 'grid';

/**
 * Variant options for PetInfoCard
 */
export type PetInfoVariant = 'solid' | 'outline' | 'transparent';
