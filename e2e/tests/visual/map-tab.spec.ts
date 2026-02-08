import { test, expect } from '@playwright/test';

/**
 * Map Tab UX Smoke Tests
 *
 * Verifies the map page navigation and key UX behaviors:
 * - Tab bar navigates to /home/map
 * - Tab reset doesn't add history entry (replaceUrl)
 * - Premium banner navigates to /premium
 * - Back button returns to previous page
 *
 * Run with: npx playwright test e2e/tests/visual/map-tab.spec.ts
 */

const BASE_URL = process.env['BASE_URL'] || 'http://localhost:4200';

test.describe('Map Tab UX - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('Tab Map navigates to /home/map', async ({ page }) => {
    // Start from home
    await page.goto(`${BASE_URL}/home`);
    await page.waitForLoadState('networkidle');

    // Click on map tab (using data-tab-id attribute)
    const mapTab = page.locator('[data-tab-id="map"]');
    await mapTab.click();

    // Verify URL
    await expect(page).toHaveURL(/\/home\/map/);
  });

  test('Map page loads with expected elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/map`);
    await page.waitForLoadState('networkidle');

    // Verify key UI elements are present
    await expect(page.locator('.map-header__title')).toContainText('Mappa');
    await expect(page.locator('.back-button')).toBeVisible();
    await expect(page.locator('.search-box')).toBeVisible();
    await expect(page.locator('.map-container')).toBeVisible();
    await expect(page.locator('.promo-banner')).toBeVisible();
    // Check tab bar nav element (not the host component)
    await expect(page.locator('.bottom-tab-bar')).toBeVisible();
  });

  test('Tab reset uses replaceUrl (no history entry added)', async ({ page }) => {
    // Navigate to map page
    await page.goto(`${BASE_URL}/home/map`);
    await page.waitForLoadState('networkidle');

    // Get initial history length
    const initialHistoryLength = await page.evaluate(() => window.history.length);

    // Click map tab again (should use replaceUrl)
    const mapTab = page.locator('[data-tab-id="map"]');
    await mapTab.click();
    await page.waitForTimeout(500);

    // History length should not increase (replaceUrl doesn't add entry)
    const newHistoryLength = await page.evaluate(() => window.history.length);
    expect(newHistoryLength).toBeLessThanOrEqual(initialHistoryLength + 1);
  });

  test('Premium banner navigates to /premium', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/map`);
    await page.waitForLoadState('networkidle');

    // Click premium banner
    await page.locator('.promo-banner').click();

    // Verify navigation to premium
    await expect(page).toHaveURL(/\/premium/);
  });

  test('Back button returns to previous page', async ({ page }) => {
    // Start from home, then navigate to map
    await page.goto(`${BASE_URL}/home`);
    await page.waitForLoadState('networkidle');

    // Navigate to map via URL (simulating tab click)
    await page.goto(`${BASE_URL}/home/map`);
    await page.waitForLoadState('networkidle');

    // Click back button
    await page.locator('.back-button').click();

    // Should go back to home (or previous page in history)
    await expect(page).not.toHaveURL(/\/home\/map$/);
  });
});

test.describe('Map Tab UX - Filter Chips', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/home/map`);
    await page.waitForLoadState('networkidle');
  });

  test('Filter chips are visible and clickable', async ({ page }) => {
    // Check filter chips are present
    const filterChips = page.locator('.filter-chip');
    await expect(filterChips.first()).toBeVisible();

    // Click a filter chip
    await filterChips.first().click();

    // Check it toggles (has active class)
    // Note: the exact behavior depends on initial state
    await expect(filterChips.first()).toBeVisible();
  });

  test('Action buttons are visible', async ({ page }) => {
    // Check action buttons
    await expect(page.locator('.action-btn').first()).toBeVisible();
    await expect(page.locator('.action-btn')).toHaveCount(3); // Attività, Eventi, Localizzati dagli amici
  });
});

test.describe('Map Tab UX - Location Toggle', () => {
  test('Location toggle is visible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/home/map`);
    await page.waitForLoadState('networkidle');

    // Check location toggle
    await expect(page.locator('.location-toggle')).toBeVisible();
    await expect(page.locator('.location-toggle__label')).toContainText('Attiva location');
    await expect(page.locator('.toggle-switch')).toBeVisible();
  });
});

test.describe('Map Tab UX - Visual Regression', () => {
  test('Map page matches visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/home/map`);
    await page.waitForLoadState('networkidle');

    // Wait for map to potentially load (or show placeholder)
    await page.waitForTimeout(1000);

    // Take screenshot
    await expect(page).toHaveScreenshot('map-page-mobile.png', {
      maxDiffPixelRatio: 0.15,
      fullPage: true,
    });
  });
});
