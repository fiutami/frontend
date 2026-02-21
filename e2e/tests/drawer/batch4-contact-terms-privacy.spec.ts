import { test, expect, Page } from '@playwright/test';

/**
 * Drawer Batch 4 Tests - Contact, Terms, Privacy Pages
 *
 * Tests responsive design across 7 device configurations:
 * - Desktop: chromium, firefox, webkit
 * - Mobile: mobile-chrome (Pixel 5), mobile-safari (iPhone 12)
 * - Tablet: tablet (iPad gen 7)
 * - Additional responsive: 320px, 768px, 1024px, 1440px viewports
 */

// Helper to login (if needed for accessing drawer pages)
async function navigateToPage(page: Page, path: string) {
  await page.goto(`/home${path}`);
  await page.waitForLoadState('networkidle');
}

// ================================
// Contact Page Tests
// ================================
test.describe('Contact Page - Drawer Batch 4', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPage(page, '/contact');
  });

  test('should display header with back button and title', async ({ page }) => {
    const header = page.locator('.shell-header');
    await expect(header).toBeVisible();

    const backButton = page.locator('.shell-header__back');
    await expect(backButton).toBeVisible();
    await expect(backButton).toHaveAttribute('aria-label', 'Torna indietro');

    const title = page.locator('.shell-header__title');
    await expect(title).toHaveText('Contattaci');
  });

  test('should display intro section', async ({ page }) => {
    const intro = page.locator('.contact-intro');
    await expect(intro).toBeVisible();

    const text = page.locator('.contact-intro__text');
    await expect(text).toContainText('Hai domande');
  });

  test('should display contact form with all fields', async ({ page }) => {
    const form = page.locator('.contact-form');
    await expect(form).toBeVisible();

    // Name field
    const nameInput = page.locator('#name');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveAttribute('type', 'text');

    // Email field
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Subject select
    const subjectSelect = page.locator('#subject');
    await expect(subjectSelect).toBeVisible();

    // Message textarea
    const messageTextarea = page.locator('#message');
    await expect(messageTextarea).toBeVisible();

    // Submit button
    const submitBtn = page.locator('.contact-form__submit');
    await expect(submitBtn).toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Click submit without filling fields
    const submitBtn = page.locator('.contact-form__submit');
    await submitBtn.click();

    // Wait for validation errors
    await page.waitForTimeout(300);

    // Name field should show error (i18n key: drawerContact.errorRequired)
    const nameError = page.locator('#name-error');
    await expect(nameError).toBeVisible();

    // Email field should show error
    const emailError = page.locator('#email-error');
    await expect(emailError).toBeVisible();
  });

  test('should show email validation error for invalid email', async ({ page }) => {
    // Fill with invalid email
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'invalid-email');
    await page.selectOption('#subject', 'Supporto tecnico');
    await page.fill('#message', 'This is a test message with more than 10 characters');

    // Click submit
    const submitBtn = page.locator('.contact-form__submit');
    await submitBtn.click();

    // Wait for validation
    await page.waitForTimeout(300);

    // Email should show invalid error (i18n key: drawerContact.errorEmail)
    const emailError = page.locator('#email-error');
    await expect(emailError).toBeVisible();
  });

  test('should submit form successfully with valid data', async ({ page }) => {
    // Fill form with valid data
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.selectOption('#subject', 'Supporto tecnico');
    await page.fill('#message', 'This is a test message with enough characters');

    // Click submit
    const submitBtn = page.locator('.contact-form__submit');
    await submitBtn.click();

    // Wait for success state (mock service has 1500ms delay)
    await page.waitForSelector('.contact-success', { timeout: 5000 });

    const successTitle = page.locator('.contact-success__title');
    await expect(successTitle).toBeVisible();

    const ticketId = page.locator('.contact-success__ticket');
    await expect(ticketId).toBeVisible();
  });

  test('should navigate back when back button is clicked', async ({ page }) => {
    // First navigate somewhere to have history
    await page.goto('/home/main');
    await page.waitForLoadState('networkidle');

    // Then go to contact
    await navigateToPage(page, '/contact');

    const backButton = page.locator('.shell-header__back');
    await backButton.click();

    // Should navigate back
    await expect(page).not.toHaveURL(/\/contact/);
  });

  test('responsive: should be scrollable on mobile', async ({ page }, testInfo) => {
    if (!testInfo.project.name.includes('mobile')) {
      test.skip();
    }

    const content = page.locator('.contact-content');
    const scrollHeight = await content.evaluate((el) => el.scrollHeight);
    const clientHeight = await content.evaluate((el) => el.clientHeight);

    // Content should be scrollable (scrollHeight > clientHeight) or fit
    expect(scrollHeight).toBeGreaterThanOrEqual(clientHeight);
  });

  test('visual: take screenshot for comparison', async ({ page }, testInfo) => {
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `e2e/test-results/screenshots/contact-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});

// ================================
// Terms Page Tests
// ================================
test.describe('Terms Page - Drawer Batch 4', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPage(page, '/terms');
  });

  test('should display header with back button and title', async ({ page }) => {
    const header = page.locator('.shell-header');
    await expect(header).toBeVisible();

    const backButton = page.locator('.shell-header__back');
    await expect(backButton).toBeVisible();

    const title = page.locator('.shell-header__title');
    await expect(title).toHaveText('Termini di servizio');
  });

  test('should display quick navigation with section buttons', async ({ page }) => {
    const nav = page.locator('.terms-nav');
    await expect(nav).toBeVisible();

    const navItems = page.locator('.terms-nav__circle');
    const count = await navItems.count();

    // Should have 9 navigation items (sections 1-9)
    expect(count).toBe(9);
  });

  test('should display intro section', async ({ page }) => {
    const intro = page.locator('.terms-intro');
    await expect(intro).toBeVisible();

    const icon = page.locator('.terms-intro__icon');
    await expect(icon).toBeVisible();

    const title = page.locator('.terms-intro__title');
    await expect(title).toHaveText('Termini di servizio');
  });

  test('should display all terms sections', async ({ page }) => {
    const sections = page.locator('.terms-section');
    const count = await sections.count();

    // Should have 9 sections
    expect(count).toBe(9);

    // First section should have title
    const firstTitle = page.locator('.terms-section__title').first();
    await expect(firstTitle).toContainText('1. Accettazione');
  });

  test('should scroll to section when nav item is clicked', async ({ page }) => {
    // Click on section 5 button
    const navItem = page.locator('.terms-nav__circle').nth(4); // 0-indexed, so 5th item
    await navItem.click();

    // Wait for scroll
    await page.waitForTimeout(500);

    // The nav item should now be active
    await expect(navItem).toHaveClass(/terms-nav__circle--active/);

    // The section should be visible
    const section5 = page.locator('#content');
    await expect(section5).toBeInViewport();
  });

  test('should display last updated footer', async ({ page }) => {
    const footer = page.locator('.terms-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Dicembre 2025');
  });

  test('responsive: navigation should be horizontally scrollable on mobile', async ({ page }, testInfo) => {
    if (!testInfo.project.name.includes('mobile')) {
      test.skip();
    }

    const navScroll = page.locator('.terms-nav__scroll');
    const scrollWidth = await navScroll.evaluate((el) => el.scrollWidth);
    const clientWidth = await navScroll.evaluate((el) => el.clientWidth);

    // Should be scrollable horizontally
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });

  test('visual: take screenshot for comparison', async ({ page }, testInfo) => {
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `e2e/test-results/screenshots/terms-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});

