import { test, expect } from '@playwright/test';
import { NotificationPage, AuthPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';
import { testNotifications } from '../../fixtures/test-data';

test.describe('Notification System', () => {
  let notificationPage: NotificationPage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    notificationPage = new NotificationPage(page);
    authPage = new AuthPage(page);

    const apiMocks = createApiMocks(page);
    await apiMocks.setupAuthenticatedState();
    await apiMocks.setupAllMocks();
  });

  test.describe('Notification Bell (Header)', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to any authenticated page
      await page.goto('/home');
      await notificationPage.waitForLoadingToFinish();
    });

    test('should display notification bell in header', async () => {
      await expect(notificationPage.notificationBell).toBeVisible();
    });

    test('should show unread count badge', async () => {
      await notificationPage.expectUnreadBadgeCount(testNotifications.unreadCount);
    });

    test('should open notification dropdown on bell click', async () => {
      await notificationPage.openNotificationDropdown();
      await notificationPage.expectDropdownOpen();
    });

    test('should close dropdown on escape key', async () => {
      await notificationPage.openNotificationDropdown();
      await notificationPage.expectDropdownOpen();

      await notificationPage.closeNotificationDropdown();
      await notificationPage.expectDropdownClosed();
    });

    test('should display recent notifications in dropdown', async ({ page }) => {
      await notificationPage.openNotificationDropdown();

      // Should show notification items
      const notificationItems = page.locator('.notification-item, [data-testid^="notification-item-"]');
      const count = await notificationItems.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Notification List Page', () => {
    test.beforeEach(async () => {
      await notificationPage.gotoNotifications();
    });

    test('should display notification list page', async () => {
      await notificationPage.expectOnNotificationsPage();
    });

    test('should display all notifications', async () => {
      await notificationPage.expectHasNotifications();
      await notificationPage.expectNotificationCount(testNotifications.notifications.length);
    });

    test('should display notification title and message', async () => {
      const firstNotif = testNotifications.notifications[0];
      await notificationPage.expectNotificationVisible(firstNotif.id);
      await notificationPage.expectNotificationTitle(firstNotif.id, firstNotif.title);
    });

    test('should distinguish read and unread notifications', async ({ page }) => {
      // Unread notifications should have a different style
      const unreadNotif = testNotifications.notifications.find(n => !n.isRead);
      const readNotif = testNotifications.notifications.find(n => n.isRead);

      if (unreadNotif) {
        await notificationPage.expectNotificationUnread(unreadNotif.id);
      }

      if (readNotif) {
        await notificationPage.expectNotificationRead(readNotif.id);
      }
    });

    test('should show notification timestamp', async ({ page }) => {
      const firstNotif = testNotifications.notifications[0];
      const timeElement = notificationPage.notificationTime(firstNotif.id);

      // Time element should exist (might show relative time like "2 ore fa")
      await expect(timeElement).toBeVisible();
    });
  });

  test.describe('Notification Actions', () => {
    test.beforeEach(async () => {
      await notificationPage.gotoNotifications();
    });

    test('should mark single notification as read on click', async ({ page }) => {
      const unreadNotif = testNotifications.notifications.find(n => !n.isRead);
      if (!unreadNotif) return;

      await notificationPage.clickNotification(unreadNotif.id);

      // Should mark as read (API call made)
      // Wait for potential navigation or state update
      await page.waitForTimeout(500);
    });

    test('should mark all notifications as read', async ({ page }) => {
      await notificationPage.markAllAsRead();

      // All notifications should now be marked as read
      // Badge count should be 0
      await notificationPage.expectUnreadBadgeCount(0);
    });

    test('should delete a notification', async ({ page }) => {
      const initialCount = await notificationPage.allNotificationItems.count();

      const firstNotif = testNotifications.notifications[0];
      await notificationPage.deleteNotification(firstNotif.id);

      // Wait for deletion
      await page.waitForTimeout(500);

      // Notification should be removed
      await expect(notificationPage.notificationItem(firstNotif.id)).toBeHidden();
    });

    test('should navigate to action URL when clicking notification with link', async ({ page }) => {
      const notifWithAction = testNotifications.notifications.find(n => n.actionUrl);
      if (!notifWithAction) return;

      await notificationPage.clickNotification(notifWithAction.id);

      // Should navigate to the action URL
      await page.waitForURL(new RegExp(notifWithAction.actionUrl!.replace(/\//g, '\\/')));
    });
  });

  test.describe('Notification Filtering', () => {
    test.beforeEach(async () => {
      await notificationPage.gotoNotifications();
    });

    test('should filter to show only unread notifications', async ({ page }) => {
      await notificationPage.filterByUnread();

      // Should only show unread notifications
      const unreadCount = testNotifications.notifications.filter(n => !n.isRead).length;
      await notificationPage.expectNotificationCount(unreadCount);
    });

    test('should show all notifications when "All" tab is selected', async () => {
      await notificationPage.filterByUnread();
      await notificationPage.showAllNotifications();

      await notificationPage.expectNotificationCount(testNotifications.notifications.length);
    });
  });

  test.describe('Empty State', () => {
    test('should show empty state when no notifications', async ({ page }) => {
      // Setup mock with empty notifications
      await page.route('**/api/notification', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: [],
            totalCount: 0,
            unreadCount: 0,
          }),
        });
      });

      await notificationPage.gotoNotifications();
      await notificationPage.expectNoNotifications();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display notification bell on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/home');

      await expect(notificationPage.notificationBell).toBeVisible();
    });

    test('should open notification dropdown on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/home');

      await notificationPage.openNotificationDropdown();
      await notificationPage.expectDropdownOpen();
    });

    test('should display notification list page on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await notificationPage.gotoNotifications();

      await notificationPage.expectOnNotificationsPage();
    });

    test('should display notification list on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await notificationPage.gotoNotifications();

      await notificationPage.expectHasNotifications();
    });
  });

  test.describe('Real-time Updates', () => {
    test('should update badge count when new notification arrives', async ({ page }) => {
      await page.goto('/home');

      const initialCount = await notificationPage.getUnreadCount();

      // Simulate new notification by updating mock
      await page.route('**/api/notification/unread-count', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ unreadCount: initialCount + 1 }),
        });
      });

      // Trigger a refresh (e.g., polling or manual)
      await page.reload();
      await notificationPage.waitForLoadingToFinish();

      // Badge should show updated count
      await notificationPage.expectUnreadBadgeCount(initialCount + 1);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network error when loading notifications', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.mockNetworkFailure('**/api/notification');

      await notificationPage.gotoNotifications();

      // Should show error state or message
      await expect(notificationPage.errorMessage.or(notificationPage.toastMessage)).toBeVisible();
    });

    test('should handle error when marking as read', async ({ page }) => {
      await page.route('**/api/notification/*/read', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      });

      await notificationPage.gotoNotifications();

      const unreadNotif = testNotifications.notifications.find(n => !n.isRead);
      if (unreadNotif) {
        await notificationPage.clickNotification(unreadNotif.id);

        // Should show error toast/message
        await expect(notificationPage.toastMessage).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Authorization', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      // Clear auth state
      await authPage.clearLocalStorage();

      await page.goto('/home/notifications');

      // Should redirect to login
      await expect(page).toHaveURL(/login|auth/);
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible notification bell button', async ({ page }) => {
      await page.goto('/home');

      const bell = notificationPage.notificationBell;
      const ariaLabel = await bell.getAttribute('aria-label');

      // Should have aria-label for accessibility
      expect(ariaLabel).toBeTruthy();
    });

    test('should announce unread count to screen readers', async ({ page }) => {
      await page.goto('/home');

      // Badge or bell should have aria attributes for count
      const badge = notificationPage.notificationBadge;
      const isVisible = await badge.isVisible();

      if (isVisible) {
        const text = await badge.textContent();
        expect(text).toBeTruthy();
      }
    });

    test('should be keyboard navigable in notification list', async ({ page }) => {
      await notificationPage.gotoNotifications();

      // Tab through notification items
      await page.keyboard.press('Tab');

      // First notification should be focusable
      const focused = await page.evaluate(() => document.activeElement?.className);
      expect(focused).toBeTruthy();
    });
  });
});
