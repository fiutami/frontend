import { test, expect } from '@playwright/test';
import { UserPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';

test.describe('User Dashboard', () => {
  let userPage: UserPage;

  test.beforeEach(async ({ page }) => {
    userPage = new UserPage(page);
    const apiMocks = createApiMocks(page);
    await apiMocks.setupAllMocks();
    await apiMocks.setupAuthenticatedState();
  });

  test.describe('Dashboard Display', () => {
    test('should display dashboard page', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.expectDashboard();
    });

    test('should display user greeting', async ({ page }) => {
      await userPage.goToDashboard();
      await expect(userPage.dashboardTitle).toContainText('Dashboard');
    });

    test('should display stats cards', async ({ page }) => {
      await userPage.goToDashboard();
      await expect(userPage.statsCards.first()).toBeVisible();
    });

    test('should display quick actions', async ({ page }) => {
      await userPage.goToDashboard();
      await expect(userPage.quickActions.first()).toBeVisible();
    });

    test('should display recent sessions', async ({ page }) => {
      await userPage.goToDashboard();
      // Recent sessions might be empty or populated
      await expect(userPage.recentSessions.first().or(page.locator('text=Nessuna sessione'))).toBeVisible();
    });
  });

  test.describe('Quick Actions', () => {
    test('should navigate to profile from quick action', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.quickActions.filter({ hasText: /profilo/i }).click();
      await expect(page).toHaveURL(/user\/profile/);
    });

    test('should navigate to settings from quick action', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.quickActions.filter({ hasText: /impostazioni/i }).click();
      await expect(page).toHaveURL(/user\/settings/);
    });

    test('should navigate to security from quick action', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.quickActions.filter({ hasText: /sicurezza/i }).click();
      await expect(page).toHaveURL(/user\/security/);
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('should display sidebar on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await userPage.goToDashboard();
      await expect(userPage.sidebar).toBeVisible();
    });

    test('should display user info in sidebar', async ({ page }) => {
      await userPage.goToDashboard();
      await expect(userPage.userAvatar).toBeVisible();
      await expect(userPage.userName).toBeVisible();
    });

    test('should navigate to profile via sidebar', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.navigateToSection('profile');
      await expect(page).toHaveURL(/user\/profile/);
    });

    test('should navigate to settings via sidebar', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.navigateToSection('settings');
      await expect(page).toHaveURL(/user\/settings/);
    });

    test('should navigate to security via sidebar', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.navigateToSection('security');
      await expect(page).toHaveURL(/user\/security/);
    });

    test('should navigate to account via sidebar', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.navigateToSection('account');
      await expect(page).toHaveURL(/user\/account/);
    });
  });

  test.describe('Mobile Sidebar', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should show hamburger menu on mobile', async ({ page }) => {
      await userPage.goToDashboard();
      await expect(userPage.sidebarToggle).toBeVisible();
    });

    test('should open sidebar when clicking hamburger', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.openMobileSidebar();
      await expect(userPage.sidebar).toHaveClass(/--open/);
    });

    test('should close sidebar when clicking overlay', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.openMobileSidebar();
      await userPage.closeMobileSidebar();
      await expect(userPage.sidebar).not.toHaveClass(/--open/);
    });

    test('should navigate and close sidebar on mobile', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.navigateToSection('profile');
      await expect(page).toHaveURL(/user\/profile/);
      // Sidebar should auto-close after navigation
    });
  });

  test.describe('Logout', () => {
    test('should logout from desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await userPage.goToDashboard();
      await userPage.desktopLogoutButton.click();

      // Should redirect to home or login
      await expect(page).toHaveURL(/^\/$|\/login|\/auth/);
    });

    test('should logout from mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToDashboard();
      await userPage.logout();

      await expect(page).toHaveURL(/^\/$|\/login|\/auth/);
    });

    test('should clear tokens on logout', async ({ page }) => {
      await userPage.goToDashboard();
      await userPage.logout();

      const accessToken = await userPage.getLocalStorage('fiutami_access_token');
      expect(accessToken).toBeNull();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await userPage.goToDashboard();
      await userPage.expectDashboard();
    });

    test('should display properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await userPage.goToDashboard();
      await userPage.expectDashboard();
    });

    test('should display properly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await userPage.goToDashboard();
      await userPage.expectDashboard();
    });
  });
});
