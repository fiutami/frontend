import { test, expect, devices } from '@playwright/test';

// Device configurations for responsive testing
const DEVICES = {
  mobile: { width: 375, height: 667 },
  mobileLarge: { width: 414, height: 896 },
  tablet: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  foldable: { width: 717, height: 512 },
  desktop: { width: 1280, height: 800 },
  desktopLarge: { width: 1920, height: 1080 },
};

test.describe('Lost Pets Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user', JSON.stringify({ id: 'user_1', name: 'Test User' }));
    });
  });

  test.describe('Page Load & Structure', () => {
    test('should display page header with title', async ({ page }) => {
      await page.goto('/home/lost-pets');

      const header = page.locator('.lost-pets-header');
      await expect(header).toBeVisible();
      await expect(header.locator('.lost-pets-header__title')).toHaveText('Animali Smarriti');
    });

    test('should display back button in header', async ({ page }) => {
      await page.goto('/home/lost-pets');

      const backBtn = page.locator('.lost-pets-header__back');
      await expect(backBtn).toBeVisible();
      await expect(backBtn).toHaveAttribute('aria-label', 'Torna indietro');
    });

    test('should navigate back when clicking back button', async ({ page }) => {
      await page.goto('/home/main');
      await page.goto('/home/lost-pets');

      await page.locator('.lost-pets-header__back').click();
      await expect(page).toHaveURL(/\/home\/main/);
    });

    test('should display bottom tab bar', async ({ page }) => {
      await page.goto('/home/lost-pets');

      const tabBar = page.locator('app-bottom-tab-bar');
      await expect(tabBar).toBeVisible();
    });
  });

  test.describe('Loading State', () => {
    test('should show loading spinner initially', async ({ page }) => {
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });

      await page.goto('/home/lost-pets');

      const loading = page.locator('.lost-pets-loading');
      await expect(loading).toBeVisible();
      await expect(loading.locator('.lost-pets-loading__spinner')).toBeVisible();
      await expect(loading.locator('.lost-pets-loading__text')).toHaveText('Caricamento segnalazioni...');
    });
  });

  test.describe('Lost Pets List', () => {
    test('should display lost pets cards after loading', async ({ page }) => {
      await page.goto('/home/lost-pets');

      // Wait for loading to complete
      await page.waitForSelector('.pet-card', { timeout: 5000 });

      const cards = page.locator('.pet-card');
      await expect(cards.first()).toBeVisible();
    });

    test('should display pet image in card', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      const petImage = page.locator('.pet-card__image img').first();
      await expect(petImage).toBeVisible();
    });

    test('should display pet name and species', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      const petName = page.locator('.pet-card__name').first();
      await expect(petName).toBeVisible();

      const petSpecies = page.locator('.pet-card__species').first();
      await expect(petSpecies).toBeVisible();
    });

    test('should display status badge on each card', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      const statusBadge = page.locator('.pet-card__status-badge').first();
      await expect(statusBadge).toBeVisible();
    });

    test('should display last seen location', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      const location = page.locator('.pet-card__location').first();
      await expect(location).toBeVisible();

      const locationText = page.locator('.pet-card__location-text').first();
      await expect(locationText).toBeVisible();
    });

    test('should display call owner button', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      const callBtn = page.locator('.pet-card__action--call').first();
      await expect(callBtn).toBeVisible();
      await expect(callBtn).toContainText('Chiama');
    });

    test('should display report sighting button', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      const sightingBtn = page.locator('.pet-card__action--sighting').first();
      await expect(sightingBtn).toBeVisible();
      await expect(sightingBtn).toContainText('Segnala avvistamento');
    });
  });

  test.describe('Sighting Modal', () => {
    test('should open sighting modal when clicking report button', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      await page.locator('.pet-card__action--sighting').first().click();

      const modal = page.locator('.sighting-modal');
      await expect(modal).toBeVisible();
    });

    test('should display modal with pet name', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      await page.locator('.pet-card__action--sighting').first().click();

      const petInfo = page.locator('.sighting-modal__pet-info');
      await expect(petInfo).toBeVisible();
      await expect(petInfo).toContainText('Hai visto');
    });

    test('should have location input field', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      await page.locator('.pet-card__action--sighting').first().click();

      const locationInput = page.locator('#location');
      await expect(locationInput).toBeVisible();
      await expect(locationInput).toHaveAttribute('placeholder', /Parco/);
    });

    test('should have notes textarea', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      await page.locator('.pet-card__action--sighting').first().click();

      const notesInput = page.locator('#notes');
      await expect(notesInput).toBeVisible();
    });

    test('should close modal when clicking cancel', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      await page.locator('.pet-card__action--sighting').first().click();
      await expect(page.locator('.sighting-modal')).toBeVisible();

      await page.locator('.sighting-form__btn--cancel').click();
      await expect(page.locator('.sighting-modal')).toBeHidden();
    });

    test('should close modal when clicking overlay', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      await page.locator('.pet-card__action--sighting').first().click();
      await expect(page.locator('.sighting-modal')).toBeVisible();

      await page.locator('.sighting-modal-overlay').click({ position: { x: 10, y: 10 } });
      await expect(page.locator('.sighting-modal')).toBeHidden();
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state when no lost pets', async ({ page }) => {
      // Mock empty response
      await page.route('**/api/lost-pets**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });

      await page.goto('/home/lost-pets');

      const emptyState = page.locator('.lost-pets-empty');
      await expect(emptyState).toBeVisible();
      await expect(emptyState.locator('.lost-pets-empty__text')).toHaveText('Nessun animale segnalato');
    });
  });

  test.describe('Error State', () => {
    test('should display error state on network failure', async ({ page }) => {
      await page.route('**/api/lost-pets**', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/home/lost-pets');

      const errorState = page.locator('.lost-pets-error');
      await expect(errorState).toBeVisible();
    });

    test('should have retry button on error', async ({ page }) => {
      await page.route('**/api/lost-pets**', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/home/lost-pets');

      const retryBtn = page.locator('.lost-pets-error__retry');
      await expect(retryBtn).toBeVisible();
      await expect(retryBtn).toHaveText('Riprova');
    });
  });

  test.describe('Responsive Design', () => {
    for (const [deviceName, viewport] of Object.entries(DEVICES)) {
      test(`should render correctly on ${deviceName}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/home/lost-pets');

        // Header should be visible
        await expect(page.locator('.lost-pets-header')).toBeVisible();

        // Content should be scrollable
        const content = page.locator('.lost-pets-content');
        await expect(content).toBeVisible();

        // Take screenshot for visual comparison
        await expect(page).toHaveScreenshot(`lost-pets-${deviceName}.png`, {
          maxDiffPixelRatio: 0.1,
        });
      });
    }
  });

  test.describe('Accessibility', () => {
    test('should have accessible back button', async ({ page }) => {
      await page.goto('/home/lost-pets');

      const backBtn = page.locator('.lost-pets-header__back');
      await expect(backBtn).toHaveAttribute('aria-label');
      await expect(backBtn).toHaveAttribute('type', 'button');
    });

    test('should have accessible call button', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      const callBtn = page.locator('.pet-card__action--call').first();
      await expect(callBtn).toHaveAttribute('type', 'button');
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/home/lost-pets');
      await page.waitForSelector('.pet-card');

      // Tab to first interactive element
      await page.keyboard.press('Tab');

      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBeTruthy();
    });
  });
});
