/**
 * PhotoUploadModal Types
 */

/** Upload modal step states */
export type UploadModalStep = 'source' | 'camera' | 'crop';

/** Upload source options */
export type UploadSource = 'camera' | 'gallery';

/** Aspect ratio presets */
export interface AspectRatioPreset {
  name: string;
  value: number;
}

export const ASPECT_RATIO_PRESETS: Record<string, AspectRatioPreset> = {
  square: { name: 'Quadrato', value: 1 },
  landscape: { name: 'Orizzontale', value: 4 / 3 },
  portrait: { name: 'Verticale', value: 3 / 4 },
};

/** Cropper output format */
export type CropperFormat = 'png' | 'jpeg' | 'webp';
