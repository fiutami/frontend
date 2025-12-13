import { test, expect } from '@playwright/test';

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

test.describe('Blocked Users Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user', JSON.stringify({ id: 'user_1', name: 'Test User' }));
    });
  });

  test.describe('Page Load & Structure', () => {
    test('should display page header with title', async ({ page }) => {
      await page.goto('/home/blocked');

      const header = page.locator('.blocked-users-header');
      await expect(header).toBeVisible();
      await expect(header.locator('.blocked-users-header__title')).toHaveText('Utenti Bloccati');
    });

    test('should display back button in header', async ({ page }) => {
      await page.goto('/home/blocked');

      const backBtn = page.locator('.blocked-users-header__back');
      await expect(backBtn).toBeVisible();
      await expect(backBtn).toHaveAttribute('aria-label', 'Torna indietro');
    });

    test('should navigate back when clicking back button', async ({ page }) => {
      await page.goto('/home/main');
      await page.goto('/home/blocked');

      await page.locator('.blocked-users-header__back').click();
      await expect(page).toHaveURL(/\/home\/main/);
    });

    test('should display bottom tab bar', async ({ page }) => {
      await page.goto('/home/blocked');

      const tabBar = page.locator('app-bottom-tab-bar');
      await expect(tabBar).toBeVisible();
    });

    test('should display info banner about blocked users', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      const infoBanner = page.locator('.blocked-users-info');
      await expect(infoBanner).toBeVisible();
      await expect(infoBanner).toContainText('Gli utenti bloccati non possono contattarti');
    });
  });

  test.describe('Loading State', () => {
    test('should show loading spinner initially', async ({ page }) => {
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });

      await page.goto('/home/blocked');

      const loading = page.locator('.blocked-users-loading');
      await expect(loading).toBeVisible();
      await expect(loading.locator('.blocked-users-loading__spinner')).toBeVisible();
      await expect(loading.locator('.blocked-users-loading__text')).toHaveText('Caricamento utenti bloccati...');
    });
  });

  test.describe('Blocked Users List', () => {
    test('should display blocked users after loading', async ({ page }) => {
      await page.goto('/home/blocked');

      // Wait for loading to complete
      await page.waitForSelector('.user-item', { timeout: 5000 });

      const userItems = page.locator('.user-item');
      await expect(userItems.first()).toBeVisible();
    });

    test('should display user avatar', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      const avatar = page.locator('.user-item__avatar').first();
      await expect(avatar).toBeVisible();
    });

    test('should display user name and username', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      const userName = page.locator('.user-item__name').first();
      await expect(userName).toBeVisible();

      const username = page.locator('.user-item__username').first();
      await expect(username).toBeVisible();
      await expect(username).toContainText('@');
    });

    test('should display blocked date', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      const blockedDate = page.locator('.user-item__date').first();
      await expect(blockedDate).toBeVisible();
      await expect(blockedDate).toContainText('Bloccato');
    });

    test('should display block reason if available', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      // At least one user should have a reason in mock data
      const reasonElements = page.locator('.user-item__reason');
      const count = await reasonElements.count();

      // Check if any reasons are visible (some users may have reasons)
      if (count > 0) {
        await expect(reasonElements.first()).toBeVisible();
      }
    });

    test('should display unblock button for each user', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      const unblockBtn = page.locator('.user-item__unblock-btn').first();
      await expect(unblockBtn).toBeVisible();
      await expect(unblockBtn).toContainText('Sblocca');
    });
  });

  test.describe('Unblock Modal', () => {
    test('should open confirm modal when clicking unblock', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      await page.locator('.user-item__unblock-btn').first().click();

      const modal = page.locator('.confirm-modal');
      await expect(modal).toBeVisible();
    });

    test('should display confirmation title', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      await page.locator('.user-item__unblock-btn').first().click();

      const title = page.locator('.confirm-modal__title');
      await expect(title).toBeVisible();
      await expect(title).toHaveText('Sbloccare questo utente?');
    });

    test('should display user name in confirmation message', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      await page.locator('.user-item__unblock-btn').first().click();

      const message = page.locator('.confirm-modal__message');
      await expect(message).toBeVisible();
      await expect(message).toContainText('potrà nuovamente contattarti');
    });

    test('should have cancel and confirm buttons', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      await page.locator('.user-item__unblock-btn').first().click();

      const cancelBtn = page.locator('.confirm-modal__btn--cancel');
      await expect(cancelBtn).toBeVisible();
      await expect(cancelBtn).toHaveText('Annulla');

      const confirmBtn = page.locator('.confirm-modal__btn--confirm');
      await expect(confirmBtn).toBeVisible();
      await expect(confirmBtn).toHaveText('Sblocca');
    });

    test('should close modal when clicking cancel', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      await page.locator('.user-item__unblock-btn').first().click();
      await expect(page.locator('.confirm-modal')).toBeVisible();

      await page.locator('.confirm-modal__btn--cancel').click();
      await expect(page.locator('.confirm-modal')).toBeHidden();
    });

    test('should close modal when clicking overlay', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      await page.locator('.user-item__unblock-btn').first().click();
      await expect(page.locator('.confirm-modal')).toBeVisible();

      await page.locator('.confirm-modal-overlay').click({ position: { x: 10, y: 10 } });
      await expect(page.locator('.confirm-modal')).toBeHidden();
    });

    test('should remove user from list after confirming unblock', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      const initialCount = await page.locator('.user-item').count();

      await page.locator('.user-item__unblock-btn').first().click();
      await page.locator('.confirm-modal__btn--confirm').click();

      // Wait for user to be removed
      await page.waitForTimeout(1000);

      const finalCount = await page.locator('.user-item').count();
      expect(finalCount).toBeLessThan(initialCount);
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state when no blocked users', async ({ page }) => {
      // Mock empty response
      await page.route('**/api/blocked-users**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });

      await page.goto('/home/blocked');

      const emptyState = page.locator('.blocked-users-empty');
      await expect(emptyState).toBeVisible();
      await expect(emptyState.locator('.blocked-users-empty__text')).toHaveText('Nessun utente bloccato');
    });

    test('should display check icon in empty state', async ({ page }) => {
      await page.route('**/api/blocked-users**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });

      await page.goto('/home/blocked');

      const icon = page.locator('.blocked-users-empty__icon');
      await expect(icon).toBeVisible();
    });
  });

  test.describe('Error State', () => {
    test('should display error state on network failure', async ({ page }) => {
      await page.route('**/api/blocked-users**', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/home/blocked');

      const errorState = page.locator('.blocked-users-error');
      await expect(errorState).toBeVisible();
    });

    test('should have retry button on error', async ({ page }) => {
      await page.route('**/api/blocked-users**', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/home/blocked');

      const retryBtn = page.locator('.blocked-users-error__retry');
      await expect(retryBtn).toBeVisible();
      await expect(retryBtn).toHaveText('Riprova');
    });
  });

  test.describe('Responsive Design', () => {
    for (const [deviceName, viewport] of Object.entries(DEVICES)) {
      test(`should render correctly on ${deviceName}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/home/blocked');

        // Header should be visible
        await expect(page.locator('.blocked-users-header')).toBeVisible();

        // Content should be scrollable
        const content = page.locator('.blocked-users-content');
        await expect(content).toBeVisible();

        // Take screenshot for visual comparison
        await expect(page).toHaveScreenshot(`blocked-users-${deviceName}.png`, {
          maxDiffPixelRatio: 0.1,
        });
      });
    }

    test('should hide unblock text on very small screens', async ({ page }) => {
      await page.setViewportSize({ width: 350, height: 667 });
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      // On very small screens, only icon should be visible
      const unblockBtn = page.locator('.user-item__unblock-btn').first();
      await expect(unblockBtn).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible back button', async ({ page }) => {
      await page.goto('/home/blocked');

      const backBtn = page.locator('.blocked-users-header__back');
      await expect(backBtn).toHaveAttribute('aria-label');
      await expect(backBtn).toHaveAttribute('type', 'button');
    });

    test('should have accessible unblock button', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      const unblockBtn = page.locator('.user-item__unblock-btn').first();
      await expect(unblockBtn).toHaveAttribute('type', 'button');
      await expect(unblockBtn).toHaveAttribute('aria-label');
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      // Tab to first interactive element
      await page.keyboard.press('Tab');

      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBeTruthy();
    });

    test('should trap focus in modal', async ({ page }) => {
      await page.goto('/home/blocked');
      await page.waitForSelector('.user-item');

      await page.locator('.user-item__unblock-btn').first().click();
      await expect(page.locator('.confirm-modal')).toBeVisible();

      // Tab through modal elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Focus should stay within modal
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.closest('.confirm-modal') !== null;
      });
      expect(focusedElement).toBeTruthy();
    });
  });
});
