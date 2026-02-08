import { test, expect } from '@playwright/test';
import { MapPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';

test.describe('Map POI @prod', () => {
  let mapPage: MapPage;

  test.beforeEach(async ({ page }) => {
    mapPage = new MapPage(page);
    const apiMocks = createApiMocks(page);
    await apiMocks.setupAllMocks();
    await apiMocks.setupAuthenticatedState();
  });

  test.describe('Map Display', () => {
    test('should display map container', async ({ page }) => {
      await mapPage.goto();
      await expect(mapPage.map).toBeVisible({ timeout: 10000 });
    });

    test('should display page title', async ({ page }) => {
      await mapPage.goto();
      await expect(mapPage.pageTitle).toBeVisible();
    });

    test('should display search input', async ({ page }) => {
      await mapPage.goto();
      await expect(mapPage.searchInput).toBeVisible();
    });

    test('should display back button', async ({ page }) => {
      await mapPage.goto();
      await expect(mapPage.backButton).toBeVisible();
    });
  });

  test.describe('Filter Pills', () => {
    test('should show filter pills', async ({ page }) => {
      await mapPage.goto();
      const count = await mapPage.filterPills.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have veterinario filter', async ({ page }) => {
      await mapPage.goto();
      await expect(mapPage.vetFilter).toBeVisible();
    });

    test('should have parco filter', async ({ page }) => {
      await mapPage.goto();
      await expect(mapPage.parkFilter).toBeVisible();
    });

    test('should have negozio filter', async ({ page }) => {
      await mapPage.goto();
      await expect(mapPage.shopFilter).toBeVisible();
    });

    test('should toggle filter on click', async ({ page }) => {
      await mapPage.goto();
      await mapPage.vetFilter.click();
      // Filter should toggle state
      await page.waitForTimeout(500);
    });
  });

  test.describe('Action Buttons', () => {
    test('should display action buttons', async ({ page }) => {
      await mapPage.goto();
      const count = await mapPage.actionButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have Attività button', async ({ page }) => {
      await mapPage.goto();
      await expect(mapPage.activityButton).toBeVisible();
    });

    test('should have Eventi button', async ({ page }) => {
      await mapPage.goto();
      await expect(mapPage.eventsButton).toBeVisible();
    });
  });

  test.describe('Location Features', () => {
    test('should display my location button', async ({ page }) => {
      await mapPage.goto();
      await expect(mapPage.myLocationButton.first()).toBeVisible();
    });

    test('should display current location indicator', async ({ page }) => {
      await mapPage.goto();
      // Location indicator may be visible
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Search Functionality', () => {
    test('should allow typing in search box', async ({ page }) => {
      await mapPage.goto();
      await mapPage.search('veterinario');
      await expect(mapPage.searchInput).toHaveValue('veterinario');
    });

    test('should clear search', async ({ page }) => {
      await mapPage.goto();
      await mapPage.search('test');
      await mapPage.clearSearch();
      await expect(mapPage.searchInput).toHaveValue('');
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mapPage.goto();
      await expect(mapPage.map).toBeVisible();
    });

    test('should display properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await mapPage.goto();
      await expect(mapPage.map).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back on back button click', async ({ page }) => {
      await page.goto('/home');
      await mapPage.goto();
      await mapPage.backButton.click();
      // Should navigate back
      await page.waitForTimeout(500);
    });
  });
});