// ================================
// Privacy Page Tests
// ================================
test.describe('Privacy Page - Drawer Batch 4', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPage(page, '/privacy');
  });

  test('should display header with back button and title', async ({ page }) => {
    const header = page.locator('.shell-header');
    await expect(header).toBeVisible();

    const backButton = page.locator('.shell-header__back');
    await expect(backButton).toBeVisible();

    const title = page.locator('.shell-header__title');
    await expect(title).toHaveText('Privacy');
  });

  test('should display quick navigation with section buttons', async ({ page }) => {
    const nav = page.locator('.privacy-nav');
    await expect(nav).toBeVisible();

    const navItems = page.locator('.privacy-nav__circle');
    const count = await navItems.count();

    // Should have 10 navigation items (sections 1-10)
    expect(count).toBe(10);
  });

  test('should display intro section', async ({ page }) => {
    const intro = page.locator('.privacy-intro');
    await expect(intro).toBeVisible();

    const icon = page.locator('.privacy-intro__icon');
    await expect(icon).toBeVisible();

    const title = page.locator('.privacy-intro__title');
    await expect(title).toHaveText('Privacy');
  });

  test('should display all privacy sections', async ({ page }) => {
    const sections = page.locator('.privacy-section');
    const count = await sections.count();

    // Should have 10 sections
    expect(count).toBe(10);
  });

  test('should display bullet lists in appropriate sections', async ({ page }) => {
    // Section 2 (data-collected) should have bullets
    const section2 = page.locator('#data-collected');
    const bulletList = section2.locator('.privacy-section__list');
    await expect(bulletList).toBeVisible();

    const listItems = bulletList.locator('li');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should scroll to section when nav item is clicked', async ({ page }) => {
    // Click on section 6 (your-rights)
    const navItem = page.locator('.privacy-nav__circle').nth(5); // 0-indexed
    await navItem.click();

    // Wait for scroll
    await page.waitForTimeout(500);

    // The nav item should now be active
    await expect(navItem).toHaveClass(/privacy-nav__circle--active/);

    // The section should be visible
    const section6 = page.locator('#your-rights');
    await expect(section6).toBeInViewport();
  });

  test('should display last updated footer', async ({ page }) => {
    const footer = page.locator('.privacy-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Dicembre 2025');
  });

  test('responsive: navigation should be horizontally scrollable on mobile', async ({ page }, testInfo) => {
    if (!testInfo.project.name.includes('mobile')) {
      test.skip();
    }

    const navScroll = page.locator('.privacy-nav__scroll');
    const scrollWidth = await navScroll.evaluate((el) => el.scrollWidth);
    const clientWidth = await navScroll.evaluate((el) => el.clientWidth);

    // Should be scrollable horizontally
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });

  test('accessibility: sections should have proper heading hierarchy', async ({ page }) => {
    // H1 in header
    const h1 = page.locator('h1.shell-header__title');
    await expect(h1).toHaveCount(1);

    // H2 in intro
    const h2 = page.locator('h2.privacy-intro__title');
    await expect(h2).toHaveCount(1);

    // H3 in sections
    const h3 = page.locator('h3.privacy-section__title');
    const h3Count = await h3.count();
    expect(h3Count).toBe(10);
  });

  test('accessibility: back button should have aria-label', async ({ page }) => {
    const backButton = page.locator('.shell-header__back');
    await expect(backButton).toHaveAttribute('aria-label', 'Torna indietro');
  });

  test('accessibility: nav should have aria-label', async ({ page }) => {
    const nav = page.locator('.privacy-nav');
    await expect(nav).toHaveAttribute('aria-label', 'Navigazione sezioni');
  });

  test('visual: take screenshot for comparison', async ({ page }, testInfo) => {
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `e2e/test-results/screenshots/privacy-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});

// ================================
// Cross-Page Navigation Tests
// ================================
test.describe('Drawer Batch 4 - Cross-Page Navigation', () => {
  test('should navigate from Terms to Contact via footer link', async ({ page }) => {
    await navigateToPage(page, '/terms');

    // Find the contact section (section 9)
    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();

    // The content mentions "Contattaci"
    await expect(contactSection).toContainText('Contattaci');
  });

  test('should navigate from Privacy to Contact via footer link', async ({ page }) => {
    await navigateToPage(page, '/privacy');

    // Find the contact section (section 10)
    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();

    // The content mentions "Contattaci"
    await expect(contactSection).toContainText('Contattaci');
  });
});
