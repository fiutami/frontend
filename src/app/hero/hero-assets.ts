export interface HeroIllustrationAsset {
  avif: string;
  webp: string;
  png: string;
  width: number;
  height: number;
  headroomRatio: number;
}

export const HERO_DOG_ASSET: HeroIllustrationAsset = {
  avif: 'assets/hero/dog-cutout-720.avif 720w, assets/hero/dog-cutout-1080.avif 1080w, assets/hero/dog-cutout-1440.avif 1440w',
  webp: 'assets/hero/dog-cutout-720.webp 720w, assets/hero/dog-cutout-1080.webp 1080w, assets/hero/dog-cutout-1440.webp 1440w',
  png: 'assets/hero/dog-cutout-1080.png',
  width: 759,
  height: 1080,
  headroomRatio: 0.12,
};

export const HERO_WORDMARK_ASSET = 'assets/brand/Lg_SRITTA_Fiutami_b.svg';
