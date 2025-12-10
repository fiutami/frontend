import { test, expect } from '@playwright/test';
import { AuthPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';
import { testUsers } from '../../fixtures/test-data';

test.describe('Login Flow', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    const apiMocks = createApiMocks(page);
    await apiMocks.setupAuthMocks();
  });

  test.describe('Landing Page', () => {
    test('should display landing page with login option', async ({ page }) => {
      await authPage.goToLanding();
      await authPage.expectLandingPage();
    });

    test('should navigate to login from landing', async ({ page }) => {
      await authPage.goToLanding();
      await authPage.loginLink.click();
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('Login Form', () => {
    test.beforeEach(async () => {
      await authPage.goToLogin();
    });

    test('should display login form elements', async () => {
      await authPage.expectLoginForm();
    });

    test('should show Google login option', async () => {
      await expect(authPage.googleLoginButton).toBeVisible();
    });

    test('should show forgot password link', async () => {
      await expect(authPage.forgotPasswordLink).toBeVisible();
    });
  });

  test.describe('Email Login', () => {
    test.beforeEach(async () => {
      await authPage.goToLogin();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await authPage.login(testUsers.emailUser.email, 'password123');
      await authPage.expectLoginSuccess();

      // Verify token is stored
      const isAuth = await authPage.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await authPage.login('wrong@email.com', 'wrongpassword');
      await authPage.expectLoginError();
    });

    test('should show validation error for empty email', async ({ page }) => {
      await authPage.passwordInput.fill('password123');
      await authPage.loginButton.click();

      // Form should be invalid
      await expect(authPage.emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should show validation error for invalid email format', async ({ page }) => {
      await authPage.emailInput.fill('invalidemail');
      await authPage.passwordInput.fill('password123');
      await authPage.emailInput.blur();

      await authPage.expectEmailValidationError();
    });

    test('should show validation error for empty password', async ({ page }) => {
      await authPage.emailInput.fill(testUsers.emailUser.email);
      await authPage.loginButton.click();

      await expect(authPage.passwordInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  test.describe('Google OAuth Login', () => {
    test('should initiate Google OAuth flow', async ({ page }) => {
      await authPage.goToLogin();

      // In mock mode, Google button triggers OAuth mock
      await authPage.loginWithGoogle();

      // After mock OAuth, should redirect to user area
      await authPage.expectLoginSuccess();
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session after page reload', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAuthenticatedState();
      await apiMocks.setupAllMocks();

      await page.goto('/user/dashboard');
      await page.reload();

      // Should still be on dashboard, not redirected to login
      await expect(page).toHaveURL(/user\/dashboard/);
    });

    test('should redirect to login when session expires', async ({ page }) => {
      await authPage.goToLogin();
      await authPage.login(testUsers.emailUser.email, 'password123');
      await authPage.expectLoginSuccess();

      // Clear session
      await authPage.clearLocalStorage();

      // Try to access protected route
      await page.goto('/user/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('Network Error Handling', () => {
    test('should show error on network failure', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.mockNetworkFailure('**/api/auth/login');

      await authPage.goToLogin();
      await authPage.login(testUsers.emailUser.email, 'password123');

      await authPage.expectLoginError();
    });

    test('should handle slow network gracefully', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.mockSlowResponse('**/api/auth/login', 2000);

      await authPage.goToLogin();
      await authPage.login(testUsers.emailUser.email, 'password123');

      // Should show loading state
      await expect(authPage.loadingSpinner).toBeVisible();

      // Eventually should succeed
      await authPage.expectLoginSuccess();
    });

    test('should show rate limit message', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.mockRateLimitResponse('**/api/auth/login');

      await authPage.goToLogin();
      await authPage.login(testUsers.emailUser.email, 'password123');

      await expect(page.locator('text=Troppi tentativi')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await authPage.goToLogin();

      await authPage.expectLoginForm();
      await expect(authPage.googleLoginButton).toBeVisible();
    });

    test('should display properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await authPage.goToLogin();

      await authPage.expectLoginForm();
    });

    test('should display properly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await authPage.goToLogin();

      await authPage.expectLoginForm();
    });
  });
});
