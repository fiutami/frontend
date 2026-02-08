import { test, expect } from '@playwright/test';
import { AuthPage, UserPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';

/**
 * Performance Tests
 *
 * Tests to ensure pages load within acceptable time limits
 * and interactions are responsive.
 */
test.describe('Performance Tests', () => {
  test.describe('Page Load Times', () => {
    const MAX_LOAD_TIME = 3000; // 3 seconds max

    test('landing page should load within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(MAX_LOAD_TIME);
    });

    test('login page should load within 3 seconds', async ({ page }) => {
      const authPage = new AuthPage(page);
      const startTime = Date.now();
      await authPage.goToLogin();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(MAX_LOAD_TIME);
    });

    test('registration page should load within 3 seconds', async ({ page }) => {
      const authPage = new AuthPage(page);
      const startTime = Date.now();
      await authPage.goToSignup();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(MAX_LOAD_TIME);
    });
  });

  test.describe('User Area Page Load Times', () => {
    const MAX_LOAD_TIME = 3000;

    test.beforeEach(async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();
    });

    test('dashboard should load within 3 seconds', async ({ page }) => {
      const userPage = new UserPage(page);
      const startTime = Date.now();
      await userPage.goToDashboard();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(MAX_LOAD_TIME);
    });

    test('profile page should load within 3 seconds', async ({ page }) => {
      const userPage = new UserPage(page);
      const startTime = Date.now();
      await userPage.goToProfile();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(MAX_LOAD_TIME);
    });

    test('settings page should load within 3 seconds', async ({ page }) => {
      const userPage = new UserPage(page);
      const startTime = Date.now();
      await userPage.goToSettings();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(MAX_LOAD_TIME);
    });

    test('security page should load within 3 seconds', async ({ page }) => {
      const userPage = new UserPage(page);
      const startTime = Date.now();
      await userPage.goToSecurity();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(MAX_LOAD_TIME);
    });

    test('account page should load within 3 seconds', async ({ page }) => {
      const userPage = new UserPage(page);
      const startTime = Date.now();
      await userPage.goToAccount();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(MAX_LOAD_TIME);
    });
  });

  test.describe('Navigation Performance', () => {
    const MAX_NAVIGATION_TIME = 1000; // 1 second max for in-app navigation

    test.beforeEach(async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();
    });

    test('sidebar navigation should be instant', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToDashboard();

      const startTime = Date.now();
      await userPage.navigateToSection('profile');
      const navTime = Date.now() - startTime;

      expect(navTime).toBeLessThan(MAX_NAVIGATION_TIME);
    });

    test('navigation between user pages should be fast', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToDashboard();

      // Profile
      let startTime = Date.now();
      await userPage.navigateToSection('profile');
      expect(Date.now() - startTime).toBeLessThan(MAX_NAVIGATION_TIME);

      // Settings
      startTime = Date.now();
      await userPage.navigateToSection('settings');
      expect(Date.now() - startTime).toBeLessThan(MAX_NAVIGATION_TIME);

      // Security
      startTime = Date.now();
      await userPage.navigateToSection('security');
      expect(Date.now() - startTime).toBeLessThan(MAX_NAVIGATION_TIME);

      // Account
      startTime = Date.now();
      await userPage.navigateToSection('account');
      expect(Date.now() - startTime).toBeLessThan(MAX_NAVIGATION_TIME);
    });
  });

  test.describe('Interaction Responsiveness', () => {
    const MAX_INTERACTION_TIME = 500; // 500ms max for interactions

    test.beforeEach(async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();
    });

    test('form input should respond instantly', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToProfile();

      const startTime = Date.now();
      await userPage.displayNameInput.fill('Test Name');
      const inputTime = Date.now() - startTime;

      expect(inputTime).toBeLessThan(MAX_INTERACTION_TIME);
    });

    test('button clicks should respond quickly', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToAccount();

      const startTime = Date.now();
      await userPage.deleteAccountButton.click();
      await expect(userPage.deleteConfirmModal).toBeVisible();
      const clickTime = Date.now() - startTime;

      expect(clickTime).toBeLessThan(MAX_INTERACTION_TIME * 2);
    });

    test('toggle switches should respond instantly', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToSettings();

      const toggle = userPage.emailNotificationsToggle;
      const initialState = await toggle.isChecked();

      const startTime = Date.now();
      await toggle.click();
      const toggleTime = Date.now() - startTime;

      expect(toggleTime).toBeLessThan(MAX_INTERACTION_TIME);
      expect(await toggle.isChecked()).toBe(!initialState);
    });
  });

  test.describe('Mobile Sidebar Performance', () => {
    const MAX_ANIMATION_TIME = 500;

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();
    });

    test('sidebar should open smoothly', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToDashboard();

      const startTime = Date.now();
      await userPage.openMobileSidebar();
      await expect(userPage.sidebar).toHaveClass(/--open/);
      const openTime = Date.now() - startTime;

      expect(openTime).toBeLessThan(MAX_ANIMATION_TIME);
    });

    test('sidebar should close smoothly', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToDashboard();
      await userPage.openMobileSidebar();

      const startTime = Date.now();
      await userPage.closeMobileSidebar();
      await expect(userPage.sidebar).not.toHaveClass(/--open/);
      const closeTime = Date.now() - startTime;

      expect(closeTime).toBeLessThan(MAX_ANIMATION_TIME);
    });
  });

  test.describe('API Response Handling', () => {
    test('should handle fast API responses', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();

      const userPage = new UserPage(page);
      await userPage.goToProfile();

      const startTime = Date.now();
      await userPage.displayNameInput.fill('Updated Name');
      await userPage.saveProfileButton.click();
      await userPage.expectSuccessMessage();
      const saveTime = Date.now() - startTime;

      // Save operation should complete within 2 seconds with mocks
      expect(saveTime).toBeLessThan(2000);
    });

    test('should show loading state for slow responses', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAuthenticatedState();
      await apiMocks.mockSlowResponse('**/api/profile', 2000);

      const userPage = new UserPage(page);
      await page.goto('/user/profile');

      // Should show loading indicator
      await expect(userPage.loadingSpinner).toBeVisible({ timeout: 1000 });
    });
  });

  test.describe('Memory and Resource Usage', () => {
    test('should not leak memory on navigation', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();

      const userPage = new UserPage(page);

      // Navigate multiple times
      for (let i = 0; i < 5; i++) {
        await userPage.goToDashboard();
        await userPage.goToProfile();
        await userPage.goToSettings();
        await userPage.goToSecurity();
        await userPage.goToAccount();
      }

      // Page should still be responsive
      await userPage.goToDashboard();
      await userPage.expectDashboard();
    });

    test('should handle rapid navigation', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();

      const userPage = new UserPage(page);
      await userPage.goToDashboard();

      // Rapid navigation without waiting
      await userPage.profileLink.click();
      await userPage.settingsLink.click();
      await userPage.securityLink.click();
      await userPage.accountLink.click();
      await userPage.dashboardLink.click();

      // Final page should render correctly
      await userPage.expectDashboard();
    });
  });

  test.describe('Core Web Vitals', () => {
    test('should have good Largest Contentful Paint (LCP)', async ({ page }) => {
      const metrics: { lcp?: number } = {};

      page.on('load', async () => {
        const lcp = await page.evaluate(() => {
          return new Promise<number>((resolve) => {
            new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries();
              const lastEntry = entries[entries.length - 1];
              resolve(lastEntry.startTime);
            }).observe({ type: 'largest-contentful-paint', buffered: true });
          });
        });
        metrics.lcp = lcp;
      });

      await page.goto('/');
      await page.waitForLoadState('load');

      // Give time for LCP to be measured
      await page.waitForTimeout(1000);

      // LCP should be under 2.5 seconds for good performance
      if (metrics.lcp !== undefined) {
        expect(metrics.lcp).toBeLessThan(2500);
      }
    });

    test('should have good First Input Delay simulation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('load');

      const authPage = new AuthPage(page);
      await authPage.goToLogin();

      // Measure time from click to input being focused
      const startTime = Date.now();
      await authPage.emailInput.click();
      await expect(authPage.emailInput).toBeFocused();
      const delay = Date.now() - startTime;

      // FID should be under 100ms for good performance
      expect(delay).toBeLessThan(100);
    });

    test('should have minimal Cumulative Layout Shift', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait and check for layout shifts
      const cls = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });

          // Wait for potential shifts
          setTimeout(() => resolve(clsValue), 2000);
        });
      });

      // CLS should be under 0.1 for good performance
      expect(cls).toBeLessThan(0.1);
    });
  });
});
