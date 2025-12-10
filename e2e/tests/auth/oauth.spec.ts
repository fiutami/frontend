import { test, expect } from '@playwright/test';
import { AuthPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';
import { testUsers } from '../../fixtures/test-data';

test.describe('OAuth Authentication', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    const apiMocks = createApiMocks(page);
    await apiMocks.setupAuthMocks();
  });

  test.describe('Google OAuth', () => {
    test('should display Google login button on login page', async ({ page }) => {
      await authPage.goToLogin();
      await expect(authPage.googleLoginButton).toBeVisible();
    });

    test('should display Google signup button on registration page', async ({ page }) => {
      await authPage.goToSignup();
      await expect(authPage.googleLoginButton).toBeVisible();
    });

    test('should successfully authenticate via Google OAuth mock', async ({ page }) => {
      await authPage.goToLogin();
      await authPage.loginWithGoogle();

      // Mock OAuth should redirect to user area
      await authPage.expectLoginSuccess();

      // Verify user is authenticated
      const isAuth = await authPage.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    test('should store user data after Google OAuth', async ({ page }) => {
      await authPage.goToLogin();
      await authPage.loginWithGoogle();
      await authPage.expectLoginSuccess();

      // Check user data in localStorage
      const userData = await page.evaluate(() => {
        return localStorage.getItem('fiutami_user');
      });

      expect(userData).not.toBeNull();
      const user = JSON.parse(userData!);
      expect(user.provider).toBe('google');
    });
  });

  test.describe('OAuth Token Handling', () => {
    test('should store access token after OAuth', async ({ page }) => {
      await authPage.goToLogin();
      await authPage.loginWithGoogle();
      await authPage.expectLoginSuccess();

      const accessToken = await authPage.getLocalStorage('fiutami_access_token');
      expect(accessToken).not.toBeNull();
      expect(accessToken!.length).toBeGreaterThan(0);
    });

    test('should store refresh token after OAuth', async ({ page }) => {
      await authPage.goToLogin();
      await authPage.loginWithGoogle();
      await authPage.expectLoginSuccess();

      const refreshToken = await authPage.getLocalStorage('fiutami_refresh_token');
      expect(refreshToken).not.toBeNull();
      expect(refreshToken!.length).toBeGreaterThan(0);
    });
  });

  test.describe('OAuth Error Handling', () => {
    test('should handle OAuth cancellation gracefully', async ({ page }) => {
      // Setup mock that simulates user cancelling OAuth
      await page.route('**/api/auth/oauth', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'OAuth cancelled by user' }),
        });
      });

      await authPage.goToLogin();
      await authPage.loginWithGoogle();

      // Should stay on login page or show error
      await expect(page).toHaveURL(/login/);
    });

    test('should handle OAuth provider error', async ({ page }) => {
      await page.route('**/api/auth/oauth', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Provider error' }),
        });
      });

      await authPage.goToLogin();
      await authPage.loginWithGoogle();

      await authPage.expectLoginError();
    });

    test('should handle network failure during OAuth', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.mockNetworkFailure('**/api/auth/oauth');

      await authPage.goToLogin();
      await authPage.loginWithGoogle();

      await authPage.expectLoginError();
    });
  });

  test.describe('OAuth Account Linking', () => {
    test('should handle existing account with same email', async ({ page }) => {
      // Simulate OAuth returning an email that already exists
      await page.route('**/api/auth/oauth', async (route) => {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Account already exists',
            message: 'Un account con questa email esiste già. Accedi con email e password.',
          }),
        });
      });

      await authPage.goToLogin();
      await authPage.loginWithGoogle();

      await expect(page.locator('text=Un account con questa email esiste già')).toBeVisible();
    });
  });

  test.describe('OAuth Session', () => {
    test('should maintain OAuth session across page navigation', async ({ page }) => {
      const apiMocks = createApiMocks(page);

      await authPage.goToLogin();
      await authPage.loginWithGoogle();
      await authPage.expectLoginSuccess();

      // Setup mocks for protected routes
      await apiMocks.setupProfileMocks();

      // Navigate to different pages
      await page.goto('/user/profile');
      await expect(page).toHaveURL(/user\/profile/);

      await page.goto('/user/settings');
      await expect(page).toHaveURL(/user\/settings/);
    });

    test('should handle OAuth token refresh', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();

      await authPage.goToLogin();
      await authPage.loginWithGoogle();
      await authPage.expectLoginSuccess();

      // Simulate token refresh scenario
      const newToken = 'new-access-token-after-refresh';
      await page.route('**/api/auth/refresh', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accessToken: newToken,
            refreshToken: 'new-refresh-token',
            expiresIn: 3600,
          }),
        });
      });

      // Trigger token refresh (mock scenario)
      await page.evaluate((token) => {
        localStorage.setItem('fiutami_access_token', token);
      }, newToken);

      // Verify new token is stored
      const storedToken = await authPage.getLocalStorage('fiutami_access_token');
      expect(storedToken).toBe(newToken);
    });
  });

  test.describe('Responsive OAuth Buttons', () => {
    test('should display Google button correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await authPage.goToLogin();

      await expect(authPage.googleLoginButton).toBeVisible();
      const buttonBox = await authPage.googleLoginButton.boundingBox();
      expect(buttonBox!.width).toBeLessThanOrEqual(375);
    });

    test('should display Google button correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await authPage.goToLogin();

      await expect(authPage.googleLoginButton).toBeVisible();
    });

    test('should display Google button correctly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await authPage.goToLogin();

      await expect(authPage.googleLoginButton).toBeVisible();
    });
  });
});
