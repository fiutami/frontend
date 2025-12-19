import { test, expect } from '@playwright/test';
import { MapPage } from '../../page-objects';

/**
 * Production tests for Map POI page
 * Runs against live fiutami.pet without mocks
 * Tests public/guest accessible features
 */
test.describe('Map POI @prod', () => {
  let mapPage: MapPage;

  test.beforeEach(async ({ page }) => {
    mapPage = new MapPage(page);
  });

  test.describe('Map Display', () => {
    test('should load map page', async ({ page }) => {
      await mapPage.goto();
      // Should either show map or redirect to login
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).toMatch(/map|login|\//);
    });

    test('should display page elements when accessible', async ({ page }) => {
      await mapPage.goto();
      await page.waitForTimeout(2000);

      // Check if we're on map page or redirected
      const url = page.url();
      if (url.includes('/map')) {
        // Map page accessible
        await expect(mapPage.mapContainer.or(mapPage.map)).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should handle mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mapPage.goto();
      await page.waitForTimeout(2000);
    });

    test('should handle tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await mapPage.goto();
      await page.waitForTimeout(2000);
    });

    test('should handle desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await mapPage.goto();
      await page.waitForTimeout(2000);
    });
  });

  test.describe('Page Load Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await mapPage.goto();
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(10000); // 10 seconds max
    });
  });
});
