import { test, expect, Download } from '@playwright/test';
import { UserPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';

test.describe('User Account', () => {
  let userPage: UserPage;

  test.beforeEach(async ({ page }) => {
    userPage = new UserPage(page);
    const apiMocks = createApiMocks(page);
    await apiMocks.setupAllMocks();
    await apiMocks.setupAuthenticatedState();
  });

  test.describe('Account Page Display', () => {
    test('should display account page', async ({ page }) => {
      await userPage.goToAccount();
      await userPage.expectAccount();
    });

    test('should display account overview', async ({ page }) => {
      await userPage.goToAccount();
      await expect(userPage.accountOverview).toBeVisible();
    });

    test('should display export data button', async ({ page }) => {
      await userPage.goToAccount();
      await expect(userPage.exportDataButton).toBeVisible();
    });

    test('should display delete account button', async ({ page }) => {
      await userPage.goToAccount();
      await expect(userPage.deleteAccountButton).toBeVisible();
    });
  });

  test.describe('Account Information', () => {
    test('should display account creation date', async ({ page }) => {
      await userPage.goToAccount();
      await expect(page.locator('text=Creato il')).toBeVisible();
    });

    test('should display account type', async ({ page }) => {
      await userPage.goToAccount();
      await expect(page.locator('text=Google')).toBeVisible();
    });

    test('should display email address', async ({ page }) => {
      await userPage.goToAccount();
      await expect(page.locator('text=@')).toBeVisible();
    });
  });

  test.describe('Data Export (GDPR)', () => {
    test('should open export modal', async ({ page }) => {
      await userPage.goToAccount();
      await userPage.exportDataButton.click();

      await expect(userPage.exportModal).toBeVisible();
    });

    test('should export account data', async ({ page }) => {
      await userPage.goToAccount();

      // Listen for download
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        userPage.exportAccountData(),
      ]);

      expect(download).toBeDefined();
    });

    test('should show export success message', async ({ page }) => {
      await userPage.goToAccount();

      // Mock download trigger
      await page.route('**/api/account/export', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { user: {}, profile: {}, settings: {} },
          }),
        });
      });

      await userPage.exportDataButton.click();
      await expect(userPage.exportModal).toBeVisible();
    });

    test('should handle export error', async ({ page }) => {
      await page.route('**/api/account/export', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Export failed' }),
        });
      });

      await userPage.goToAccount();
      await userPage.exportDataButton.click();

      await userPage.expectErrorMessage();
    });
  });

  test.describe('Account Deletion', () => {
    test('should open delete confirmation modal', async ({ page }) => {
      await userPage.goToAccount();
      await userPage.deleteAccountButton.click();

      await expect(userPage.deleteConfirmModal).toBeVisible();
    });

    test('should require confirmation text', async ({ page }) => {
      await userPage.goToAccount();
      await userPage.deleteAccountButton.click();

      await expect(userPage.deleteConfirmInput).toBeVisible();
      await expect(userPage.deleteConfirmInput).toHaveAttribute('placeholder', /elimina/i);
    });

    test('should disable confirm button until text matches', async ({ page }) => {
      await userPage.goToAccount();
      await userPage.deleteAccountButton.click();

      // Button should be disabled initially
      await expect(userPage.confirmDeleteButton).toBeDisabled();

      // Type wrong text
      await userPage.deleteConfirmInput.fill('wrong');
      await expect(userPage.confirmDeleteButton).toBeDisabled();

      // Type correct text
      await userPage.deleteConfirmInput.fill('elimina');
      await expect(userPage.confirmDeleteButton).toBeEnabled();
    });

    test('should cancel account deletion', async ({ page }) => {
      await userPage.goToAccount();
      await userPage.deleteAccountButton.click();

      await userPage.cancelAccountDeletion();
      await expect(userPage.deleteConfirmModal).not.toBeVisible();
    });

    test('should request account deletion', async ({ page }) => {
      await userPage.goToAccount();
      await userPage.requestAccountDeletion();

      await userPage.expectSuccessMessage();
    });

    test('should show deletion scheduled message', async ({ page }) => {
      await userPage.goToAccount();
      await userPage.requestAccountDeletion();

      await expect(page.locator('text=Richiesta eliminazione ricevuta')).toBeVisible();
    });

    test('should show 30-day grace period info', async ({ page }) => {
      await userPage.goToAccount();
      await userPage.deleteAccountButton.click();

      await expect(page.locator('text=30 giorni')).toBeVisible();
    });
  });

  test.describe('Deletion Error Handling', () => {
    test('should handle network error on deletion', async ({ page }) => {
      const apiMocks = createApiMocks(page);

      await userPage.goToAccount();

      await apiMocks.mockNetworkFailure('**/api/account/delete');

      await userPage.deleteAccountButton.click();
      await userPage.deleteConfirmInput.fill('elimina');
      await userPage.confirmDeleteButton.click();

      await userPage.expectErrorMessage();
    });

    test('should handle server error on deletion', async ({ page }) => {
      await page.route('**/api/account/delete', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Deletion failed' }),
        });
      });

      await userPage.goToAccount();
      await userPage.deleteAccountButton.click();
      await userPage.deleteConfirmInput.fill('elimina');
      await userPage.confirmDeleteButton.click();

      await userPage.expectErrorMessage();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToAccount();
      await userPage.expectAccount();
    });

    test('should display delete modal properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToAccount();
      await userPage.deleteAccountButton.click();

      await expect(userPage.deleteConfirmModal).toBeVisible();
      const modalBox = await userPage.deleteConfirmModal.boundingBox();
      expect(modalBox!.width).toBeLessThanOrEqual(375);
    });

    test('should display properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await userPage.goToAccount();
      await userPage.expectAccount();
    });

    test('should display properly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToAccount();
      await userPage.expectAccount();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to account from dashboard', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.navigateToSection('account');
      await userPage.expectAccount();
    });

    test('should highlight active nav item', async ({ page }) => {
      await userPage.goToAccount();
      await expect(userPage.accountLink).toHaveClass(/--active/);
    });
  });

  test.describe('Warning Messages', () => {
    test('should display danger zone styling', async ({ page }) => {
      await userPage.goToAccount();

      const dangerBox = page.locator('.account__danger-box');
      await expect(dangerBox).toBeVisible();
    });

    test('should display warning icon for deletion', async ({ page }) => {
      await userPage.goToAccount();

      await expect(page.locator('[class*="warning"], [class*="danger"]')).toBeVisible();
    });
  });
});
