import { test, expect } from '@playwright/test';

test.describe('Centered Layout Visual Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.home-start__background-image');
    // Wait for image load
    await page.waitForFunction(() => {
      const img = document.querySelector('.home-start__background-image') as HTMLImageElement;
      return img && img.complete && img.naturalHeight !== 0;
    });
  });

  test('capture screenshot @viewport', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    await page.screenshot({
      path: `e2e/screenshots/centered-${projectName}.png`,
      fullPage: false,
    });
  });

  test('logo is horizontally centered', async ({ page }) => {
    const logo = page.locator('.home-start__logo-img');
    const logoBox = await logo.boundingBox();
    const viewport = page.viewportSize();

    if (logoBox && viewport) {
      const logoCenter = logoBox.x + logoBox.width / 2;
      const viewportCenter = viewport.width / 2;
      // Allow 60px tolerance for padding and content structure
      expect(Math.abs(logoCenter - viewportCenter)).toBeLessThan(60);
    }
  });

  test('mascot is horizontally centered', async ({ page }) => {
    const mascot = page.locator('.home-start__mascot');
    const box = await mascot.boundingBox();
    const viewport = page.viewportSize();

    if (box && viewport) {
      const center = box.x + box.width / 2;
      expect(Math.abs(center - viewport.width / 2)).toBeLessThan(10);
    }
  });

  test('card is horizontally centered', async ({ page }) => {
    const card = page.locator('.auth-card');
    const box = await card.boundingBox();
    const viewport = page.viewportSize();

    if (box && viewport) {
      const center = box.x + box.width / 2;
      expect(Math.abs(center - viewport.width / 2)).toBeLessThan(15);
    }
  });

  test('background covers viewport (no letterbox)', async ({ page }) => {
    const bgImage = page.locator('.home-start__background-image');
    const bgBox = await bgImage.boundingBox();
    const viewport = page.viewportSize();

    if (bgBox && viewport) {
      expect(bgBox.width).toBeGreaterThanOrEqual(viewport.width - 1);
      expect(bgBox.height).toBeGreaterThanOrEqual(viewport.height - 1);
    }
  });

  test('logo in top 30% of viewport', async ({ page }) => {
    const logo = page.locator('.home-start__logo-img');
    const box = await logo.boundingBox();
    const viewport = page.viewportSize();

    if (box && viewport) {
      const topPercent = (box.y / viewport.height) * 100;
      // Logo should be in upper portion of screen
      expect(topPercent).toBeLessThan(30);
    }
  });

  test('proportions report', async ({ page }, testInfo) => {
    const viewport = page.viewportSize();
    if (!viewport) return;

    const logo = page.locator('.home-start__logo-img');
    const mascot = page.locator('.home-start__mascot');
    const card = page.locator('.auth-card');

    const [logoBox, mascotBox, cardBox] = await Promise.all([
      logo.boundingBox(),
      mascot.boundingBox(),
      card.boundingBox()
    ]);

    console.log(`=== ${testInfo.project.name.toUpperCase()} PROPORTIONS ===`);
    console.log(`Viewport: ${viewport.width}x${viewport.height}`);
    console.log(`Logo: ${logoBox?.width?.toFixed(0)}px (${((logoBox?.width || 0) / viewport.width * 100).toFixed(1)}%)`);
    console.log(`Mascot: ${mascotBox?.width?.toFixed(0)}px (${((mascotBox?.width || 0) / viewport.width * 100).toFixed(1)}%)`);
    console.log(`Card: ${cardBox?.width?.toFixed(0)}px (${((cardBox?.width || 0) / viewport.width * 100).toFixed(1)}%)`);
  });
});
