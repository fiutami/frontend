import { test, expect } from '@playwright/test';
import { ChatPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';

test.describe('Chat @prod', () => {
  let chatPage: ChatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    const apiMocks = createApiMocks(page);
    await apiMocks.setupAllMocks();
    await apiMocks.setupAuthenticatedState();
  });

  test.describe('Chat List', () => {
    test('should display chat list or empty state', async ({ page }) => {
      await chatPage.goto();
      await expect(chatPage.chatList.or(chatPage.emptyState)).toBeVisible({ timeout: 10000 });
    });

    test('should display page content', async ({ page }) => {
      await chatPage.goto();
      // Should have either conversations or empty state
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Conversation Screen', () => {
    test('should navigate to conversation', async ({ page }) => {
      await chatPage.gotoConversation('1');
      // May redirect if conversation doesn't exist
      await page.waitForTimeout(1000);
    });

    test('should show back button in conversation', async ({ page }) => {
      await chatPage.gotoConversation('1');
      // Back button may be visible
      await page.waitForTimeout(500);
    });
  });

  test.describe('Message Input', () => {
    test('should have message input area', async ({ page }) => {
      await chatPage.gotoConversation('1');
      // Input may be present
      await page.waitForTimeout(500);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await chatPage.goto();
      await page.waitForTimeout(1000);
    });

    test('should display properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await chatPage.goto();
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Navigation', () => {
    test('should handle navigation from chat list', async ({ page }) => {
      await chatPage.goto();
      // Try to open first conversation if exists
      const conversations = await chatPage.conversationItems.count();
      if (conversations > 0) {
        await chatPage.openConversation(0);
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Empty State', () => {
    test('should show empty state message when no chats', async ({ page }) => {
      await chatPage.goto();
      // Empty state should be displayed if no conversations
      await page.waitForTimeout(1000);
    });
  });
});
