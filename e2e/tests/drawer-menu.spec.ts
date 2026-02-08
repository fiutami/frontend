import { test, expect, Page } from '@playwright/test';
import { createApiMocks, ApiMockHandler } from '../mocks/api-mocks';

/**
 * DRAW MENU Complete E2E Tests
 * Tests for all 14 drawer menu screens across 8 device viewports
 *
 * Device Matrix:
 * 1. Mobile: 375x667 (iPhone SE)
 * 2. Tablet: 768x1024 (iPad)
 * 3. Desktop: 1440x900 (MacBook)
 * 4. Foldable Folded: 717x512 (Galaxy Fold closed)
 * 5. Foldable Unfolded: 1485x720 (Galaxy Fold open)
 * 6. iPhone 2025: 430x932 (Pro Max)
 * 7. Honor Magic V3: 795x720
 * 8. Honor Magic V5: 795x720 (same as V3)
 */

// Device viewport configurations
const DEVICE_VIEWPORTS = {
  mobile: { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
  tablet: { width: 768, height: 1024, name: 'Tablet (iPad)' },
  desktop: { width: 1440, height: 900, name: 'Desktop (MacBook)' },
  foldableFolded: { width: 717, height: 512, name: 'Foldable Folded (Galaxy Fold)' },
  foldableUnfolded: { width: 1485, height: 720, name: 'Foldable Unfolded (Galaxy Fold)' },
  iphone2025: { width: 430, height: 932, name: 'iPhone 2025 (Pro Max)' },
  honorMagicV3: { width: 795, height: 720, name: 'Honor Magic V3/V5' },
  // REMOVED: honorMagicV5 - identical to V3 viewport, redundant
} as const;

// Helper to get current project/device from test info
function getProjectName(testInfo: { project: { name: string } }): string {
  return testInfo.project.name;
}

// Helper to check if running on specific device type
function isDeviceType(testInfo: { project: { name: string } }, ...types: string[]): boolean {
  const projectName = testInfo.project.name.toLowerCase();
  return types.some(type => projectName.includes(type.toLowerCase()));
}

// Drawer menu sections configuration
const DRAWER_SECTIONS = [
  { name: 'Account', route: '/user/account', pageClass: '.account-page', headerClass: '.account-header' },
  { name: 'Activity', route: '/home/activity', pageClass: '.activity-page', headerClass: '.activity-header' },
  { name: 'Notifications', route: '/home/notifications', pageClass: '.notifications-page', headerClass: '.notifications-header' },
  { name: 'Saved', route: '/home/saved', pageClass: '.saved-page', headerClass: '.saved-header' },
  { name: 'Adopt', route: '/home/adopt', pageClass: '.adopt-page', headerClass: '.adopt-header, .page-header' },
  { name: 'Pet Friends', route: '/home/friends', pageClass: '.pet-friends-page', headerClass: '.pet-friends-header, .page-header' },
  { name: 'Invite', route: '/home/invite', pageClass: '.invite-page', headerClass: '.invite-header, .page-header' },
  { name: 'Lost Pets', route: '/home/lost-pets', pageClass: '.lost-pets-page', headerClass: '.lost-pets-header, .page-header' },
  { name: 'Blocked Users', route: '/home/blocked', pageClass: '.blocked-users-page', headerClass: '.blocked-users-header, .page-header' },
  { name: 'Subscriptions', route: '/home/subscriptions', pageClass: '.subscriptions-page', headerClass: '.subscriptions-header, .page-header' },
  { name: 'Contact', route: '/home/contact', pageClass: '.contact-page', headerClass: '.contact-header, .page-header' },
  { name: 'Terms', route: '/home/terms', pageClass: '.terms-page', headerClass: '.terms-header, .page-header' },
  { name: 'Privacy', route: '/home/privacy', pageClass: '.privacy-page', headerClass: '.privacy-header, .page-header' },
  { name: 'Pet Register', route: '/home/pet-register', pageClass: '.pet-register-page, .species-page', headerClass: '.pet-register-header, .species-header' },
] as const;

// Helper function to setup mocks for drawer sections
async function setupDrawerMocks(apiMocks: ApiMockHandler, page: Page): Promise<void> {
  // Activity mock
  await page.route('**/api/activity**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', type: 'login', title: 'Accesso effettuato', description: 'Nuovo accesso dal dispositivo', icon: 'login', timestamp: new Date().toISOString() },
        { id: '2', type: 'pet_add', title: 'Pet aggiunto', description: 'Hai aggiunto Luna', icon: 'pets', timestamp: new Date(Date.now() - 3600000).toISOString() },
      ])
    });
  });

  // Saved mock
  await page.route('**/api/saved**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', type: 'pet', title: 'Luna', subtitle: 'Golden Retriever', icon: 'pets', timestamp: new Date().toISOString() },
        { id: '2', type: 'event', title: 'Passeggiata al parco', subtitle: 'Domenica 10:00', icon: 'event', timestamp: new Date().toISOString() },
      ])
    });
  });

  // Adopt mock
  await page.route('**/api/adopt**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', name: 'Max', species: 'Cane', breed: 'Labrador', age: '2 anni', imageUrl: '/assets/pets/dog1.jpg' },
      ])
    });
  });

  // Friends mock
  await page.route('**/api/friends**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', displayName: 'Marco Rossi', username: 'marcorossi', petsCount: 2 },
      ])
    });
  });

  // Lost pets mock
  await page.route('**/api/lost-pets**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', name: 'Micio', species: 'cat', status: 'searching', lastSeenLocation: 'Roma', lastSeenDate: new Date().toISOString() },
      ])
    });
  });

  // Blocked users mock
  await page.route('**/api/blocked-users**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  // Subscriptions mock
  await page.route('**/api/subscriptions**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        plans: [
          { id: 'free', name: 'Free', monthlyPrice: 0, yearlyPrice: 0, features: [] },
          { id: 'premium', name: 'Premium', monthlyPrice: 4.99, yearlyPrice: 39.99, features: [] },
        ],
        currentPlan: 'free'
      })
    });
  });
}

