import { test, expect, Page } from '@playwright/test';
import { createApiMocks } from '../../mocks/api-mocks';

/**
 * Tab Bar UX Tests
 *
 * Tests the tab bar structure, active state, and navigation behavior
 * according to UX specifications from Figma design.
 *
 * Reference: FIUTAMI – Correzioni UX_TAB BAR.md
 * Figma: https://www.figma.com/design/FxJsfOV7R7qoXBM2xTyXRE/MVP-Phone-Ok--originale-?node-id=12667-11260
 *
 * Run with: npx playwright test e2e/tests/visual/tab-bar-ux.spec.ts
 */

const BASE_URL = process.env['BASE_URL'] || 'http://localhost:4200';

// Mobile viewport (iPhone 12 size)
const MOBILE_VIEWPORT = { width: 390, height: 844 };

// Tab IDs in correct order per UX spec
const TAB_IDS = ['home', 'calendar', 'map', 'pet-profile', 'species'] as const;

// Route mapping per UX spec
const TAB_ROUTES: Record<string, string> = {
  'home': '/home/main',
  'calendar': '/home/calendar',
  'map': '/home/map',
  'pet-profile': '/home/pet-profile',
  'species': '/home/species',
};

/**
 * Helper: Setup authentication and navigate to a specific route
 */
