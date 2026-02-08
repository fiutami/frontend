import { test, expect } from '@playwright/test';
import { AuthPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';
import { testUsers } from '../../fixtures/test-data';

test.describe('Registration Flow', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    const apiMocks = createApiMocks(page);
    await apiMocks.setupAuthMocks();
  });

  test.describe('Registration Form', () => {
    test.beforeEach(async () => {
      await authPage.goToSignup();
    });

    test('should display registration form elements', async () => {
      await authPage.expectRegistrationForm();
    });

    test('should show Google signup option', async () => {
      await expect(authPage.googleLoginButton).toBeVisible();
    });
  });

  test.describe('Email Registration', () => {
    test.beforeEach(async () => {
      await authPage.goToSignup();
    });

    test('should register successfully with valid data', async ({ page }) => {
      await authPage.register({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'Mario',
        lastName: 'Rossi',
      });

      await authPage.expectRegistrationSuccess();
    });

    test('should show error for existing email', async ({ page }) => {
      await authPage.register({
        email: testUsers.emailUser.email, // Already registered
        password: 'SecurePass123!',
        firstName: 'Mario',
        lastName: 'Rossi',
      });

      await expect(page.locator('text=Email già registrata')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await authPage.emailInput.fill('invalidemail');
      await authPage.emailInput.blur();

      await authPage.expectEmailValidationError();
    });

    test('should validate password strength', async ({ page }) => {
      await authPage.passwordInput.fill('weak');
      await authPage.passwordInput.blur();

      await authPage.expectPasswordValidationError();
    });

    test('should validate password confirmation match', async ({ page }) => {
      await authPage.passwordInput.fill('SecurePass123!');
      await authPage.confirmPasswordInput.fill('DifferentPass123!');
      await authPage.confirmPasswordInput.blur();

      await expect(page.locator('text=Le password non coincidono')).toBeVisible();
    });

    test('should require first name', async ({ page }) => {
      await authPage.lastNameInput.fill('Rossi');
      await authPage.emailInput.fill('test@example.com');
      await authPage.passwordInput.fill('SecurePass123!');
      await authPage.confirmPasswordInput.fill('SecurePass123!');
      await authPage.registerButton.click();

      await expect(authPage.firstNameInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should require last name', async ({ page }) => {
      await authPage.firstNameInput.fill('Mario');
      await authPage.emailInput.fill('test@example.com');
      await authPage.passwordInput.fill('SecurePass123!');
      await authPage.confirmPasswordInput.fill('SecurePass123!');
      await authPage.registerButton.click();

      await expect(authPage.lastNameInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should require terms acceptance when checkbox present', async ({ page }) => {
      // Fill all required fields
      await authPage.firstNameInput.fill('Mario');
      await authPage.lastNameInput.fill('Rossi');
      await authPage.emailInput.fill('test@example.com');
      await authPage.passwordInput.fill('SecurePass123!');
      await authPage.confirmPasswordInput.fill('SecurePass123!');

      // Check if terms checkbox exists
      if (await authPage.termsCheckbox.isVisible()) {
        await authPage.registerButton.click();
        // Should not submit without terms
        await expect(page).not.toHaveURL(/verify|home|user/);
      }
    });
  });

  test.describe('Google OAuth Registration', () => {
    test('should initiate Google OAuth signup flow', async ({ page }) => {
      await authPage.goToSignup();
      await authPage.loginWithGoogle();

      // After mock OAuth, should redirect to user area
      await authPage.expectRegistrationSuccess();
    });
  });

  test.describe('Network Error Handling', () => {
    test('should show error on network failure', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.mockNetworkFailure('**/api/auth/register');

      await authPage.goToSignup();
      await authPage.register({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'Mario',
        lastName: 'Rossi',
      });

      await authPage.expectLoginError();
    });

    test('should handle rate limiting', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.mockRateLimitResponse('**/api/auth/register');

      await authPage.goToSignup();
      await authPage.register({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'Mario',
        lastName: 'Rossi',
      });

      await expect(page.locator('text=Troppi tentativi')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to login from registration', async ({ page }) => {
      await authPage.goToSignup();

      await page.locator('a:has-text("Accedi"), a:has-text("Login")').click();
      await expect(page).toHaveURL(/login/);
    });

    test('should navigate to registration from login', async ({ page }) => {
      await authPage.goToLogin();

      await page.locator('a:has-text("Registrati"), a:has-text("Sign up")').click();
      await expect(page).toHaveURL(/signup|register/);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await authPage.goToSignup();

      await authPage.expectRegistrationForm();
    });

    test('should display properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await authPage.goToSignup();

      await authPage.expectRegistrationForm();
    });
  });
});
