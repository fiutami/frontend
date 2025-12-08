import { HERO_LAYOUT_CONTRACTS } from '../../../specs/002-contrala-html-immagini/contracts/hero-layout';

describe('Hero layout contract metadata', () => {
  it('keeps line-length ranges within research guardrails', () => {
    HERO_LAYOUT_CONTRACTS.forEach((contract) => {
      const [min, max] = contract.lineLengthRange;
      expect(min).withContext(`${contract.mode} minimum chars`).toBeGreaterThanOrEqual(40);
      expect(max).withContext(`${contract.mode} maximum chars`).toBeLessThanOrEqual(75);
      expect(min).withContext(`${contract.mode} minimum less than max`).toBeLessThan(max);
    });
  });

  it('exposes AVIF/WEBP asset paths for each contract mode', () => {
    HERO_LAYOUT_CONTRACTS.forEach((contract) => {
      expect(contract.imagePrimarySource).toMatch(/\.avif$/);
      expect(contract.imageFallbackSource).toMatch(/\.(webp|png)$/);
      expect(contract.imagePrimarySource).toContain('src/assets/hero/');
      expect(contract.imageFallbackSource).toContain('src/assets/hero/');
    });
  });
});
