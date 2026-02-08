import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Notification Page Object for notification management
 */
export class NotificationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ============================================================
  // Header/Bell Notification Locators
  // ============================================================

  get notificationBell(): Locator {
    return this.page.locator('[data-testid="notification-bell"], .notification-bell, button[aria-label*="notific"]');
  }

  get notificationBadge(): Locator {
    return this.page.locator('[data-testid="notification-badge"], .notification-badge, .badge');
  }

  get notificationDropdown(): Locator {
    return this.page.locator('[data-testid="notification-dropdown"], .notification-dropdown, .notification-panel');
  }

  // ============================================================
  // Notification List Page Locators
  // ============================================================

  get notificationList(): Locator {
    return this.page.locator('[data-testid="notification-list"], .notification-list, .notifications-container');
  }

  get allNotificationItems(): Locator {
    return this.page.locator('[data-testid^="notification-item-"], .notification-item');
  }

  notificationItem(id: string): Locator {
    return this.page.locator(`[data-testid="notification-item-${id}"], [data-notification-id="${id}"]`);
  }

  get unreadNotifications(): Locator {
    return this.page.locator('[data-testid^="notification-item-"]:not(.read), .notification-item:not(.read), .notification-item.unread');
  }

  get readNotifications(): Locator {
    return this.page.locator('[data-testid^="notification-item-"].read, .notification-item.read');
  }

  // ============================================================
  // Notification Item Elements
  // ============================================================

  notificationTitle(id: string): Locator {
    return this.notificationItem(id).locator('.notification-title, [data-testid="notification-title"]');
  }

  notificationMessage(id: string): Locator {
    return this.notificationItem(id).locator('.notification-message, [data-testid="notification-message"]');
  }

  notificationTime(id: string): Locator {
    return this.notificationItem(id).locator('.notification-time, [data-testid="notification-time"], time');
  }

  notificationImage(id: string): Locator {
    return this.notificationItem(id).locator('img, .notification-image');
  }

  // ============================================================
  // Action Buttons
  // ============================================================

  get markAllReadButton(): Locator {
    return this.page.locator('[data-testid="mark-all-read"], button:has-text("Segna tutto come letto"), button:has-text("Mark all")');
  }

  deleteNotificationButton(id: string): Locator {
    return this.notificationItem(id).locator('[data-testid="delete-notification"], button[aria-label*="elimina"], button[aria-label*="delete"]');
  }

  get clearAllButton(): Locator {
    return this.page.locator('[data-testid="clear-all-notifications"], button:has-text("Cancella tutto")');
  }

  // ============================================================
  // Empty State
  // ============================================================

  get emptyState(): Locator {
    return this.page.locator('[data-testid="no-notifications"], .empty-notifications, .no-notifications');
  }

  get emptyStateMessage(): Locator {
    return this.emptyState.locator('p, .message');
  }

  // ============================================================
  // Filter/Tab Locators
  // ============================================================

  get allTab(): Locator {
    return this.page.locator('[data-testid="tab-all"], button:has-text("Tutte"), [role="tab"]:has-text("All")');
  }

  get unreadTab(): Locator {
    return this.page.locator('[data-testid="tab-unread"], button:has-text("Non lette"), [role="tab"]:has-text("Unread")');
  }

  get filterDropdown(): Locator {
    return this.page.locator('[data-testid="notification-filter"], select[name="filter"]');
  }

  // ============================================================
  // Actions
  // ============================================================

  /**
   * Navigate to notifications page
   */
  async gotoNotifications(): Promise<void> {
    await this.goto('/home/notifications');
    await this.waitForLoadingToFinish();
  }

  /**
   * Open notification dropdown from header bell
   */
  async openNotificationDropdown(): Promise<void> {
    await this.notificationBell.click();
    await this.notificationDropdown.waitFor({ state: 'visible' });
  }

  /**
   * Close notification dropdown
   */
  async closeNotificationDropdown(): Promise<void> {
    // Click outside or press escape
    await this.page.keyboard.press('Escape');
    await this.notificationDropdown.waitFor({ state: 'hidden' });
  }

  /**
   * Click on a notification to view/mark as read
   */
  async clickNotification(id: string): Promise<void> {
    await this.notificationItem(id).click();
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    // Hover to show delete button if needed
    await this.notificationItem(id).hover();
    await this.deleteNotificationButton(id).click();
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await this.markAllReadButton.click();
    // Wait for update
    await this.page.waitForTimeout(500);
  }

  /**
   * Filter notifications by tab
   */
  async filterByUnread(): Promise<void> {
    await this.unreadTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Filter to show all notifications
   */
  async showAllNotifications(): Promise<void> {
    await this.allTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get the unread count from badge
   */
  async getUnreadCount(): Promise<number> {
    const isVisible = await this.notificationBadge.isVisible();
    if (!isVisible) return 0;

    const text = await this.notificationBadge.textContent();
    return parseInt(text || '0', 10);
  }

  // ============================================================
  // Assertions
  // ============================================================

  /**
   * Assert notification is visible
   */
  async expectNotificationVisible(id: string): Promise<void> {
    await expect(this.notificationItem(id)).toBeVisible();
  }

  /**
   * Assert notification count
   */
  async expectNotificationCount(count: number): Promise<void> {
    await expect(this.allNotificationItems).toHaveCount(count);
  }

  /**
   * Assert unread count on badge
   */
  async expectUnreadBadgeCount(count: number): Promise<void> {
    if (count === 0) {
      // Badge might be hidden when count is 0
      const isVisible = await this.notificationBadge.isVisible();
      if (isVisible) {
        await expect(this.notificationBadge).toHaveText('0');
      }
    } else {
      await expect(this.notificationBadge).toBeVisible();
      await expect(this.notificationBadge).toHaveText(count.toString());
    }
  }

  /**
   * Assert notification is marked as read
   */
  async expectNotificationRead(id: string): Promise<void> {
    const item = this.notificationItem(id);
    await expect(item).toHaveClass(/read/);
  }

  /**
   * Assert notification is unread
   */
  async expectNotificationUnread(id: string): Promise<void> {
    const item = this.notificationItem(id);
    // Check it doesn't have read class OR has unread class
    const hasUnreadClass = await item.evaluate(el =>
      el.classList.contains('unread') || !el.classList.contains('read')
    );
    expect(hasUnreadClass).toBe(true);
  }

  /**
   * Assert no notifications (empty state)
   */
  async expectNoNotifications(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * Assert notifications exist
   */
  async expectHasNotifications(): Promise<void> {
    await expect(this.notificationList).toBeVisible();
    const count = await this.allNotificationItems.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Assert notification dropdown is open
   */
  async expectDropdownOpen(): Promise<void> {
    await expect(this.notificationDropdown).toBeVisible();
  }

  /**
   * Assert notification dropdown is closed
   */
  async expectDropdownClosed(): Promise<void> {
    await expect(this.notificationDropdown).toBeHidden();
  }

  /**
   * Assert notification has correct title
   */
  async expectNotificationTitle(id: string, title: string): Promise<void> {
    await expect(this.notificationTitle(id)).toContainText(title);
  }

  /**
   * Assert notification has correct message
   */
  async expectNotificationMessage(id: string, message: string): Promise<void> {
    await expect(this.notificationMessage(id)).toContainText(message);
  }

  /**
   * Assert we are on notifications page
   */
  async expectOnNotificationsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/notifications/);
    await expect(this.notificationList.or(this.emptyState)).toBeVisible();
  }
}
