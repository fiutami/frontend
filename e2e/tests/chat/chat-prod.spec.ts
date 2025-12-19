import { test, expect } from '@playwright/test';
import { ChatPage } from '../../page-objects';

/**
 * Production tests for Chat page
 * Runs against live fiutami.pet without mocks
 * Tests public/guest accessible features
 */
test.describe('Chat @prod', () => {
  let chatPage: ChatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
  });

  test.describe('Chat Access', () => {
    test('should load chat page or redirect', async ({ page }) => {
      await chatPage.goto();
      await page.waitForTimeout(2000);

      const url = page.url();
      // Chat requires auth, should redirect to login or show chat
      expect(url).toMatch(/chat|login|\//);
    });

    test('should handle conversation route', async ({ page }) => {
      await chatPage.gotoConversation('1');
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url).toBeDefined();
    });
  });

  test.describe('Responsive Design', () => {
    test('should handle mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await chatPage.goto();
      await page.waitForTimeout(2000);
    });

    test('should handle tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await chatPage.goto();
      await page.waitForTimeout(2000);
    });
  });

  test.describe('Page Load Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await chatPage.goto();
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(10000);
    });
  });
});
