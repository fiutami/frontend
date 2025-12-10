import { test, expect } from '@playwright/test';
import { UserPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';
import { testProfile } from '../../fixtures/test-data';

test.describe('User Profile', () => {
  let userPage: UserPage;

  test.beforeEach(async ({ page }) => {
    userPage = new UserPage(page);
    const apiMocks = createApiMocks(page);
    await apiMocks.setupAllMocks();
    await apiMocks.setupAuthenticatedState();
  });

  test.describe('Profile Display', () => {
    test('should display profile page', async ({ page }) => {
      await userPage.goToProfile();
      await userPage.expectProfile();
    });

    test('should display profile form', async ({ page }) => {
      await userPage.goToProfile();
      await expect(userPage.profileForm).toBeVisible();
    });

    test('should load existing profile data', async ({ page }) => {
      await userPage.goToProfile();

      await expect(userPage.displayNameInput).toHaveValue(testProfile.displayName);
      await expect(userPage.bioInput).toHaveValue(testProfile.bio);
    });

    test('should show Google account badge for OAuth users', async ({ page }) => {
      await userPage.goToProfile();
      await expect(userPage.googleBadge).toBeVisible();
    });
  });

  test.describe('Profile Editing', () => {
    test('should update display name', async ({ page }) => {
      await userPage.goToProfile();

      const newName = 'Nuovo Nome';
      await userPage.displayNameInput.clear();
      await userPage.displayNameInput.fill(newName);
      await userPage.saveProfileButton.click();

      await userPage.expectSuccessMessage();
    });

    test('should update bio', async ({ page }) => {
      await userPage.goToProfile();

      const newBio = 'Nuova biografia aggiornata';
      await userPage.bioInput.clear();
      await userPage.bioInput.fill(newBio);
      await userPage.saveProfileButton.click();

      await userPage.expectSuccessMessage();
    });

    test('should update city', async ({ page }) => {
      await userPage.goToProfile();

      await userPage.cityInput.clear();
      await userPage.cityInput.fill('Roma');
      await userPage.saveProfileButton.click();

      await userPage.expectSuccessMessage();
    });

    test('should update country', async ({ page }) => {
      await userPage.goToProfile();

      await userPage.countryInput.clear();
      await userPage.countryInput.fill('Italia');
      await userPage.saveProfileButton.click();

      await userPage.expectSuccessMessage();
    });

    test('should update phone number', async ({ page }) => {
      await userPage.goToProfile();

      await userPage.phoneInput.clear();
      await userPage.phoneInput.fill('+39 333 1234567');
      await userPage.saveProfileButton.click();

      await userPage.expectSuccessMessage();
    });

    test('should update multiple fields at once', async ({ page }) => {
      await userPage.goToProfile();

      await userPage.updateProfile({
        displayName: 'Mario Rossi',
        bio: 'Developer appassionato',
        city: 'Milano',
        country: 'Italia',
        phone: '+39 02 1234567',
      });

      await userPage.expectSuccessMessage();
    });
  });

  test.describe('Profile Validation', () => {
    test('should validate display name length', async ({ page }) => {
      await userPage.goToProfile();

      // Test max length
      const longName = 'A'.repeat(100);
      await userPage.displayNameInput.fill(longName);
      await userPage.saveProfileButton.click();

      // Should show error or truncate
      await expect(userPage.displayNameInput).not.toHaveValue(longName);
    });

    test('should validate phone number format', async ({ page }) => {
      await userPage.goToProfile();

      await userPage.phoneInput.fill('invalid-phone');
      await userPage.saveProfileButton.click();

      // Should show validation error
      await expect(page.locator('text=Formato non valido')).toBeVisible();
    });

    test('should allow empty optional fields', async ({ page }) => {
      await userPage.goToProfile();

      await userPage.bioInput.clear();
      await userPage.cityInput.clear();
      await userPage.saveProfileButton.click();

      await userPage.expectSuccessMessage();
    });
  });

  test.describe('Profile Error Handling', () => {
    test('should handle network error on save', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.mockNetworkFailure('**/api/profile');

      await userPage.goToProfile();
      await userPage.displayNameInput.fill('Test');
      await userPage.saveProfileButton.click();

      await userPage.expectErrorMessage();
    });

    test('should handle server error on save', async ({ page }) => {
      await page.route('**/api/profile', async (route) => {
        if (route.request().method() === 'PUT') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error' }),
          });
        } else {
          await route.continue();
        }
      });

      await userPage.goToProfile();
      await userPage.displayNameInput.fill('Test');
      await userPage.saveProfileButton.click();

      await userPage.expectErrorMessage();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToProfile();
      await userPage.expectProfile();
    });

    test('should display properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await userPage.goToProfile();
      await userPage.expectProfile();
    });

    test('should display properly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToProfile();
      await userPage.expectProfile();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to profile from dashboard', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.navigateToSection('profile');
      await userPage.expectProfile();
    });

    test('should highlight active nav item', async ({ page }) => {
      await userPage.goToProfile();
      await expect(userPage.profileLink).toHaveClass(/--active/);
    });
  });
});
