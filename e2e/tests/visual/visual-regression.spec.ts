import { test, expect } from '@playwright/test';
import { AuthPage, UserPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';

/**
 * Visual Regression Tests
 *
 * These tests capture screenshots and compare them against baseline images.
 * Run `npx playwright test --update-snapshots` to update baselines.
 */
test.describe('Visual Regression', () => {
  test.describe('Landing Page', () => {
    test('landing page - desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('landing-desktop.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      });
    });

    test('landing page - tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('landing-tablet.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      });
    });

    test('landing page - mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('landing-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test.describe('Login Page', () => {
    test('login page - desktop', async ({ page }) => {
      const authPage = new AuthPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await authPage.goToLogin();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('login-desktop.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('login page - mobile', async ({ page }) => {
      const authPage = new AuthPage(page);
      await page.setViewportSize({ width: 375, height: 667 });
      await authPage.goToLogin();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('login-mobile.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('login page with validation errors', async ({ page }) => {
      const authPage = new AuthPage(page);
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAuthMocks();

      await page.setViewportSize({ width: 1920, height: 1080 });
      await authPage.goToLogin();
      await authPage.login('wrong@email.com', 'wrong');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('login-error.png', {
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test.describe('Registration Page', () => {
    test('registration page - desktop', async ({ page }) => {
      const authPage = new AuthPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await authPage.goToSignup();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('registration-desktop.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('registration page - mobile', async ({ page }) => {
      const authPage = new AuthPage(page);
      await page.setViewportSize({ width: 375, height: 667 });
      await authPage.goToSignup();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('registration-mobile.png', {
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test.describe('User Area', () => {
    test.beforeEach(async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();
    });

    test('dashboard - desktop', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToDashboard();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('dashboard-desktop.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('dashboard - mobile', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToDashboard();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('dashboard-mobile.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('dashboard - mobile with sidebar open', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToDashboard();
      await userPage.openMobileSidebar();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('dashboard-mobile-sidebar.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('profile - desktop', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToProfile();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('profile-desktop.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('profile - mobile', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToProfile();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('profile-mobile.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('settings - desktop', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToSettings();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('settings-desktop.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('settings - mobile', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToSettings();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('settings-mobile.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('security - desktop', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToSecurity();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('security-desktop.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('security - mobile', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToSecurity();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('security-mobile.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('account - desktop', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToAccount();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('account-desktop.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('account - mobile', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToAccount();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('account-mobile.png', {
        maxDiffPixelRatio: 0.05,
      });
    });

    test('account - delete modal', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToAccount();
      await userPage.deleteAccountButton.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('account-delete-modal.png', {
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test.describe('Component States', () => {
    test.beforeEach(async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();
    });

    test('button hover state', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToProfile();

      await userPage.saveProfileButton.hover();
      await page.waitForTimeout(100); // Wait for hover animation

      await expect(userPage.saveProfileButton).toHaveScreenshot('button-hover.png');
    });

    test('input focus state', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToProfile();

      await userPage.displayNameInput.focus();

      await expect(userPage.displayNameInput).toHaveScreenshot('input-focus.png');
    });

    test('toggle switch states', async ({ page }) => {
      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToSettings();

      // Screenshot of toggle in both states
      const toggle = userPage.emailNotificationsToggle;
      await expect(toggle).toHaveScreenshot('toggle-state.png');
    });
  });

  test.describe('Loading States', () => {
    test('loading spinner appearance', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAuthenticatedState();

      // Mock slow response
      await apiMocks.mockSlowResponse('**/api/profile', 5000);

      const userPage = new UserPage(page);
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/user/profile');

      // Capture loading state
      await expect(userPage.loadingSpinner).toHaveScreenshot('loading-spinner.png');
    });
  });

  test.describe('Error States', () => {
    test('error message appearance', async ({ page }) => {
      const authPage = new AuthPage(page);
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAuthMocks();

      await page.setViewportSize({ width: 1920, height: 1080 });
      await authPage.goToLogin();
      await authPage.login('wrong@email.com', 'wrong');

      await expect(authPage.formError).toHaveScreenshot('error-message.png');
    });

    test('network error state', async ({ page }) => {
      const authPage = new AuthPage(page);
      const apiMocks = createApiMocks(page);
      await apiMocks.mockNetworkFailure('**/api/auth/login');

      await page.setViewportSize({ width: 1920, height: 1080 });
      await authPage.goToLogin();
      await authPage.login('test@email.com', 'password');

      await expect(page).toHaveScreenshot('network-error.png', {
        maxDiffPixelRatio: 0.05,
      });
    });
  });
});
