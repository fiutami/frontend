import { test, expect } from '@playwright/test';

test.describe('Responsive Visual Tests - Home Start Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    // Wait for images to load
    await page.waitForSelector('.home-start__background-image');
  });

  test('should display correctly and take screenshot', async ({ page }, testInfo) => {
    // Wait a bit for any animations
    await page.waitForTimeout(500);

    // Take full page screenshot
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}-home-start.png`,
      fullPage: true,
    });

    // Basic visual assertions
    const card = page.locator('app-auth-card');
    await expect(card).toBeVisible();

    // Check branding is visible
    const logo = page.locator('.home-start__logo-img');
    await expect(logo).toBeVisible();

    const mascot = page.locator('.home-start__mascot');
    await expect(mascot).toBeVisible();

    // Check buttons are visible
    const loginBtn = page.locator('button:has-text("Accedi")');
    await expect(loginBtn).toBeVisible();

    const registerBtn = page.locator('button:has-text("Registrati")');
    await expect(registerBtn).toBeVisible();

    // Check language switcher
    const langSwitcher = page.locator('app-language-switcher');
    await expect(langSwitcher).toBeVisible();
  });

  test('should have dark overlay card background', async ({ page }) => {
    // The card should have dark overlay background on ALL viewports
    const card = page.locator('.auth-card');
    await expect(card).toBeVisible();

    // Get computed styles
    const cardBg = await card.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should be dark (rgba with low alpha or dark rgb)
    // Expected: rgba(0, 0, 0, 0.4) which computes to rgba(0, 0, 0, 0.4)
    console.log(`Card background on ${test.info().project.name}: ${cardBg}`);

    // Assert it's a dark background (not white/light)
    expect(cardBg).toMatch(/rgba?\(0,\s*0,\s*0/);
  });

  test('should have correct text colors on card', async ({ page }) => {
    // Terms text should be white on all viewports (dark card)
    const terms = page.locator('.home-start__terms');
    await expect(terms).toBeVisible();

    const termsColor = await terms.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    console.log(`Terms text color on ${test.info().project.name}: ${termsColor}`);

    // Should be white (rgb(255, 255, 255))
    expect(termsColor).toMatch(/rgb\(255,\s*255,\s*255\)/);
  });

  test('social login should be positioned correctly', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;

    if (projectName === 'mobile') {
      // Mobile: social login inside card (mobile wrapper visible)
      const socialMobile = page.locator('.home-start__social-mobile');
      const socialDesktop = page.locator('.home-start__social-desktop');

      // Mobile version should be visible
      await expect(socialMobile).toBeVisible();

      // Desktop version should be hidden
      const desktopDisplay = await socialDesktop.evaluate((el) => {
        return window.getComputedStyle(el).display;
      });
      expect(desktopDisplay).toBe('none');
    } else {
      // Tablet/Desktop: social login outside card (desktop wrapper visible)
      const socialMobile = page.locator('.home-start__social-mobile');
      const socialDesktop = page.locator('.home-start__social-desktop');

      // Desktop version should be visible
      await expect(socialDesktop).toBeVisible();

      // Mobile version should be hidden
      const mobileDisplay = await socialMobile.evaluate((el) => {
        return window.getComputedStyle(el).display;
      });
      expect(mobileDisplay).toBe('none');
    }
  });

  test('language switcher should have correct styling', async ({ page }, testInfo) => {
    const langSwitcher = page.locator('.language-switcher');
    await expect(langSwitcher).toBeVisible();

    const textColor = await langSwitcher.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const projectName = testInfo.project.name;
    console.log(`Language switcher color on ${projectName}: ${textColor}`);

    if (projectName === 'mobile') {
      // Mobile: white text
      expect(textColor).toMatch(/rgb\(255,\s*255,\s*255\)/);
    } else {
      // Tablet/Desktop: dark text (black)
      expect(textColor).toMatch(/rgb\(0,\s*0,\s*0\)/);
    }
  });
});
