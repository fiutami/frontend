import { test, expect } from '@playwright/test';
import { UserPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';
import { testSessions } from '../../fixtures/test-data';

test.describe('User Security', () => {
  let userPage: UserPage;

  test.beforeEach(async ({ page }) => {
    userPage = new UserPage(page);
    const apiMocks = createApiMocks(page);
    await apiMocks.setupAllMocks();
    await apiMocks.setupAuthenticatedState();
  });

  test.describe('Security Page Display', () => {
    test('should display security page', async ({ page }) => {
      await userPage.goToSecurity();
      await userPage.expectSecurity();
    });

    test('should display change password section', async ({ page }) => {
      await userPage.goToSecurity();
      await expect(userPage.changePasswordButton).toBeVisible();
    });

    test('should display active sessions', async ({ page }) => {
      await userPage.goToSecurity();
      await expect(userPage.sessionCards.first()).toBeVisible();
    });

    test('should show current session badge', async ({ page }) => {
      await userPage.goToSecurity();
      await expect(userPage.currentSessionBadge).toBeVisible();
    });
  });

  test.describe('Password Change', () => {
    test('should open password change form', async ({ page }) => {
      await userPage.goToSecurity();
      await userPage.changePasswordButton.click();
      await expect(userPage.passwordForm).toBeVisible();
    });

    test('should change password successfully', async ({ page }) => {
      await userPage.goToSecurity();
      await userPage.changePassword('currentPassword123', 'NewSecurePass456!');
      await userPage.expectSuccessMessage();
    });

    test('should show error for wrong current password', async ({ page }) => {
      await userPage.goToSecurity();
      await userPage.changePassword('wrongpassword', 'NewSecurePass456!');

      await expect(page.locator('text=Password attuale non corretta')).toBeVisible();
    });

    test('should validate new password strength', async ({ page }) => {
      await userPage.goToSecurity();
      await userPage.changePasswordButton.click();

      await userPage.currentPasswordInput.fill('currentPassword123');
      await userPage.newPasswordInput.fill('weak');
      await userPage.confirmPasswordInput.fill('weak');
      await userPage.submitPasswordButton.click();

      // Should show password strength error
      await expect(page.locator('text=almeno 8 caratteri')).toBeVisible();
    });

    test('should validate password confirmation match', async ({ page }) => {
      await userPage.goToSecurity();
      await userPage.changePasswordButton.click();

      await userPage.currentPasswordInput.fill('currentPassword123');
      await userPage.newPasswordInput.fill('NewSecurePass456!');
      await userPage.confirmPasswordInput.fill('DifferentPass789!');
      await userPage.submitPasswordButton.click();

      await expect(page.locator('text=Le password non coincidono')).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should display all active sessions', async ({ page }) => {
      await userPage.goToSecurity();

      const sessionCount = await userPage.sessionCards.count();
      expect(sessionCount).toBeGreaterThanOrEqual(1);
    });

    test('should display session details', async ({ page }) => {
      await userPage.goToSecurity();

      const firstSession = userPage.sessionCards.first();
      await expect(firstSession.locator('[class*="device"], [class*="browser"]')).toBeVisible();
    });

    test('should show current session indicator', async ({ page }) => {
      await userPage.goToSecurity();

      await expect(userPage.currentSessionBadge).toContainText(/corrente|current/i);
    });

    test('should revoke single session', async ({ page }) => {
      await userPage.goToSecurity();

      // Find a non-current session to revoke
      const nonCurrentSessions = userPage.sessionCards.filter({
        hasNot: userPage.currentSessionBadge,
      });

      if ((await nonCurrentSessions.count()) > 0) {
        const revokeButton = nonCurrentSessions.first().locator(userPage.revokeSessionButton);
        await revokeButton.click();

        await userPage.expectSuccessMessage();
      }
    });

    test('should revoke all other sessions', async ({ page }) => {
      await userPage.goToSecurity();

      await userPage.revokeAllOtherSessions();
      await userPage.expectSuccessMessage();
    });

    test('should not allow revoking current session', async ({ page }) => {
      await userPage.goToSecurity();

      const currentSession = userPage.sessionCards.filter({
        has: userPage.currentSessionBadge,
      });

      // Current session should not have revoke button or it should be disabled
      const revokeButton = currentSession.locator(userPage.revokeSessionButton);
      await expect(revokeButton).toHaveCount(0);
    });
  });

  test.describe('Google Account Info', () => {
    test('should show Google account connection info', async ({ page }) => {
      await userPage.goToSecurity();
      await expect(userPage.googleAccountInfo).toBeVisible();
    });

    test('should indicate account linked with Google', async ({ page }) => {
      await userPage.goToSecurity();
      await expect(page.locator('text=Google')).toBeVisible();
    });
  });

  test.describe('Security Error Handling', () => {
    test('should handle network error on password change', async ({ page }) => {
      const apiMocks = createApiMocks(page);

      await userPage.goToSecurity();

      await apiMocks.mockNetworkFailure('**/api/account/change-password');

      await userPage.changePassword('currentPassword123', 'NewSecurePass456!');
      await userPage.expectErrorMessage();
    });

    test('should handle network error on session revoke', async ({ page }) => {
      const apiMocks = createApiMocks(page);

      await userPage.goToSecurity();

      await apiMocks.mockNetworkFailure('**/api/session/**');

      await userPage.revokeAllOtherSessions();
      await userPage.expectErrorMessage();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToSecurity();
      await userPage.expectSecurity();
    });

    test('should display properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await userPage.goToSecurity();
      await userPage.expectSecurity();
    });

    test('should display properly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToSecurity();
      await userPage.expectSecurity();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to security from dashboard', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.navigateToSection('security');
      await userPage.expectSecurity();
    });

    test('should highlight active nav item', async ({ page }) => {
      await userPage.goToSecurity();
      await expect(userPage.securityLink).toHaveClass(/--active/);
    });
  });
});
