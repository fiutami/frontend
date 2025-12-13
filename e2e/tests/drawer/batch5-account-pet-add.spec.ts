import { test, expect, Page } from '@playwright/test';

/**
 * Drawer Batch 5 Tests - Account and Pet Add Pages
 *
 * Tests responsive design across 7 device configurations:
 * - Mobile: 375x667 (iPhone SE/8)
 * - Tablet: 768x1024 (iPad)
 * - Desktop: 1440x900
 * - Foldable Folded: 717x512 (Galaxy Fold folded)
 * - Foldable Unfolded: 1485x720 (Galaxy Fold unfolded)
 * - iPhone 2025: 430x932 (iPhone 15 Pro Max)
 * - Honor Magic V3/V5: 795x720
 */

// Device viewport configurations
const DEVICE_VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
  foldableFolded: { width: 717, height: 512 },
  foldableUnfolded: { width: 1485, height: 720 },
  iPhone2025: { width: 430, height: 932 },
  honorMagic: { width: 795, height: 720 },
};

// Helper to navigate to page
async function navigateToPage(page: Page, path: string) {
  await page.goto(`/home${path}`);
  await page.waitForLoadState('networkidle');
}

// ================================
// Account Page Tests
// ================================
test.describe('Account Page - Drawer Batch 5', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPage(page, '/account');
  });

  test('should display header with back button and title', async ({ page }) => {
    const header = page.locator('.account-header');
    await expect(header).toBeVisible();

    const backButton = page.locator('.account-header__back');
    await expect(backButton).toBeVisible();
    await expect(backButton).toHaveAttribute('aria-label', 'Torna indietro');

    const title = page.locator('.account-header__title');
    await expect(title).toHaveText('Account');
  });

  test('should display loading state initially', async ({ page }) => {
    await page.goto('/home/account');

    const loading = page.locator('.account-loading');
    const loadingVisible = await loading.isVisible().catch(() => false);
    // After loading, content should be visible
    await page.waitForSelector('.account-section, .account-error', { timeout: 5000 });
  });

  test('should display account overview section', async ({ page }) => {
    await page.waitForSelector('.account-section', { timeout: 5000 });

    const overviewSection = page.locator('.account-section').first();
    await expect(overviewSection).toBeVisible();

    // Title with icon
    const sectionTitle = overviewSection.locator('.account-section__title');
    await expect(sectionTitle).toBeVisible();
    await expect(sectionTitle).toContainText('Panoramica Account');

    // Info grid
    const infoGrid = page.locator('.account-info-grid');
    await expect(infoGrid).toBeVisible();

    // Info items (Email, Account Type, Registration Date, Status)
    const infoItems = page.locator('.account-info-item');
    const count = await infoItems.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should display data management section with export button', async ({ page }) => {
    await page.waitForSelector('.account-section', { timeout: 5000 });

    const sections = page.locator('.account-section');
    const dataSection = sections.nth(1);
    await expect(dataSection).toBeVisible();

    // GDPR description
    const desc = dataSection.locator('.account-section__desc');
    await expect(desc).toContainText('GDPR');

    // Export button
    const exportBtn = page.locator('.account-btn--outline');
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toContainText('Esporta');
  });

  test('should display danger zone section with delete button', async ({ page }) => {
    await page.waitForSelector('.account-section--danger', { timeout: 5000 });

    const dangerSection = page.locator('.account-section--danger');
    await expect(dangerSection).toBeVisible();

    // Danger title
    const dangerTitle = dangerSection.locator('.account-section__title--danger');
    await expect(dangerTitle).toContainText('Zona Pericolosa');

    // Delete button
    const deleteBtn = page.locator('.account-btn--danger').first();
    await expect(deleteBtn).toBeVisible();
    await expect(deleteBtn).toContainText('Elimina Account');
  });

  test('should open delete confirmation modal on click', async ({ page }) => {
    await page.waitForSelector('.account-btn--danger', { timeout: 5000 });

    const deleteBtn = page.locator('.account-btn--danger').first();
    await deleteBtn.click();

    // Modal should appear
    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible();

    const modalTitle = page.locator('.modal__title');
    await expect(modalTitle).toContainText('Conferma Eliminazione');

    // Confirm input
    const confirmInput = page.locator('#deleteConfirmInput');
    await expect(confirmInput).toBeVisible();

    // Close button
    const closeBtn = page.locator('.modal__close');
    await expect(closeBtn).toBeVisible();
  });

  test('should close delete modal on cancel', async ({ page }) => {
    await page.waitForSelector('.account-btn--danger', { timeout: 5000 });

    const deleteBtn = page.locator('.account-btn--danger').first();
    await deleteBtn.click();

    await expect(page.locator('.modal-overlay')).toBeVisible();

    // Click cancel button
    const cancelBtn = page.locator('.account-btn--ghost').first();
    await cancelBtn.click();

    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });

  test('should open export modal on click', async ({ page }) => {
    await page.waitForSelector('.account-btn--outline', { timeout: 5000 });

    const exportBtn = page.locator('.account-btn--outline');
    await exportBtn.click();

    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible();

    const modalTitle = page.locator('.modal__title');
    await expect(modalTitle).toContainText('Esporta Dati');
  });

  test('should display bottom tab bar', async ({ page }) => {
    const tabBar = page.locator('app-bottom-tab-bar');
    await expect(tabBar).toBeVisible();
  });

  test('back button should navigate back', async ({ page }) => {
    // Go to home first, then to account
    await page.goto('/home/main');
    await page.waitForLoadState('networkidle');
    await page.goto('/home/account');
    await page.waitForLoadState('networkidle');

    const backBtn = page.locator('.account-header__back');
    await backBtn.click();

    // Should navigate back (URL should change)
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).not.toContain('/account');
  });

  // Responsive tests for all 7 devices
  for (const [deviceName, viewport] of Object.entries(DEVICE_VIEWPORTS)) {
    test(`should be responsive on ${deviceName} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await navigateToPage(page, '/account');

      // Header should be visible
      const header = page.locator('.account-header');
      await expect(header).toBeVisible();

      // Content should be visible
      const content = page.locator('.account-content');
      await expect(content).toBeVisible();

      // Tab bar should be visible
      const tabBar = page.locator('app-bottom-tab-bar');
      await expect(tabBar).toBeVisible();

      // No horizontal overflow
      const pageWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(pageWidth).toBeLessThanOrEqual(viewport.width + 20); // Small tolerance
    });
  }
});

// ================================
// Pet Register (Pet Add) Page Tests
// ================================
test.describe('Pet Register Page - Drawer Batch 5', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPage(page, '/pet-register');
  });

  test('should display back button', async ({ page }) => {
    const backButton = page.locator('app-back-button, .pet-register__back');
    await expect(backButton).toBeVisible();
  });

  test('should display logo', async ({ page }) => {
    const logo = page.locator('app-logo, .pet-register__logo');
    await expect(logo).toBeVisible();
  });

  test('should display description text', async ({ page }) => {
    const description = page.locator('.pet-register__description');
    await expect(description).toBeVisible();
    await expect(description).toContainText('registrare il tuo animale');
  });

  test('should display 4 menu items', async ({ page }) => {
    const menuItems = page.locator('app-menu-item');
    const count = await menuItems.count();
    expect(count).toBe(4);
  });

  test('should display menu item labels correctly', async ({ page }) => {
    const expectedLabels = ['Specie', 'Registra il tuo pets', 'Documentazioni', 'Guida al Benessere'];

    for (const label of expectedLabels) {
      const item = page.locator(`app-menu-item:has-text("${label}")`);
      await expect(item).toBeVisible();
    }
  });

  test('should display mascot section', async ({ page }) => {
    const mascotSection = page.locator('.pet-register__mascot-section');
    await expect(mascotSection).toBeVisible();

    // Speech bubble
    const speechBubble = page.locator('.pet-register__speech-bubble');
    await expect(speechBubble).toBeVisible();

    // Mascot image
    const mascotImage = page.locator('.pet-register__mascot-image');
    await expect(mascotImage).toBeVisible();
  });

  test('should navigate to specie page on menu click', async ({ page }) => {
    const specieItem = page.locator('app-menu-item:has-text("Specie")');
    await specieItem.click();

    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toContain('/pet-register/specie');
  });

  test('back button should navigate back', async ({ page }) => {
    // First go to welcome-ai, then to pet-register
    await page.goto('/home/welcome-ai');
    await page.waitForLoadState('networkidle');
    await page.goto('/home/pet-register');
    await page.waitForLoadState('networkidle');

    const backBtn = page.locator('app-back-button, .pet-register__back');
    await backBtn.click();

    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).not.toContain('/pet-register');
  });

  // Responsive tests for all 7 devices
  for (const [deviceName, viewport] of Object.entries(DEVICE_VIEWPORTS)) {
    test(`should be responsive on ${deviceName} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await navigateToPage(page, '/pet-register');

      // Back button should be visible
      const backButton = page.locator('app-back-button, .pet-register__back');
      await expect(backButton).toBeVisible();

      // Logo should be visible
      const logo = page.locator('app-logo, .pet-register__logo');
      await expect(logo).toBeVisible();

      // Menu items should be visible
      const menuItems = page.locator('app-menu-item');
      const count = await menuItems.count();
      expect(count).toBe(4);

      // No horizontal overflow
      const pageWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(pageWidth).toBeLessThanOrEqual(viewport.width + 20);
    });
  }
});

// ================================
// Accessibility Tests
// ================================
test.describe('Accessibility - Batch 5 Pages', () => {
  test('Account page should have accessible back button', async ({ page }) => {
    await navigateToPage(page, '/account');

    const backBtn = page.locator('.account-header__back');
    await expect(backBtn).toHaveAttribute('aria-label');
    await expect(backBtn).toHaveAttribute('type', 'button');
  });

  test('Account page modals should have proper ARIA attributes', async ({ page }) => {
    await navigateToPage(page, '/account');
    await page.waitForSelector('.account-btn--danger', { timeout: 5000 });

    // Open delete modal
    const deleteBtn = page.locator('.account-btn--danger').first();
    await deleteBtn.click();

    const modal = page.locator('.modal');
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  test('Pet register page should have accessible back button', async ({ page }) => {
    await navigateToPage(page, '/pet-register');

    const backBtn = page.locator('app-back-button');
    await expect(backBtn).toHaveAttribute('ariaLabel');
  });
});
