import { test, expect } from '@playwright/test';

/**
 * Bottom Tab Bar Visual Tests
 *
 * Tests the tab bar appearance on the styleguide demo page.
 * Run with: npx playwright test e2e/tests/visual/tab-bar.spec.ts
 *
 * Based on Figma design: FxJsfOV7R7qoXBM2xTyXRE node-id=12720-137
 */

const BASE_URL = process.env['BASE_URL'] || 'http://localhost:4200';

// Mobile viewport sizes to test responsiveness
const VIEWPORTS = [
  { name: 'iPhone-SE', width: 320, height: 568 },
  { name: 'iPhone-12', width: 390, height: 844 },
  { name: 'iPhone-14-Pro-Max', width: 430, height: 932 },
];

test.describe('Bottom Tab Bar - Styleguide Demo', () => {
  test('styleguide loads and shows bottom tab bar demo', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/styleguide`);
    await page.waitForLoadState('networkidle');

    // Check styleguide loaded
    await expect(page.locator('body')).toBeVisible();

    // Take screenshot of the page
    await expect(page).toHaveScreenshot('styleguide-with-tab-bar.png', {
      maxDiffPixelRatio: 0.15,
      fullPage: true,
    });
  });
});

test.describe('Bottom Tab Bar - Icon Assets', () => {
  test('SVG icons have correct viewBox (0 0 60 60)', async ({ page }) => {
    await page.goto(`${BASE_URL}/assets/icons/nav/home.svg`);
    const content = await page.content();

    // Verify viewBox is 0 0 60 60 (not cropped)
    expect(content).toContain('viewBox="0 0 60 60"');
  });

  test('active icon SVG has yellow selection circle', async ({ page }) => {
    await page.goto(`${BASE_URL}/assets/icons/nav/home-active.svg`);
    const content = await page.content();

    // Verify viewBox is 0 0 60 60
    expect(content).toContain('viewBox="0 0 60 60"');

    // Verify yellow circle is present
    expect(content).toContain('stroke="#F5B132"');
    expect(content).toContain('stroke-width="6"');
  });

  test('map icon SVG is not cut off', async ({ page }) => {
    await page.goto(`${BASE_URL}/assets/icons/nav/map.svg`);
    const content = await page.content();

    // Verify viewBox is 0 0 60 60 (not cropped)
    expect(content).toContain('viewBox="0 0 60 60"');
  });

  test.describe('all nav icons have correct structure', () => {
    const icons = [
      'home', 'home-active',
      'calendar', 'calendar-active',
      'map', 'map-active',
      'paw', 'paw-active',
      'globe', 'globe-active',
    ];

    for (const icon of icons) {
      test(`${icon}.svg has viewBox 0 0 60 60`, async ({ page }) => {
        await page.goto(`${BASE_URL}/assets/icons/nav/${icon}.svg`);
        const content = await page.content();
        expect(content).toContain('viewBox="0 0 60 60"');
      });
    }
  });
});