async function navigateToRoute(page: Page, route: string): Promise<void> {
  await page.setViewportSize(MOBILE_VIEWPORT);

  // Setup API mocks for authentication
  const apiMocks = createApiMocks(page);
  await apiMocks.setupAllMocks();

  // Set auth token in localStorage to simulate logged-in state
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'mock-token-123');
    localStorage.setItem('refreshToken', 'mock-refresh-token-456');
    localStorage.setItem('user', JSON.stringify({
      id: 'test-user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }));
  });

  // Navigate to the route
  await page.goto(`${BASE_URL}${route}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Wait for Angular to initialize
}

// ============================================================
// TAB BAR STRUCTURE TESTS
// ============================================================

test.describe('Tab Bar Structure', () => {
  test('tab bar is visible on Home page', async ({ page }) => {
    await navigateToRoute(page, '/home/main');

    // Use the inner nav element which has the actual visible styles
    const tabBar = page.locator('.bottom-tab-bar');
    await expect(tabBar).toBeVisible();
  });

  test('has exactly 5 tab buttons', async ({ page }) => {
    await navigateToRoute(page, '/home/main');

    const tabs = page.locator('.bottom-tab-bar__tab');
    await expect(tabs).toHaveCount(5);
  });

  test('tabs are in correct order: Home, Calendar, Map, Pet Profile, Species', async ({ page }) => {
    await navigateToRoute(page, '/home/main');

    for (let i = 0; i < TAB_IDS.length; i++) {
      const tab = page.locator(`.bottom-tab-bar__tab`).nth(i);
      await expect(tab).toHaveAttribute('data-tab-id', TAB_IDS[i]);
    }
  });

  test('tab bar structure is identical across all 5 sections', async ({ page }) => {
    for (const tabId of TAB_IDS) {
      const route = TAB_ROUTES[tabId];
      await navigateToRoute(page, route);

      // Verify tab bar is visible
      const tabBar = page.locator('.bottom-tab-bar');
      await expect(tabBar).toBeVisible();

      // Verify 5 tabs
      const tabs = page.locator('.bottom-tab-bar__tab');
      await expect(tabs).toHaveCount(5);

      // Verify correct order
      for (let i = 0; i < TAB_IDS.length; i++) {
        const tab = page.locator(`.bottom-tab-bar__tab`).nth(i);
        await expect(tab).toHaveAttribute('data-tab-id', TAB_IDS[i]);
      }
    }
  });
});

// ============================================================
// ACTIVE STATE TESTS
// ============================================================

test.describe('Tab Bar Active State', () => {
  test('Home tab is active on /home/main', async ({ page }) => {
    await navigateToRoute(page, '/home/main');

    const homeTab = page.locator('[data-tab-id="home"]');
    await expect(homeTab).toHaveClass(/bottom-tab-bar__tab--active/);
    await expect(homeTab).toHaveAttribute('aria-selected', 'true');
  });

  test('Calendar tab is active on /home/calendar', async ({ page }) => {
    await navigateToRoute(page, '/home/calendar');

    const calendarTab = page.locator('[data-tab-id="calendar"]');
    await expect(calendarTab).toHaveClass(/bottom-tab-bar__tab--active/);
    await expect(calendarTab).toHaveAttribute('aria-selected', 'true');
  });

  test('Map tab is active on /home/map', async ({ page }) => {
    await navigateToRoute(page, '/home/map');

    const mapTab = page.locator('[data-tab-id="map"]');
    await expect(mapTab).toHaveClass(/bottom-tab-bar__tab--active/);
    await expect(mapTab).toHaveAttribute('aria-selected', 'true');
  });

  test('Pet Profile tab is active on /home/pet-profile', async ({ page }) => {
    await navigateToRoute(page, '/home/pet-profile');

    const petProfileTab = page.locator('[data-tab-id="pet-profile"]');
    await expect(petProfileTab).toHaveClass(/bottom-tab-bar__tab--active/);
    await expect(petProfileTab).toHaveAttribute('aria-selected', 'true');
  });

  test('Species tab is active on /home/species', async ({ page }) => {
    await navigateToRoute(page, '/home/species');

    const speciesTab = page.locator('[data-tab-id="species"]');
    await expect(speciesTab).toHaveClass(/bottom-tab-bar__tab--active/);
    await expect(speciesTab).toHaveAttribute('aria-selected', 'true');
  });

  test('exactly ONE tab is active at a time (never 0, never 2+)', async ({ page }) => {
    for (const tabId of TAB_IDS) {
      const route = TAB_ROUTES[tabId];
      await navigateToRoute(page, route);

      // Count active tabs
      const activeTabs = page.locator('.bottom-tab-bar__tab--active');
      await expect(activeTabs).toHaveCount(1);

      // Verify the correct tab is active
      await expect(activeTabs.first()).toHaveAttribute('data-tab-id', tabId);
    }
  });

  test('non-active tabs do not have active class', async ({ page }) => {
    await navigateToRoute(page, '/home/main');

    // Home is active
    await expect(page.locator('[data-tab-id="home"]')).toHaveClass(/bottom-tab-bar__tab--active/);

    // Others are NOT active
    await expect(page.locator('[data-tab-id="calendar"]')).not.toHaveClass(/bottom-tab-bar__tab--active/);
    await expect(page.locator('[data-tab-id="map"]')).not.toHaveClass(/bottom-tab-bar__tab--active/);
    await expect(page.locator('[data-tab-id="pet-profile"]')).not.toHaveClass(/bottom-tab-bar__tab--active/);
    await expect(page.locator('[data-tab-id="species"]')).not.toHaveClass(/bottom-tab-bar__tab--active/);
  });
});

// ============================================================
// NAVIGATION TESTS
// ============================================================

test.describe('Tab Bar Navigation', () => {
  test('clicking Home tab navigates to /home/main', async ({ page }) => {
    await navigateToRoute(page, '/home/calendar'); // Start from Calendar

    await page.click('[data-tab-id="home"]');
    await page.waitForURL(/\/home\/main/);

    expect(page.url()).toContain('/home/main');
  });

  test('clicking Calendar tab navigates to /home/calendar', async ({ page }) => {
    await navigateToRoute(page, '/home/main'); // Start from Home

    await page.click('[data-tab-id="calendar"]');
    await page.waitForURL(/\/home\/calendar/);

    expect(page.url()).toContain('/home/calendar');
  });

  test('clicking Map tab navigates to /home/map', async ({ page }) => {
    await navigateToRoute(page, '/home/main'); // Start from Home

    await page.click('[data-tab-id="map"]');
    await page.waitForURL(/\/home\/map/);

    expect(page.url()).toContain('/home/map');
  });

  test('clicking Pet Profile tab navigates to /home/pet-profile', async ({ page }) => {
    await navigateToRoute(page, '/home/main'); // Start from Home

    await page.click('[data-tab-id="pet-profile"]');
    await page.waitForURL(/\/home\/pet-profile/);

    expect(page.url()).toContain('/home/pet-profile');
  });

  test('clicking Species tab navigates to /home/species', async ({ page }) => {
    await navigateToRoute(page, '/home/main'); // Start from Home

    await page.click('[data-tab-id="species"]');
    await page.waitForURL(/\/home\/species/);

    expect(page.url()).toContain('/home/species');
  });

  test('clicking same tab while active stays on root page', async ({ page }) => {
    await navigateToRoute(page, '/home/main');

    // Click Home tab while already on Home
    await page.click('[data-tab-id="home"]');
    await page.waitForTimeout(300);

    // Should still be on home/main
    expect(page.url()).toContain('/home/main');

    // Tab bar should still be visible and Home should still be active
    await expect(page.locator('[data-tab-id="home"]')).toHaveClass(/bottom-tab-bar__tab--active/);
  });

  test('full navigation cycle through all tabs', async ({ page }) => {
    await navigateToRoute(page, '/home/main');

    // Navigate through all tabs
    for (const tabId of TAB_IDS) {
      await page.click(`[data-tab-id="${tabId}"]`);
      await page.waitForURL(new RegExp(TAB_ROUTES[tabId].replace('/', '\\/')));

      // Verify URL
      expect(page.url()).toContain(TAB_ROUTES[tabId]);

      // Verify active state
      await expect(page.locator(`[data-tab-id="${tabId}"]`)).toHaveClass(/bottom-tab-bar__tab--active/);
    }
  });
});

// ============================================================
// TAB BAR PERSISTENCE TESTS
// ============================================================

test.describe('Tab Bar Persistence', () => {
  test('tab bar remains visible after navigation between sections', async ({ page }) => {
    await navigateToRoute(page, '/home/main');

    // Navigate to Calendar
    await page.click('[data-tab-id="calendar"]');
    await page.waitForURL(/\/home\/calendar/);
    await expect(page.locator('.bottom-tab-bar')).toBeVisible();

    // Navigate to Map
    await page.click('[data-tab-id="map"]');
    await page.waitForURL(/\/home\/map/);
    await expect(page.locator('.bottom-tab-bar')).toBeVisible();

    // Navigate to Species
    await page.click('[data-tab-id="species"]');
    await page.waitForURL(/\/home\/species/);
    await expect(page.locator('.bottom-tab-bar')).toBeVisible();
  });

  test('active tab state updates correctly after navigation', async ({ page }) => {
    await navigateToRoute(page, '/home/main');

    // Home is active
    await expect(page.locator('[data-tab-id="home"]')).toHaveClass(/bottom-tab-bar__tab--active/);

    // Click Calendar
    await page.click('[data-tab-id="calendar"]');
    await page.waitForURL(/\/home\/calendar/);

    // Calendar should now be active, Home should not
    await expect(page.locator('[data-tab-id="calendar"]')).toHaveClass(/bottom-tab-bar__tab--active/);
    await expect(page.locator('[data-tab-id="home"]')).not.toHaveClass(/bottom-tab-bar__tab--active/);

    // Click Map
    await page.click('[data-tab-id="map"]');
    await page.waitForURL(/\/home\/map/);

    // Map should now be active, Calendar should not
    await expect(page.locator('[data-tab-id="map"]')).toHaveClass(/bottom-tab-bar__tab--active/);
    await expect(page.locator('[data-tab-id="calendar"]')).not.toHaveClass(/bottom-tab-bar__tab--active/);
  });
});

// ============================================================
// VISUAL REGRESSION TESTS
// ============================================================

test.describe('Tab Bar Visual Regression', () => {
  test('tab bar screenshot with Home active', async ({ page }) => {
    await navigateToRoute(page, '/home/main');

    const tabBar = page.locator('.bottom-tab-bar');
    await expect(tabBar).toHaveScreenshot('tab-bar-home-active.png', {
      maxDiffPixelRatio: 0.15,
    });
  });

  test('tab bar screenshot with Calendar active', async ({ page }) => {
    await navigateToRoute(page, '/home/calendar');

    const tabBar = page.locator('.bottom-tab-bar');
    await expect(tabBar).toHaveScreenshot('tab-bar-calendar-active.png', {
      maxDiffPixelRatio: 0.15,
    });
  });

  test('tab bar screenshot with Species active', async ({ page }) => {
    await navigateToRoute(page, '/home/species');

    const tabBar = page.locator('.bottom-tab-bar');
    await expect(tabBar).toHaveScreenshot('tab-bar-species-active.png', {
      maxDiffPixelRatio: 0.15,
    });
  });
});
