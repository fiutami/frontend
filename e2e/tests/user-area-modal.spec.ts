import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User Area Modal
 *
 * Tests the new modal overlay implementation:
 * 1. Avatar button opens the modal (not the drawer)
 * 2. Modal displays user profile information
 * 3. Tab navigation works correctly
 * 4. Quick actions navigate properly
 * 5. Close/back functionality
 */

test.describe('User Area Modal', () => {

  test.beforeEach(async ({ page }) => {
    // Setup auth mock with correct localStorage keys
    await page.addInitScript(() => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: 'test-user-id',
        email: 'test@fiutami.pet',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      }));
      const mockToken = `${header}.${payload}.mock-signature`;

      localStorage.setItem('fiutami_access_token', mockToken);
      localStorage.setItem('fiutami_refresh_token', mockToken);
      localStorage.setItem('fiutami_user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@fiutami.pet',
        firstName: 'Test',
        lastName: 'User',
        provider: 'email',
        createdAt: new Date().toISOString(),
        hasCompletedOnboarding: true
      }));
    });
  });

  test('avatar button opens user area modal', async ({ page }) => {
    await page.goto('/home/main');
    await page.waitForLoadState('networkidle');

    // Click avatar button
    const avatarBtn = page.locator('.avatar-button');
    await expect(avatarBtn).toBeVisible();
    await avatarBtn.click();

    // Expect modal to appear (not drawer)
    const modal = page.locator('.user-area-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/user-area-modal-open.png', fullPage: true });
  });

  test('modal displays user information', async ({ page }) => {
    await page.goto('/home/main');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('.avatar-button').click();

    const modal = page.locator('.user-area-modal');
    await expect(modal).toBeVisible();

    // Check user name is displayed
    const userName = modal.locator('.user-area-modal__user-name');
    await expect(userName).toContainText('Test');

    // Check email is displayed
    const userEmail = modal.locator('.user-area-modal__user-email');
    await expect(userEmail).toContainText('test@fiutami.pet');

    // Check initials are displayed
    const initials = modal.locator('.user-area-modal__avatar-initials');
    await expect(initials).toContainText('TU');
  });

  test('tab navigation works', async ({ page }) => {
    await page.goto('/home/main');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('.avatar-button').click();

    const modal = page.locator('.user-area-modal');
    await expect(modal).toBeVisible();

    // Click on Settings tab
    const settingsTab = modal.locator('.user-area-modal__tab').filter({ hasText: /settings|impostazioni/i });
    await settingsTab.click();

    // Verify settings tab is active
    await expect(settingsTab).toHaveClass(/--active/);

    // Verify settings actions are shown (language, contact, etc.)
    const languageAction = modal.locator('.user-area-modal__action-card').filter({ hasText: /language|lingua/i });
    await expect(languageAction).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/user-area-modal-settings.png', fullPage: true });
  });

  test('close button closes modal', async ({ page }) => {
    await page.goto('/home/main');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('.avatar-button').click();

    const modal = page.locator('.user-area-modal');
    await expect(modal).toBeVisible();

    // Click close button
    const closeBtn = modal.locator('.user-area-modal__close');
    await closeBtn.click();

    // Modal should be hidden
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test('backdrop click closes modal', async ({ page }) => {
    await page.goto('/home/main');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('.avatar-button').click();

    const backdrop = page.locator('.user-area-backdrop');
    await expect(backdrop).toBeVisible();

    // Click on backdrop (outside modal)
    await backdrop.click({ position: { x: 10, y: 10 } });

    // Modal should close
    const modal = page.locator('.user-area-modal');
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test('ESC key closes modal', async ({ page }) => {
    await page.goto('/home/main');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('.avatar-button').click();

    const modal = page.locator('.user-area-modal');
    await expect(modal).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test('logout button logs user out', async ({ page }) => {
    await page.goto('/home/main');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('.avatar-button').click();

    const modal = page.locator('.user-area-modal');
    await expect(modal).toBeVisible();

    // Click logout button
    const logoutBtn = modal.locator('.user-area-modal__logout-btn');
    await logoutBtn.click();

    // Should redirect to landing page
    await expect(page).toHaveURL(/^\/$|\/$/);
  });

  test('modal appears on map page', async ({ page }) => {
    await page.goto('/home/map');
    await page.waitForLoadState('networkidle');

    // Click avatar button
    const avatarBtn = page.locator('.avatar-button');
    await expect(avatarBtn).toBeVisible();
    await avatarBtn.click();

    // Modal should appear
    const modal = page.locator('.user-area-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'e2e/screenshots/user-area-modal-from-map.png', fullPage: true });
  });

  test('modal appears on breeds page', async ({ page }) => {
    await page.goto('/home/breeds');
    await page.waitForLoadState('networkidle');

    // Click avatar button
    const avatarBtn = page.locator('.avatar-button');
    await expect(avatarBtn).toBeVisible();
    await avatarBtn.click();

    // Modal should appear
    const modal = page.locator('.user-area-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'e2e/screenshots/user-area-modal-from-breeds.png', fullPage: true });
  });
});
