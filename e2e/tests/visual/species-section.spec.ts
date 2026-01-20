import { test, expect } from '@playwright/test';

test.describe('Species Section - UX/UI Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to species page
    await page.goto('/home/species');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display the new species page structure', async ({ page }) => {
    // Check header exists
    const header = page.locator('.species-page__header');
    await expect(header).toBeVisible();

    // Check back button
    const backBtn = page.locator('.species-page__back-btn');
    await expect(backBtn).toBeVisible();

    // Check title
    const title = page.locator('.species-page__title');
    await expect(title).toHaveText('Specie');

    // Check avatar button
    const avatarBtn = page.locator('app-avatar-button');
    await expect(avatarBtn).toBeVisible();
  });

  test('should display FIUTAMI logo branding', async ({ page }) => {
    const branding = page.locator('.species-page__branding');
    await expect(branding).toBeVisible();

    const logo = page.locator('app-logo');
    await expect(logo).toBeVisible();
  });

  test('should display section navigator with arrows', async ({ page }) => {
    const navigator = page.locator('app-section-navigator');
    await expect(navigator).toBeVisible();

    // Check navigator title shows "Specie"
    const navTitle = page.locator('.section-navigator__title');
    await expect(navTitle).toHaveText('Specie');

    // Check prev button (should be disabled on first section)
    const prevBtn = page.locator('.section-navigator__btn--prev');
    await expect(prevBtn).toBeVisible();
    await expect(prevBtn).toBeDisabled();

    // Check next button (should be enabled)
    const nextBtn = page.locator('.section-navigator__btn--next');
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toBeEnabled();
  });

  test('should navigate between sections using arrows', async ({ page }) => {
    const navTitle = page.locator('.section-navigator__title');
    const nextBtn = page.locator('.section-navigator__btn--next');
    const prevBtn = page.locator('.section-navigator__btn--prev');

    // Initial state: "Specie"
    await expect(navTitle).toHaveText('Specie');

    // Click next -> "Specie speciale"
    await nextBtn.click();
    await expect(navTitle).toHaveText('Specie speciale');

    // Check prev is now enabled
    await expect(prevBtn).toBeEnabled();

    // Click next -> "La tua razza"
    await nextBtn.click();
    await expect(navTitle).toHaveText('La tua razza');

    // Check next is now disabled (last section)
    await expect(nextBtn).toBeDisabled();

    // Click prev -> back to "Specie speciale"
    await prevBtn.click();
    await expect(navTitle).toHaveText('Specie speciale');
  });

  test('should display species grid on first section', async ({ page }) => {
    const speciesGrid = page.locator('app-species-grid');
    await expect(speciesGrid).toBeVisible();

    // Check tagline
    const tagline = page.locator('.species-grid__tagline');
    await expect(tagline).toBeVisible();

    // Check search bar
    const searchInput = page.locator('.species-grid__search-input');
    await expect(searchInput).toBeVisible();

    // Wait for loading to complete and check cards
    await page.waitForSelector('.species-grid__card', { timeout: 5000 });
    const cards = page.locator('.species-grid__card');
    await expect(cards).toHaveCount(8); // 8 species categories
  });

  test('should display species-special on second section', async ({ page }) => {
    // Navigate to second section
    await page.locator('.section-navigator__btn--next').click();

    const speciesSpecial = page.locator('app-species-special');
    await expect(speciesSpecial).toBeVisible();

    // Check upload area
    const uploadArea = page.locator('.species-special__upload');
    await expect(uploadArea).toBeVisible();
  });

  test('should display your-breed on third section', async ({ page }) => {
    // Navigate to third section
    await page.locator('.section-navigator__btn--next').click();
    await page.locator('.section-navigator__btn--next').click();

    const yourBreed = page.locator('app-your-breed');
    await expect(yourBreed).toBeVisible();
  });

  test('should have bottom tab bar with species active', async ({ page }) => {
    const tabBar = page.locator('app-bottom-tab-bar');
    await expect(tabBar).toBeVisible();

    // Species tab should be active
    const speciesTab = page.locator('[data-tab-id="species"]');
    // Or check by aria-selected
    const activeTab = page.locator('.bottom-tab-bar__tab--active');
    await expect(activeTab).toBeVisible();
  });

  test('should take screenshot of species page', async ({ page }) => {
    await page.screenshot({
      path: 'e2e/screenshots/species-page-main.png',
      fullPage: true
    });

    // Navigate to second section and screenshot
    await page.locator('.section-navigator__btn--next').click();
    await page.screenshot({
      path: 'e2e/screenshots/species-page-special.png',
      fullPage: true
    });

    // Navigate to third section and screenshot
    await page.locator('.section-navigator__btn--next').click();
    await page.screenshot({
      path: 'e2e/screenshots/species-page-your-breed.png',
      fullPage: true
    });
  });
});
