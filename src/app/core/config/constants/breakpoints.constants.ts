/**
 * Responsive breakpoints and viewport detection constants
 * Centralized to avoid duplication across components
 */

// Standard responsive breakpoints
export const BREAKPOINTS = {
  XS: 320,
  SM: 576,
  MD: 768,
  LG: 1024,
  XL: 1200,
  XXL: 1400,
} as const;

// Foldable device detection ranges
export const FOLDABLE_DETECTION = {
  // Samsung Galaxy Fold inner display
  GALAXY_FOLD: {
    WIDTH_MIN: 700,
    WIDTH_MAX: 800,
  },
  // Other foldables
  GENERIC_FOLDABLE: {
    WIDTH_MIN: 717,
    WIDTH_MAX: 720,
  },
  // Foldable in landscape
  FOLDABLE_LANDSCAPE: {
    WIDTH_MIN: 1400,
    WIDTH_MAX: 1500,
  },
  // Outer display (cover screen)
  COVER_SCREEN: {
    WIDTH_MIN: 500,
    WIDTH_MAX: 520,
  },
} as const;

// Height thresholds for compact layouts
export const HEIGHT_THRESHOLDS = {
  COMPACT: 600,
  NORMAL: 800,
} as const;

// Device type detection helper
export type DeviceType = 'mobile' | 'tablet' | 'foldable' | 'desktop';

/**
 * Get device type based on viewport dimensions
 */
export function getDeviceType(width: number, height: number): DeviceType {
  const { GALAXY_FOLD, GENERIC_FOLDABLE, FOLDABLE_LANDSCAPE } = FOLDABLE_DETECTION;

  // Check for foldable devices
  const isFoldable =
    (width >= GALAXY_FOLD.WIDTH_MIN && width <= GALAXY_FOLD.WIDTH_MAX) ||
    (width >= GENERIC_FOLDABLE.WIDTH_MIN && width <= GENERIC_FOLDABLE.WIDTH_MAX) ||
    (width >= FOLDABLE_LANDSCAPE.WIDTH_MIN && width <= FOLDABLE_LANDSCAPE.WIDTH_MAX);

  if (isFoldable) return 'foldable';
  if (width < BREAKPOINTS.MD) return 'mobile';
  if (width < BREAKPOINTS.LG) return 'tablet';
  return 'desktop';
}

/**
 * Check if viewport is in portrait orientation
 */
export function isPortrait(width: number, height: number): boolean {
  return height > width;
}
