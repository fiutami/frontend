import { test, expect } from '@playwright/test';
import { UserPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';
import { testSettings } from '../../fixtures/test-data';

test.describe('User Settings', () => {
  let userPage: UserPage;

  test.beforeEach(async ({ page }) => {
    userPage = new UserPage(page);
    const apiMocks = createApiMocks(page);
    await apiMocks.setupAllMocks();
    await apiMocks.setupAuthenticatedState();
  });

  test.describe('Settings Display', () => {
    test('should display settings page', async ({ page }) => {
      await userPage.goToSettings();
      await userPage.expectSettings();
    });

    test('should display settings form', async ({ page }) => {
      await userPage.goToSettings();
      await expect(userPage.settingsForm).toBeVisible();
    });

    test('should load existing settings', async ({ page }) => {
      await userPage.goToSettings();

      // Check toggles reflect saved state
      if (testSettings.emailNotifications) {
        await expect(userPage.emailNotificationsToggle).toBeChecked();
      }
    });
  });

  test.describe('Notification Settings', () => {
    test('should toggle email notifications', async ({ page }) => {
      await userPage.goToSettings();

      const initialState = await userPage.emailNotificationsToggle.isChecked();
      await userPage.toggleSetting('emailNotifications');
      await userPage.saveSettings();

      await userPage.expectSuccessMessage();
      const newState = await userPage.emailNotificationsToggle.isChecked();
      expect(newState).toBe(!initialState);
    });

    test('should toggle push notifications', async ({ page }) => {
      await userPage.goToSettings();

      const initialState = await userPage.pushNotificationsToggle.isChecked();
      await userPage.toggleSetting('pushNotifications');
      await userPage.saveSettings();

      await userPage.expectSuccessMessage();
      const newState = await userPage.pushNotificationsToggle.isChecked();
      expect(newState).toBe(!initialState);
    });

    test('should toggle marketing emails', async ({ page }) => {
      await userPage.goToSettings();

      const initialState = await userPage.marketingEmailsToggle.isChecked();
      await userPage.toggleSetting('marketingEmails');
      await userPage.saveSettings();

      await userPage.expectSuccessMessage();
      const newState = await userPage.marketingEmailsToggle.isChecked();
      expect(newState).toBe(!initialState);
    });
  });

  test.describe('Privacy Settings', () => {
    test('should toggle profile public visibility', async ({ page }) => {
      await userPage.goToSettings();

      const initialState = await userPage.profilePublicToggle.isChecked();
      await userPage.toggleSetting('profilePublic');
      await userPage.saveSettings();

      await userPage.expectSuccessMessage();
      const newState = await userPage.profilePublicToggle.isChecked();
      expect(newState).toBe(!initialState);
    });
  });

  test.describe('Preference Settings', () => {
    test('should change language preference', async ({ page }) => {
      await userPage.goToSettings();

      await userPage.selectLanguage('en');
      await userPage.saveSettings();

      await userPage.expectSuccessMessage();
      await expect(userPage.languageSelect).toHaveValue('en');
    });

    test('should change theme preference', async ({ page }) => {
      await userPage.goToSettings();

      await userPage.selectTheme('dark');
      await userPage.saveSettings();

      await userPage.expectSuccessMessage();
      await expect(userPage.themeSelect).toHaveValue('dark');
    });

    test('should have light theme option', async ({ page }) => {
      await userPage.goToSettings();

      await userPage.selectTheme('light');
      await userPage.saveSettings();

      await expect(userPage.themeSelect).toHaveValue('light');
    });

    test('should have system theme option', async ({ page }) => {
      await userPage.goToSettings();

      await userPage.selectTheme('system');
      await userPage.saveSettings();

      await expect(userPage.themeSelect).toHaveValue('system');
    });
  });

  test.describe('Multiple Settings Changes', () => {
    test('should save multiple settings at once', async ({ page }) => {
      await userPage.goToSettings();

      await userPage.toggleSetting('emailNotifications');
      await userPage.toggleSetting('pushNotifications');
      await userPage.selectLanguage('en');
      await userPage.selectTheme('dark');
      await userPage.saveSettings();

      await userPage.expectSuccessMessage();
    });
  });

  test.describe('Settings Error Handling', () => {
    test('should handle network error on save', async ({ page }) => {
      const apiMocks = createApiMocks(page);

      await userPage.goToSettings();

      // Mock network failure for settings update
      await apiMocks.mockNetworkFailure('**/api/settings/**');

      await userPage.toggleSetting('emailNotifications');
      await userPage.saveSettings();

      await userPage.expectErrorMessage();
    });

    test('should handle server error on save', async ({ page }) => {
      await userPage.goToSettings();

      await page.route('**/api/settings/**', async (route) => {
        if (route.request().method() === 'PUT' || route.request().method() === 'POST') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error' }),
          });
        } else {
          await route.continue();
        }
      });

      await userPage.toggleSetting('emailNotifications');
      await userPage.saveSettings();

      await userPage.expectErrorMessage();
    });
  });

  test.describe('Settings Persistence', () => {
    test('should persist settings after page reload', async ({ page }) => {
      await userPage.goToSettings();

      // Change and save
      await userPage.selectTheme('dark');
      await userPage.saveSettings();
      await userPage.expectSuccessMessage();

      // Reload page
      await page.reload();
      await userPage.waitForLoadingToFinish();

      // Verify persisted
      await expect(userPage.themeSelect).toHaveValue('dark');
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToSettings();
      await userPage.expectSettings();
    });

    test('should display properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await userPage.goToSettings();
      await userPage.expectSettings();
    });

    test('should display properly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToSettings();
      await userPage.expectSettings();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to settings from dashboard', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.navigateToSection('settings');
      await userPage.expectSettings();
    });

    test('should highlight active nav item', async ({ page }) => {
      await userPage.goToSettings();
      await expect(userPage.settingsLink).toHaveClass(/--active/);
    });
  });
});
