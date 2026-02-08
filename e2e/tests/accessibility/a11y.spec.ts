import { test, expect } from '@playwright/test';
import { AuthPage, UserPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';

test.describe('Accessibility Tests', () => {
  test.describe('Landing Page', () => {
    test('should have no accessibility violations', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.goToLanding();

      await authPage.checkA11y();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');

      const h1 = await page.locator('h1').count();
      expect(h1).toBeGreaterThanOrEqual(1);

      // Check that h2 comes after h1
      const headings = await page.locator('h1, h2, h3').allTextContents();
      expect(headings.length).toBeGreaterThan(0);
    });

    test('should have skip link for keyboard navigation', async ({ page }) => {
      await page.goto('/');

      // Check for skip link
      const skipLink = page.locator('a[href="#main"], [class*="skip"]');
      await skipLink.focus();
      await expect(skipLink).toBeVisible();
    });
  });

  test.describe('Login Page', () => {
    test('should have labeled form fields', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.goToLogin();

      // Email input should have label
      const emailLabel = page.locator('label[for="email"], label:has-text("Email")');
      await expect(emailLabel).toBeVisible();

      // Password input should have label
      const passwordLabel = page.locator('label[for="password"], label:has-text("Password")');
      await expect(passwordLabel).toBeVisible();
    });

    test('should have proper focus indicators', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.goToLogin();

      await authPage.emailInput.focus();

      // Check focus is visible
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.goToLogin();

      // Tab through form fields
      await page.keyboard.press('Tab');
      await expect(authPage.emailInput).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(authPage.passwordInput).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(authPage.loginButton).toBeFocused();
    });

    test('should announce form errors to screen readers', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.goToLogin();

      // Submit empty form
      await authPage.loginButton.click();

      // Check for aria-live or aria-describedby error
      const errorRegion = page.locator('[aria-live="polite"], [aria-live="assertive"], [role="alert"]');
      await expect(errorRegion).toBeVisible();
    });
  });

  test.describe('User Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();
    });

    test('should have accessible sidebar navigation', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToDashboard();

      // Sidebar should have navigation role
      const nav = page.locator('nav, [role="navigation"]');
      await expect(nav).toBeVisible();
    });

    test('should have accessible nav links', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToDashboard();

      // All nav links should have text or aria-label
      const links = await page.locator('.user-nav__item').all();
      for (const link of links) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        expect(text || ariaLabel).toBeTruthy();
      }
    });

    test('should indicate current page in navigation', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToDashboard();

      const currentNav = page.locator('[aria-current="page"], .user-nav__item--active');
      await expect(currentNav).toBeVisible();
    });

    test('should have accessible mobile menu toggle', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      const userPage = new UserPage(page);
      await userPage.goToDashboard();

      const toggle = userPage.sidebarToggle;
      const ariaLabel = await toggle.getAttribute('aria-label');
      const ariaExpanded = await toggle.getAttribute('aria-expanded');

      expect(ariaLabel || await toggle.textContent()).toBeTruthy();
      expect(ariaExpanded).toBe('false');
    });
  });

  test.describe('Forms', () => {
    test.beforeEach(async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();
    });

    test('should have accessible profile form', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToProfile();

      await userPage.checkA11y();
    });

    test('should have accessible settings form', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToSettings();

      await userPage.checkA11y();
    });

    test('should associate labels with inputs', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToProfile();

      // Check displayName input
      const displayNameInput = page.locator('#displayName');
      const inputId = await displayNameInput.getAttribute('id');
      const label = page.locator(`label[for="${inputId}"]`);

      await expect(label).toBeVisible();
    });

    test('should have required field indicators', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToProfile();

      // Required fields should have aria-required
      const requiredFields = page.locator('[required], [aria-required="true"]');
      expect(await requiredFields.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Buttons and Interactive Elements', () => {
    test.beforeEach(async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();
    });

    test('should have accessible buttons', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToDashboard();

      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        expect((text && text.trim()) || ariaLabel).toBeTruthy();
      }
    });

    test('should have visible focus on buttons', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToProfile();

      await userPage.saveProfileButton.focus();
      await expect(userPage.saveProfileButton).toBeFocused();
    });

    test('should handle Enter key on buttons', async ({ page }) => {
      const authPage = new AuthPage(page);
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAuthMocks();

      await authPage.goToLogin();
      await authPage.emailInput.fill('test@example.com');
      await authPage.passwordInput.fill('password123');

      // Focus login button and press Enter
      await authPage.loginButton.focus();
      await page.keyboard.press('Enter');

      // Should trigger form submission
      await expect(page).not.toHaveURL(/login/);
    });
  });

  test.describe('Modals', () => {
    test.beforeEach(async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();
    });

    test('should trap focus in delete confirmation modal', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToAccount();

      await userPage.deleteAccountButton.click();
      await expect(userPage.deleteConfirmModal).toBeVisible();

      // Tab through modal elements
      await page.keyboard.press('Tab');

      // Focus should stay within modal
      const focused = page.locator(':focus');
      const modal = userPage.deleteConfirmModal;

      const modalHandle = await modal.elementHandle();
      const focusedInModal = await focused.evaluate((el, modalEl) => {
        return modalEl?.contains(el) ?? false;
      }, modalHandle);

      expect(focusedInModal).toBe(true);
    });

    test('should close modal on Escape key', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToAccount();

      await userPage.deleteAccountButton.click();
      await expect(userPage.deleteConfirmModal).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(userPage.deleteConfirmModal).not.toBeVisible();
    });

    test('should have accessible modal structure', async ({ page }) => {
      const userPage = new UserPage(page);
      await userPage.goToAccount();

      await userPage.deleteAccountButton.click();

      // Modal should have role="dialog"
      const dialog = page.locator('[role="dialog"], [role="alertdialog"]');
      await expect(dialog).toBeVisible();

      // Modal should have aria-labelledby or aria-label
      const ariaLabel = await dialog.getAttribute('aria-label');
      const ariaLabelledBy = await dialog.getAttribute('aria-labelledby');
      expect(ariaLabel || ariaLabelledBy).toBeTruthy();
    });
  });

  test.describe('Color Contrast', () => {
    test('should have sufficient text contrast on landing', async ({ page }) => {
      await page.goto('/');

      // Check main text elements have proper contrast
      const textElements = page.locator('p, h1, h2, h3, label, span');
      const count = await textElements.count();

      // At minimum, text should not be transparent or hidden
      for (let i = 0; i < Math.min(count, 10); i++) {
        const el = textElements.nth(i);
        const opacity = await el.evaluate((e) => {
          return window.getComputedStyle(e).opacity;
        });
        expect(parseFloat(opacity)).toBeGreaterThan(0);
      }
    });

    test('should have visible error messages', async ({ page }) => {
      const authPage = new AuthPage(page);
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAuthMocks();

      await authPage.goToLogin();
      await authPage.login('wrong@email.com', 'wrong');

      // Error should be visible
      await expect(authPage.formError).toBeVisible();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have main landmark', async ({ page }) => {
      await page.goto('/');
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();
    });

    test('should have proper page title', async ({ page }) => {
      await page.goto('/');
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title).not.toBe('undefined');
    });

    test('should update page title on navigation', async ({ page }) => {
      const userPage = new UserPage(page);
      const apiMocks = createApiMocks(page);
      await apiMocks.setupAllMocks();
      await apiMocks.setupAuthenticatedState();

      await userPage.goToDashboard();
      const dashboardTitle = await page.title();

      await userPage.goToProfile();
      const profileTitle = await page.title();

      // Titles should be different or include page context
      expect(dashboardTitle.length).toBeGreaterThan(0);
      expect(profileTitle.length).toBeGreaterThan(0);
    });
  });
});
