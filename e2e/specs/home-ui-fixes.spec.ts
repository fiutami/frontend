import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Home Page UI Fixes
 * - Mascot SVG display
 * - Avatar with initials fallback
 * - Mobile tab bar horizontal scroll
 */
test.describe('Home Page UI Fixes', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@fiutami.pet',
        firstName: 'Test',
        lastName: 'User'
      }));
    });
  });

  test.describe('Mascot Display', () => {
    test('should display mascot SVG or image', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      // Check for mascot element (SVG or img)
      const mascot = page.locator('.home__mascot svg, .home__mascot img');
      await expect(mascot).toBeVisible();
    });

    test('mascot should have accessible label', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      const mascotSvg = page.locator('.home__mascot svg');
      if (await mascotSvg.isVisible()) {
        await expect(mascotSvg).toHaveAttribute('aria-label', /mascotte/i);
      }
    });
  });

  test.describe('Avatar with Initials Fallback', () => {
    test('should display avatar button', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      const avatar = page.locator('.home__avatar');
      await expect(avatar).toBeVisible();
    });

    test('should show initials when no avatar image', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      const initials = page.locator('.home__avatar-initials');
      const avatarImg = page.locator('.home__avatar img');

      // Either initials or image should be visible
      const hasInitials = await initials.isVisible();
      const hasImage = await avatarImg.isVisible();

      expect(hasInitials || hasImage).toBeTruthy();
    });

    test('initials should be 1-2 uppercase characters', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      const initials = page.locator('.home__avatar-initials');
      if (await initials.isVisible()) {
        const text = await initials.textContent();
        expect(text).toBeTruthy();
        expect(text!.trim().length).toBeGreaterThanOrEqual(1);
        expect(text!.trim().length).toBeLessThanOrEqual(2);
        expect(text!.trim()).toMatch(/^[A-Z]+$/);
      }
    });

    test('avatar should navigate to pet profile', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      const avatar = page.locator('.home__avatar');
      await avatar.click();

      await expect(page).toHaveURL(/\/home\/pet-profile/);
    });
  });

  test.describe('Mobile Tab Bar Scroll', () => {
    test.use({ viewport: { width: 320, height: 568 } }); // iPhone SE size

    test('should display all 5 tabs', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      const tabs = page.locator('.bottom-tab-bar__tab');
      await expect(tabs).toHaveCount(5);
    });

    test('should be able to scroll to last tab', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      const lastTab = page.locator('.bottom-tab-bar__tab').last();
      await lastTab.scrollIntoViewIfNeeded();
      await expect(lastTab).toBeVisible();
    });

    test('tab bar should not overflow vertically', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      const tabBar = page.locator('.bottom-tab-bar');
      const box = await tabBar.boundingBox();

      expect(box).toBeTruthy();
      expect(box!.height).toBeLessThanOrEqual(100); // Tab bar should be compact
    });

    test('tabs should be clickable on mobile', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      // Click calendar tab
      const calendarTab = page.locator('.bottom-tab-bar__tab').nth(1);
      await calendarTab.click();

      await expect(page).toHaveURL(/\/calendar/);
    });
  });

  test.describe('Tablet View', () => {
    test.use({ viewport: { width: 768, height: 1024 } }); // iPad size

    test('tab bar should be centered on tablet', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      const tabBar = page.locator('.bottom-tab-bar');
      const box = await tabBar.boundingBox();

      expect(box).toBeTruthy();
      // Tab bar should be less than full width on tablet
      expect(box!.width).toBeLessThanOrEqual(600);
    });
  });

  test.describe('Desktop View', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('should display all elements correctly on desktop', async ({ page }) => {
      await page.goto('/home/main');
      await page.waitForLoadState('networkidle');

      // All main elements should be visible
      await expect(page.locator('.home__avatar')).toBeVisible();
      await expect(page.locator('.home__mascot')).toBeVisible();
      await expect(page.locator('.home__search')).toBeVisible();
      await expect(page.locator('.bottom-tab-bar')).toBeVisible();
    });
  });
});
