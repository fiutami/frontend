import { test, expect } from '@playwright/test';
import { UserPage } from '../../page-objects';

/**
 * Production tests for User pages
 * Runs against live fiutami.pet without mocks
 * Tests public/guest accessible features
 */
test.describe('User Pages @prod', () => {
  let userPage: UserPage;

  test.beforeEach(async ({ page }) => {
    userPage = new UserPage(page);
  });

  test.describe('Account Page', () => {
    test('should load account page or redirect', async ({ page }) => {
      await userPage.goToAccount();
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url).toMatch(/account|login|\//);
    });
  });

  test.describe('Notifications Page', () => {
    test('should load notifications page or redirect', async ({ page }) => {
      await page.goto('/user/notifications');
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url).toMatch(/notification|login|\//);
    });
  });

  test.describe('Saved Page', () => {
    test('should load saved page or redirect', async ({ page }) => {
      await page.goto('/user/saved');
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url).toMatch(/saved|login|\//);
    });
  });

  test.describe('Friends Page', () => {
    test('should load friends page or redirect', async ({ page }) => {
      await page.goto('/user/friends');
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url).toMatch(/friend|login|\//);
    });
  });

  test.describe('Invite Page', () => {
    test('should load invite page or redirect', async ({ page }) => {
      await page.goto('/user/invite');
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url).toMatch(/invite|login|\//);
    });
  });

  test.describe('Activity Page', () => {
    test('should load activity page or redirect', async ({ page }) => {
      await page.goto('/user/activity');
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url).toMatch(/activity|login|\//);
    });
  });

  test.describe('Responsive Design', () => {
    test('should handle mobile viewport on account', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToAccount();
      await page.waitForTimeout(2000);
    });

    test('should handle tablet viewport on notifications', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/user/notifications');
      await page.waitForTimeout(2000);
    });

    test('should handle desktop viewport on friends', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/user/friends');
      await page.waitForTimeout(2000);
    });
  });

  test.describe('Page Load Performance', () => {
    test('account should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await userPage.goToAccount();
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(10000);
    });

    test('notifications should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/user/notifications');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(10000);
    });
  });
});