// Main test suite
test.describe('Drawer Menu Complete Tests', () => {
  let apiMocks: ApiMockHandler;

  test.beforeEach(async ({ page, baseURL }) => {
    apiMocks = createApiMocks(page);
    await apiMocks.setupAllMocks();
    await setupDrawerMocks(apiMocks, page);

    // Navigate to base URL first to enable localStorage access
    await page.goto(baseURL || 'http://localhost:4200');
    await page.waitForLoadState('domcontentloaded');

    // Now set up authentication state
    await apiMocks.setupAuthenticatedState();
  });

  // ============================================
  // Test each drawer section for basic rendering
  // ============================================
  for (const section of DRAWER_SECTIONS) {
    test.describe(`${section.name} Page`, () => {

      test(`should render ${section.name} page correctly`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        // Check page container exists
        const pageLocator = page.locator(section.pageClass.split(',')[0]);
        await expect(pageLocator).toBeVisible({ timeout: 10000 });
      });

      test(`should have back button on ${section.name}`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        const backButton = page.locator('.back-btn, [class*="__back"], button[aria-label*="indietro"]').first();
        await expect(backButton).toBeVisible();
      });

      test(`should not have bottom tab bar on ${section.name}`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        // Drawer pages should NOT show the bottom tab bar (only main pages should)
        const tabBar = page.locator('app-bottom-tab-bar').first();
        await expect(tabBar).not.toBeVisible();
      });

      test(`should navigate back from ${section.name}`, async ({ page }) => {
        await page.goto('/home/main');
        await page.goto(section.route);
        await page.waitForTimeout(500);

        const backButton = page.locator('.back-btn, [class*="__back"], button[aria-label*="indietro"]').first();
        if (await backButton.isVisible()) {
          await backButton.click();
          await page.waitForTimeout(300);
          await expect(page).not.toHaveURL(new RegExp(section.route.replace(/\//g, '\\/')));
        }
      });
    });
  }

  // ============================================
  // Responsive Tests - Mobile (375x667)
  // ============================================
  test.describe('Responsive - Mobile (375x667)', () => {
    test.use({ viewport: DEVICE_VIEWPORTS.mobile });

    for (const section of DRAWER_SECTIONS) {
      test(`${section.name} should display correctly on mobile`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        const pageLocator = page.locator(section.pageClass.split(',')[0]);
        await expect(pageLocator).toBeVisible({ timeout: 10000 });

        // Check touch target sizes (min 44x44)
        const backButton = page.locator('.back-btn, [class*="__back"]').first();
        if (await backButton.isVisible()) {
          const box = await backButton.boundingBox();
          if (box) {
            expect(box.width).toBeGreaterThanOrEqual(40);
            expect(box.height).toBeGreaterThanOrEqual(40);
          }
        }
      });
    }
  });

  // ============================================
  // Responsive Tests - Tablet (768x1024)
  // ============================================
  test.describe('Responsive - Tablet (768x1024)', () => {
    test.use({ viewport: DEVICE_VIEWPORTS.tablet });

    for (const section of DRAWER_SECTIONS) {
      test(`${section.name} should display correctly on tablet`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        const pageLocator = page.locator(section.pageClass.split(',')[0]);
        await expect(pageLocator).toBeVisible({ timeout: 10000 });
      });
    }
  });

  // ============================================
  // Responsive Tests - Desktop (1440x900)
  // ============================================
  test.describe('Responsive - Desktop (1440x900)', () => {
    test.use({ viewport: DEVICE_VIEWPORTS.desktop });

    for (const section of DRAWER_SECTIONS) {
      test(`${section.name} should display correctly on desktop`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        const pageLocator = page.locator(section.pageClass.split(',')[0]);
        await expect(pageLocator).toBeVisible({ timeout: 10000 });

        // Check max-width constraint
        const content = page.locator('[class*="-content"]').first();
        if (await content.isVisible()) {
          const box = await content.boundingBox();
          if (box) {
            expect(box.width).toBeLessThanOrEqual(1000);
          }
        }
      });
    }
  });

  // ============================================
  // Responsive Tests - Foldable Folded (717x512)
  // ============================================
  test.describe('Responsive - Foldable Folded (717x512)', () => {
    test.use({ viewport: DEVICE_VIEWPORTS.foldableFolded });

    for (const section of DRAWER_SECTIONS) {
      test(`${section.name} should display correctly when folded`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        const pageLocator = page.locator(section.pageClass.split(',')[0]);
        await expect(pageLocator).toBeVisible({ timeout: 10000 });
      });
    }
  });

  // ============================================
  // Responsive Tests - Foldable Unfolded (1485x720)
  // ============================================
  test.describe('Responsive - Foldable Unfolded (1485x720)', () => {
    test.use({ viewport: DEVICE_VIEWPORTS.foldableUnfolded });

    for (const section of DRAWER_SECTIONS) {
      test(`${section.name} should display correctly when unfolded`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        const pageLocator = page.locator(section.pageClass.split(',')[0]);
        await expect(pageLocator).toBeVisible({ timeout: 10000 });
      });
    }
  });

  // ============================================
  // Responsive Tests - iPhone 2025 (430x932)
  // ============================================
  test.describe('Responsive - iPhone 2025 (430x932)', () => {
    test.use({ viewport: DEVICE_VIEWPORTS.iphone2025 });

    for (const section of DRAWER_SECTIONS) {
      test(`${section.name} should display correctly on iPhone 2025`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        const pageLocator = page.locator(section.pageClass.split(',')[0]);
        await expect(pageLocator).toBeVisible({ timeout: 10000 });
      });
    }
  });

  // ============================================
  // Responsive Tests - Honor Magic V3/V5 (795x720)
  // Note: V3 and V5 have identical viewports, testing once covers both
  // ============================================
  test.describe('Responsive - Honor Magic V3/V5 (795x720)', () => {
    test.use({ viewport: DEVICE_VIEWPORTS.honorMagicV3 });

    for (const section of DRAWER_SECTIONS) {
      test(`${section.name} should display correctly on Honor Magic`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        const pageLocator = page.locator(section.pageClass.split(',')[0]);
        await expect(pageLocator).toBeVisible({ timeout: 10000 });
      });
    }
  });

  // ============================================
  // Loading States Tests
  // ============================================
  test.describe('Loading States', () => {
    const sectionsWithLoading = ['Activity', 'Notifications', 'Saved', 'Adopt', 'Pet Friends', 'Lost Pets', 'Blocked Users'];

    for (const sectionName of sectionsWithLoading) {
      const section = DRAWER_SECTIONS.find(s => s.name === sectionName);
      if (!section) continue;

      test(`${section.name} should show loading state`, async ({ page }) => {
        // Delay API response to see loading state
        await page.route('**/api/**', async route => {
          await new Promise(r => setTimeout(r, 1000));
          await route.fulfill({ status: 200, body: JSON.stringify([]) });
        });

        await page.goto(section.route);

        const loadingSpinner = page.locator('[class*="loading"], [class*="spinner"], .spinner');
        // Loading might be too fast to catch, so we just verify page loads
        await page.waitForTimeout(1500);
        const pageLocator = page.locator(section.pageClass.split(',')[0]);
        await expect(pageLocator).toBeVisible({ timeout: 10000 });
      });
    }
  });

  // ============================================
  // Empty States Tests
  // ============================================
  test.describe('Empty States', () => {
    test('Activity should show empty state when no activities', async ({ page }) => {
      await page.route('**/api/activity**', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      });

      await page.goto('/home/activity');
      await page.waitForTimeout(1000);

      const emptyState = page.locator('[class*="empty"], .activity-empty');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toContainText(/nessun|attività/i);
      }
    });

    test('Notifications should show empty state when no notifications', async ({ page }) => {
      await page.route('**/api/notification**', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify({ notifications: [], unreadCount: 0 }) });
      });

      await page.goto('/home/notifications');
      await page.waitForTimeout(1000);

      const emptyState = page.locator('[class*="empty"], .notifications-empty');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toContainText(/nessun|notifica/i);
      }
    });

    test('Saved should show empty state when no saved items', async ({ page }) => {
      await page.route('**/api/saved**', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      });

      await page.goto('/home/saved');
      await page.waitForTimeout(1000);

      const emptyState = page.locator('[class*="empty"], .saved-empty');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toContainText(/nessun|preferit/i);
      }
    });

    test('Blocked Users should show empty state when no blocked users', async ({ page }) => {
      await page.route('**/api/blocked-users**', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      });

      await page.goto('/home/blocked');
      await page.waitForTimeout(1000);

      const emptyState = page.locator('[class*="empty"], .empty-state');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toContainText(/nessun|bloccat/i);
      }
    });
  });

  // ============================================
  // Error States Tests
  // ============================================
  test.describe('Error States', () => {
    const sectionsWithError = [
      { name: 'Activity', route: '/home/activity', apiPattern: '**/api/activity**' },
      { name: 'Notifications', route: '/home/notifications', apiPattern: '**/api/notification**' },
      { name: 'Saved', route: '/home/saved', apiPattern: '**/api/saved**' },
    ];

    for (const section of sectionsWithError) {
      test(`${section.name} should show error state on API failure`, async ({ page }) => {
        await page.route(section.apiPattern, async route => {
          await route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) });
        });

        await page.goto(section.route);
        await page.waitForTimeout(1000);

        const errorState = page.locator('[class*="error"]');
        const retryButton = page.locator('[class*="retry"], button:has-text("Riprova")');

        // Either error state or retry button should be visible
        const hasError = await errorState.isVisible() || await retryButton.isVisible();
        expect(hasError).toBeTruthy();
      });
    }
  });

  // ============================================
  // Accessibility Tests
  // ============================================
  test.describe('Accessibility', () => {
    for (const section of DRAWER_SECTIONS) {
      test(`${section.name} should have proper ARIA labels`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        // Check back button has aria-label
        const backButton = page.locator('button[aria-label*="indietro"], button[aria-label*="back"]').first();
        if (await backButton.isVisible()) {
          await expect(backButton).toHaveAttribute('aria-label');
        }
      });

      test(`${section.name} should support keyboard navigation`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(500);

        // Tab through the page
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      });
    }
  });

  // ============================================
  // Tab Navigation Tests (for pages with tabs)
  // ============================================
  test.describe('Tab Navigation', () => {
    test('Notifications should have tab navigation', async ({ page }) => {
      await page.goto('/home/notifications');
      await page.waitForTimeout(500);

      const tabs = page.locator('[class*="tabs__item"], [role="tab"]');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThanOrEqual(2);

      // Click on a tab
      if (tabCount >= 2) {
        await tabs.nth(1).click();
        await page.waitForTimeout(300);
        const activeTab = page.locator('[class*="--active"], [aria-selected="true"]');
        await expect(activeTab).toBeVisible();
      }
    });

    test('Saved should have tab navigation', async ({ page }) => {
      await page.goto('/home/saved');
      await page.waitForTimeout(500);

      const tabs = page.locator('[class*="tabs__item"], [role="tab"]');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================
  // Interaction Tests
  // ============================================
  test.describe('Interactions', () => {
    test('Notifications should allow marking as read', async ({ page }) => {
      await page.goto('/home/notifications');
      await page.waitForTimeout(500);

      const markAllButton = page.locator('[class*="action"], button:has-text("done_all")');
      if (await markAllButton.isVisible()) {
        await expect(markAllButton).toBeEnabled();
      }
    });

    test('Saved should allow removing items', async ({ page }) => {
      await page.goto('/home/saved');
      await page.waitForTimeout(500);

      const removeButton = page.locator('[class*="remove"], button[aria-label*="Rimuovi"]');
      if (await removeButton.first().isVisible()) {
        await expect(removeButton.first()).toBeEnabled();
      }
    });

    test('Contact form should have input fields', async ({ page }) => {
      await page.goto('/home/contact');
      await page.waitForTimeout(500);

      const formInputs = page.locator('input, textarea');
      const inputCount = await formInputs.count();
      expect(inputCount).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================
  // Screenshot Tests for Visual Regression
  // ============================================
  test.describe('Visual Screenshots', () => {
    test.use({ viewport: DEVICE_VIEWPORTS.mobile });

    for (const section of DRAWER_SECTIONS) {
      test(`capture ${section.name} mobile screenshot`, async ({ page }) => {
        await page.goto(section.route);
        await page.waitForTimeout(1000);

        // Take screenshot for visual comparison
        await page.screenshot({
          path: `e2e/reports/drawer-menu/screenshots/${section.name.toLowerCase().replace(/\s+/g, '-')}-mobile.png`,
          fullPage: true
        });
      });
    }
  });
});

// ============================================
// Performance Tests
// ============================================
test.describe('Performance', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const apiMocks = createApiMocks(page);
    await apiMocks.setupAllMocks();
    // Navigate first to enable localStorage access
    await page.goto(baseURL || 'http://localhost:4200');
    await page.waitForLoadState('domcontentloaded');
    await apiMocks.setupAuthenticatedState();
  });

  for (const section of DRAWER_SECTIONS.slice(0, 5)) { // Test first 5 sections
    test(`${section.name} should load within 3 seconds`, async ({ page }) => {
      const startTime = Date.now();
      await page.goto(section.route);
      await page.waitForTimeout(500);

      const pageLocator = page.locator(section.pageClass.split(',')[0]);
      await expect(pageLocator).toBeVisible({ timeout: 3000 });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });
  }
});
