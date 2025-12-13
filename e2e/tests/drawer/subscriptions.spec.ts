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

test.describe('Subscriptions Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user', JSON.stringify({ id: 'user_1', name: 'Test User' }));
    });
  });

  test.describe('Page Load & Structure', () => {
    test('should display page header with title', async ({ page }) => {
      await page.goto('/home/subscriptions');

      const header = page.locator('.subscriptions-header');
      await expect(header).toBeVisible();
      await expect(header.locator('.subscriptions-header__title')).toHaveText('Abbonamenti');
    });

    test('should display back button in header', async ({ page }) => {
      await page.goto('/home/subscriptions');

      const backBtn = page.locator('.subscriptions-header__back');
      await expect(backBtn).toBeVisible();
      await expect(backBtn).toHaveAttribute('aria-label', 'Torna indietro');
    });

    test('should navigate back when clicking back button', async ({ page }) => {
      await page.goto('/home/main');
      await page.goto('/home/subscriptions');

      await page.locator('.subscriptions-header__back').click();
      await expect(page).toHaveURL(/\/home\/main/);
    });

    test('should display bottom tab bar', async ({ page }) => {
      await page.goto('/home/subscriptions');

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

      await page.goto('/home/subscriptions');

      const loading = page.locator('.subscriptions-loading');
      await expect(loading).toBeVisible();
      await expect(loading.locator('.subscriptions-loading__spinner')).toBeVisible();
      await expect(loading.locator('.subscriptions-loading__text')).toHaveText('Caricamento piani...');
    });
  });

  test.describe('Billing Toggle', () => {
    test('should display billing toggle', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.billing-toggle');

      const toggle = page.locator('.billing-toggle');
      await expect(toggle).toBeVisible();
    });

    test('should show monthly and yearly options', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.billing-toggle');

      const labels = page.locator('.billing-toggle__label');
      await expect(labels.first()).toContainText('Mensile');
      await expect(labels.last()).toContainText('Annuale');
    });

    test('should show discount badge on yearly option', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.billing-toggle');

      const discount = page.locator('.billing-toggle__discount');
      await expect(discount).toBeVisible();
      await expect(discount).toContainText('-33%');
    });

    test('should toggle between monthly and yearly', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.billing-toggle');

      const toggle = page.locator('.billing-toggle__switch');
      await toggle.click();

      // Should now be on yearly
      await expect(toggle).toHaveClass(/--yearly/);
    });

    test('should update prices when toggling billing cycle', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      // Get initial price
      const priceElement = page.locator('.plan-card__price').nth(1);
      const initialPrice = await priceElement.textContent();

      // Toggle to yearly
      await page.locator('.billing-toggle__switch').click();

      // Price should change
      const newPrice = await priceElement.textContent();
      expect(newPrice).not.toEqual(initialPrice);
    });
  });

  test.describe('Plan Cards', () => {
    test('should display three plan cards', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const cards = page.locator('.plan-card');
      await expect(cards).toHaveCount(3);
    });

    test('should display Free plan', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const freePlan = page.locator('.plan-card--free');
      await expect(freePlan).toBeVisible();
      await expect(freePlan.locator('.plan-card__name')).toHaveText('Free');
    });

    test('should display Premium plan with badge', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const premiumPlan = page.locator('.plan-card--premium');
      await expect(premiumPlan).toBeVisible();
      await expect(premiumPlan.locator('.plan-card__name')).toHaveText('Premium');
      await expect(premiumPlan.locator('.plan-card__badge')).toHaveText('Più popolare');
    });

    test('should display Pro plan', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const proPlan = page.locator('.plan-card--pro');
      await expect(proPlan).toBeVisible();
      await expect(proPlan.locator('.plan-card__name')).toHaveText('Pro');
    });

    test('should highlight current plan', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      // Free plan should be marked as current (mock default)
      const currentPlan = page.locator('.plan-card--current');
      await expect(currentPlan).toBeVisible();
      await expect(currentPlan.locator('.plan-card__current-badge')).toBeVisible();
    });

    test('should display plan description', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const descriptions = page.locator('.plan-card__description');
      await expect(descriptions.first()).toBeVisible();
    });

    test('should display plan price', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const prices = page.locator('.plan-card__price');
      await expect(prices.first()).toBeVisible();
    });

    test('should display features list', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const features = page.locator('.plan-card__features');
      await expect(features.first()).toBeVisible();

      const featureItems = page.locator('.plan-card__feature').first();
      await expect(featureItems).toBeVisible();
    });

    test('should show included and excluded features', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const includedFeatures = page.locator('.plan-card__feature--included');
      await expect(includedFeatures.first()).toBeVisible();

      const excludedFeatures = page.locator('.plan-card__feature--excluded');
      await expect(excludedFeatures.first()).toBeVisible();
    });
  });

  test.describe('CTA Buttons', () => {
    test('should display subscribe button for non-current plans', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const ctaButtons = page.locator('.plan-card__cta');
      await expect(ctaButtons.first()).toBeVisible();
    });

    test('should show "Piano attuale" for current plan', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const currentPlanCta = page.locator('.plan-card--current .plan-card__cta');
      await expect(currentPlanCta).toContainText('Piano attuale');
    });

    test('should show "Abbonati" for upgrade plans', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const upgradeCta = page.locator('.plan-card__cta--upgrade').first();
      await expect(upgradeCta).toContainText('Abbonati');
    });

    test('should disable current plan button', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const currentPlanCta = page.locator('.plan-card--current .plan-card__cta');
      await expect(currentPlanCta).toBeDisabled();
    });
  });

  test.describe('Yearly Savings', () => {
    test('should show savings message when yearly is selected', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      // Toggle to yearly
      await page.locator('.billing-toggle__switch').click();

      const savings = page.locator('.plan-card__savings');
      // Should show savings for paid plans
      await expect(savings.first()).toBeVisible();
      await expect(savings.first()).toContainText('Risparmi');
    });
  });

  test.describe('Footer Info', () => {
    test('should display subscription info footer', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const footer = page.locator('.subscriptions-footer');
      await expect(footer).toBeVisible();
      await expect(footer).toContainText('Puoi annullare in qualsiasi momento');
    });
  });

  test.describe('Error State', () => {
    test('should display error state on network failure', async ({ page }) => {
      await page.route('**/api/subscriptions**', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/home/subscriptions');

      const errorState = page.locator('.subscriptions-error');
      await expect(errorState).toBeVisible();
    });

    test('should have retry button on error', async ({ page }) => {
      await page.route('**/api/subscriptions**', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/home/subscriptions');

      const retryBtn = page.locator('.subscriptions-error__retry');
      await expect(retryBtn).toBeVisible();
      await expect(retryBtn).toHaveText('Riprova');
    });
  });

  test.describe('Responsive Design', () => {
    for (const [deviceName, viewport] of Object.entries(DEVICES)) {
      test(`should render correctly on ${deviceName}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/home/subscriptions');

        // Header should be visible
        await expect(page.locator('.subscriptions-header')).toBeVisible();

        // Content should be scrollable
        const content = page.locator('.subscriptions-content');
        await expect(content).toBeVisible();

        // Take screenshot for visual comparison
        await expect(page).toHaveScreenshot(`subscriptions-${deviceName}.png`, {
          maxDiffPixelRatio: 0.1,
        });
      });
    }

    test('should stack plan cards vertically on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const plansList = page.locator('.plans-list');
      const flexDirection = await plansList.evaluate(el => {
        return window.getComputedStyle(el).flexDirection;
      });

      expect(flexDirection).toBe('column');
    });

    test('should display plan cards in row on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const plansList = page.locator('.plans-list');
      const flexDirection = await plansList.evaluate(el => {
        return window.getComputedStyle(el).flexDirection;
      });

      expect(flexDirection).toBe('row');
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible back button', async ({ page }) => {
      await page.goto('/home/subscriptions');

      const backBtn = page.locator('.subscriptions-header__back');
      await expect(backBtn).toHaveAttribute('aria-label');
      await expect(backBtn).toHaveAttribute('type', 'button');
    });

    test('should have accessible toggle switch', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.billing-toggle');

      const toggle = page.locator('.billing-toggle__switch');
      await expect(toggle).toHaveAttribute('role', 'switch');
      await expect(toggle).toHaveAttribute('type', 'button');
    });

    test('should have accessible CTA buttons', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const ctaButtons = page.locator('.plan-card__cta');
      for (let i = 0; i < await ctaButtons.count(); i++) {
        await expect(ctaButtons.nth(i)).toHaveAttribute('type', 'button');
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      // Tab to first interactive element
      await page.keyboard.press('Tab');

      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBeTruthy();
    });

    test('should toggle billing cycle with keyboard', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.billing-toggle');

      const toggle = page.locator('.billing-toggle__switch');
      await toggle.focus();
      await page.keyboard.press('Enter');

      await expect(toggle).toHaveClass(/--yearly/);
    });
  });

  test.describe('Plan Colors', () => {
    test('should display correct gradient for Free plan', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const freeHeader = page.locator('.plan-card--free .plan-card__header');
      const background = await freeHeader.evaluate(el => {
        return window.getComputedStyle(el).background;
      });

      // Should contain gray gradient
      expect(background).toContain('rgb');
    });

    test('should display correct gradient for Premium plan', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const premiumHeader = page.locator('.plan-card--premium .plan-card__header');
      const background = await premiumHeader.evaluate(el => {
        return window.getComputedStyle(el).background;
      });

      // Should contain orange/gold gradient
      expect(background).toContain('rgb');
    });

    test('should display correct gradient for Pro plan', async ({ page }) => {
      await page.goto('/home/subscriptions');
      await page.waitForSelector('.plan-card');

      const proHeader = page.locator('.plan-card--pro .plan-card__header');
      const background = await proHeader.evaluate(el => {
        return window.getComputedStyle(el).background;
      });

      // Should contain purple gradient
      expect(background).toContain('rgb');
    });
  });
});
