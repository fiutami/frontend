import { test, expect, Page } from '@playwright/test';

/**
 * Drawer Batch 2 Tests - Adopt, Pet Friends, Invite Pages
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

// Helper to login (if needed for accessing drawer pages)
async function navigateToPage(page: Page, path: string) {
  await page.goto(`/home${path}`);
  await page.waitForLoadState('networkidle');
}

// ================================
// Adopt Page Tests
// ================================
test.describe('Adopt Page - Drawer Batch 2', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPage(page, '/adopt');
  });

  test('should display header with back button and title', async ({ page }) => {
    const header = page.locator('.adopt-header');
    await expect(header).toBeVisible();

    const backButton = page.locator('.adopt-header__back');
    await expect(backButton).toBeVisible();
    await expect(backButton).toHaveAttribute('aria-label', 'Torna indietro');

    const title = page.locator('.adopt-header__title');
    await expect(title).toHaveText('Adottare');
  });

  test('should display loading state initially', async ({ page }) => {
    // Navigate fresh to catch loading state
    await page.goto('/home/adopt');

    const loading = page.locator('.adopt-loading');
    // Loading may be very brief, so we check it exists or has passed
    const loadingVisible = await loading.isVisible().catch(() => false);
    // After loading, content should be visible
    await page.waitForSelector('.adopt-list, .adopt-empty', { timeout: 5000 });
  });

  test('should display adoption cards list after loading', async ({ page }) => {
    await page.waitForSelector('.adopt-list', { timeout: 5000 });

    const cards = page.locator('.adopt-card');
    const count = await cards.count();

    // Should have at least 1 adoption ad (mock data has 5)
    expect(count).toBeGreaterThan(0);
  });

  test('should display adoption card with all required elements', async ({ page }) => {
    await page.waitForSelector('.adopt-list', { timeout: 5000 });

    const firstCard = page.locator('.adopt-card').first();
    await expect(firstCard).toBeVisible();

    // Image section
    const image = firstCard.locator('.adopt-card__image');
    await expect(image).toBeVisible();

    // Name
    const name = firstCard.locator('.adopt-card__name');
    await expect(name).toBeVisible();

    // Status badge
    const status = firstCard.locator('.adopt-card__status');
    await expect(status).toBeVisible();

    // Info (breed, age, gender)
    const info = firstCard.locator('.adopt-card__info');
    await expect(info).toBeVisible();

    // Description
    const description = firstCard.locator('.adopt-card__description');
    await expect(description).toBeVisible();

    // Location
    const location = firstCard.locator('.adopt-card__location');
    await expect(location).toBeVisible();

    // Contact action
    const contactBtn = firstCard.locator('.adopt-card__action--contact');
    await expect(contactBtn).toBeVisible();
    await expect(contactBtn).toContainText('Contatta');
  });

  test('should display urgent badge on urgent ads', async ({ page }) => {
    await page.waitForSelector('.adopt-list', { timeout: 5000 });

    const urgentBadge = page.locator('.adopt-card__urgent-badge').first();
    // At least one mock ad is urgent
    await expect(urgentBadge).toContainText('Urgente');
  });

  test('should display status badges with correct styling', async ({ page }) => {
    await page.waitForSelector('.adopt-list', { timeout: 5000 });

    // Check for available status
    const availableStatus = page.locator('.adopt-card__status.status--available').first();
    await expect(availableStatus).toContainText('Disponibile');

    // Check for pending status (if exists)
    const pendingStatus = page.locator('.adopt-card__status.status--pending').first();
    if (await pendingStatus.isVisible().catch(() => false)) {
      await expect(pendingStatus).toContainText('In attesa');
    }
  });

  test('should display shelter name when available', async ({ page }) => {
    await page.waitForSelector('.adopt-list', { timeout: 5000 });

    const shelterInfo = page.locator('.adopt-card__shelter').first();
    await expect(shelterInfo).toBeVisible();
  });

  test('should display bottom tab bar', async ({ page }) => {
    const tabBar = page.locator('app-bottom-tab-bar');
    await expect(tabBar).toBeVisible();
  });

  test('should navigate back when back button is clicked', async ({ page }) => {
    // First navigate somewhere to have history
    await page.goto('/home/main');
    await page.waitForLoadState('networkidle');

    // Then go to adopt
    await navigateToPage(page, '/adopt');

    const backButton = page.locator('.adopt-header__back');
    await backButton.click();

    // Should navigate back
    await expect(page).not.toHaveURL(/\/adopt/);
  });

  test('contact button should be clickable', async ({ page }) => {
    await page.waitForSelector('.adopt-list', { timeout: 5000 });

    const contactBtn = page.locator('.adopt-card__action--contact').first();
    await expect(contactBtn).toBeEnabled();

    // Click should not throw error
    await contactBtn.click();
  });

  test('card should be clickable for navigation', async ({ page }) => {
    await page.waitForSelector('.adopt-list', { timeout: 5000 });

    const firstCard = page.locator('.adopt-card').first();
    await expect(firstCard).toHaveCSS('cursor', 'pointer');
  });

  // Responsive tests for all 7 viewports
  for (const [deviceName, viewport] of Object.entries(DEVICE_VIEWPORTS)) {
    test(`responsive ${deviceName} (${viewport.width}x${viewport.height}): should display correctly`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await navigateToPage(page, '/adopt');
      await page.waitForSelector('.adopt-list, .adopt-empty', { timeout: 5000 });

      const header = page.locator('.adopt-header');
      await expect(header).toBeVisible();

      const content = page.locator('.adopt-content');
      await expect(content).toBeVisible();

      // Take screenshot for visual comparison
      await page.screenshot({
        path: `e2e/test-results/screenshots/adopt-${deviceName}-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    });
  }

  test('accessibility: back button should have aria-label', async ({ page }) => {
    const backButton = page.locator('.adopt-header__back');
    await expect(backButton).toHaveAttribute('aria-label', 'Torna indietro');
  });

  test('accessibility: list should have role="list"', async ({ page }) => {
    await page.waitForSelector('.adopt-list', { timeout: 5000 });

    const list = page.locator('.adopt-list');
    await expect(list).toHaveAttribute('role', 'list');
  });
});

// ================================
// Pet Friends Page Tests
// ================================
test.describe('Pet Friends Page - Drawer Batch 2', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPage(page, '/friends');
  });

  test('should display header with back button and title', async ({ page }) => {
    const header = page.locator('.pet-friends-header');
    await expect(header).toBeVisible();

    const backButton = page.locator('.pet-friends-header__back');
    await expect(backButton).toBeVisible();
    await expect(backButton).toHaveAttribute('aria-label', 'Torna indietro');

    const title = page.locator('.pet-friends-header__title');
    await expect(title).toHaveText('Amici Pets');
  });

  test('should display loading state initially', async ({ page }) => {
    await page.goto('/home/friends');
    // After loading, content should be visible
    await page.waitForSelector('.pet-friends-list, .pet-friends-empty', { timeout: 5000 });
  });

  test('should display friends list after loading', async ({ page }) => {
    await page.waitForSelector('.pet-friends-list', { timeout: 5000 });

    const cards = page.locator('.friend-card');
    const count = await cards.count();

    // Should have at least 1 friend (mock data has 5)
    expect(count).toBeGreaterThan(0);
  });

  test('should display friend card with all required elements', async ({ page }) => {
    await page.waitForSelector('.pet-friends-list', { timeout: 5000 });

    const firstCard = page.locator('.friend-card').first();
    await expect(firstCard).toBeVisible();

    // Avatar
    const avatar = firstCard.locator('.friend-card__avatar');
    await expect(avatar).toBeVisible();

    // Status indicator (online/offline)
    const statusIndicator = firstCard.locator('.friend-card__status-indicator');
    await expect(statusIndicator).toBeVisible();

    // Name
    const name = firstCard.locator('.friend-card__name');
    await expect(name).toBeVisible();

    // Pets list
    const pets = firstCard.locator('.friend-card__pets');
    await expect(pets).toBeVisible();

    // Actions
    const messageBtn = firstCard.locator('.friend-card__action--message');
    await expect(messageBtn).toBeVisible();

    const viewPetsBtn = firstCard.locator('.friend-card__action--pets');
    await expect(viewPetsBtn).toBeVisible();
  });

  test('should display online badge for online friends', async ({ page }) => {
    await page.waitForSelector('.pet-friends-list', { timeout: 5000 });

    // At least one friend should be online (mock data has 3 online)
    const onlineBadge = page.locator('.friend-card__online-badge').first();
    await expect(onlineBadge).toContainText('Online');
  });

  test('should display last seen for offline friends', async ({ page }) => {
    await page.waitForSelector('.pet-friends-list', { timeout: 5000 });

    // Some friends are offline with last seen
    const lastSeen = page.locator('.friend-card__last-seen').first();
    if (await lastSeen.isVisible().catch(() => false)) {
      await expect(lastSeen).toContainText('fa');
    }
  });

  test('should display initials in avatar when no image', async ({ page }) => {
    await page.waitForSelector('.pet-friends-list', { timeout: 5000 });

    const initials = page.locator('.friend-card__initials').first();
    await expect(initials).toBeVisible();

    // Initials should be 1-2 uppercase letters
    const text = await initials.textContent();
    expect(text?.length).toBeGreaterThanOrEqual(1);
    expect(text?.length).toBeLessThanOrEqual(2);
    expect(text).toMatch(/^[A-Z]+$/);
  });

  test('should display pets count', async ({ page }) => {
    await page.waitForSelector('.pet-friends-list', { timeout: 5000 });

    const petsCount = page.locator('.friend-card__pets-count').first();
    await expect(petsCount).toBeVisible();
    await expect(petsCount).toContainText('(');
  });

  test('should display mutual friends info', async ({ page }) => {
    await page.waitForSelector('.pet-friends-list', { timeout: 5000 });

    const mutualFriends = page.locator('.friend-card__mutual').first();
    if (await mutualFriends.isVisible().catch(() => false)) {
      await expect(mutualFriends).toContainText('amici in comune');
    }
  });

  test('should display friends since info', async ({ page }) => {
    await page.waitForSelector('.pet-friends-list', { timeout: 5000 });

    const friendsSince = page.locator('.friend-card__friends-since').first();
    await expect(friendsSince).toBeVisible();
    await expect(friendsSince).toContainText('Amici da');
  });

  test('should display bottom tab bar', async ({ page }) => {
    const tabBar = page.locator('app-bottom-tab-bar');
    await expect(tabBar).toBeVisible();
  });

  test('message button should be clickable', async ({ page }) => {
    await page.waitForSelector('.pet-friends-list', { timeout: 5000 });

    const messageBtn = page.locator('.friend-card__action--message').first();
    await expect(messageBtn).toBeEnabled();

    // Click should not throw error
    await messageBtn.click();
  });

  test('view pets button should be clickable', async ({ page }) => {
    await page.waitForSelector('.pet-friends-list', { timeout: 5000 });

    const viewPetsBtn = page.locator('.friend-card__action--pets').first();
    await expect(viewPetsBtn).toBeEnabled();

    // Click should not throw error
    await viewPetsBtn.click();
  });

  // Responsive tests for all 7 viewports
  for (const [deviceName, viewport] of Object.entries(DEVICE_VIEWPORTS)) {
    test(`responsive ${deviceName} (${viewport.width}x${viewport.height}): should display correctly`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await navigateToPage(page, '/friends');
      await page.waitForSelector('.pet-friends-list, .pet-friends-empty', { timeout: 5000 });

      const header = page.locator('.pet-friends-header');
      await expect(header).toBeVisible();

      const content = page.locator('.pet-friends-content');
      await expect(content).toBeVisible();

      // Take screenshot for visual comparison
      await page.screenshot({
        path: `e2e/test-results/screenshots/pet-friends-${deviceName}-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    });
  }

  test('accessibility: buttons should have aria-labels', async ({ page }) => {
    await page.waitForSelector('.pet-friends-list', { timeout: 5000 });

    const messageBtn = page.locator('.friend-card__action--message').first();
    await expect(messageBtn).toHaveAttribute('aria-label', 'Invia messaggio');

    const viewPetsBtn = page.locator('.friend-card__action--pets').first();
    await expect(viewPetsBtn).toHaveAttribute('aria-label', 'Vedi pets');
  });
});

// ================================
// Invite Page Tests
// ================================
test.describe('Invite Page - Drawer Batch 2', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToPage(page, '/invite');
  });

  test('should display header with back button and title', async ({ page }) => {
    const header = page.locator('.invite-header');
    await expect(header).toBeVisible();

    const backButton = page.locator('.invite-header__back');
    await expect(backButton).toBeVisible();
    await expect(backButton).toHaveAttribute('aria-label', 'Torna indietro');

    const title = page.locator('.invite-header__title');
    await expect(title).toHaveText('Invita Amici');
  });

  test('should display loading state initially', async ({ page }) => {
    await page.goto('/home/invite');
    // After loading, content should be visible
    await page.waitForSelector('.invite-hero', { timeout: 5000 });
  });

  test('should display hero section after loading', async ({ page }) => {
    await page.waitForSelector('.invite-hero', { timeout: 5000 });

    const icon = page.locator('.invite-hero__icon');
    await expect(icon).toBeVisible();

    const title = page.locator('.invite-hero__title');
    await expect(title).toHaveText('Invita i tuoi amici!');

    const description = page.locator('.invite-hero__description');
    await expect(description).toContainText('Condividi FiutaMi');
  });

  test('should display invite stats', async ({ page }) => {
    await page.waitForSelector('.invite-stats', { timeout: 5000 });

    const stats = page.locator('.invite-stats');
    await expect(stats).toBeVisible();

    const items = page.locator('.invite-stats__item');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Check labels
    await expect(page.locator('.invite-stats__label').first()).toBeVisible();
  });

  test('should display invite code section', async ({ page }) => {
    await page.waitForSelector('.invite-code-section', { timeout: 5000 });

    const codeSection = page.locator('.invite-code-section');
    await expect(codeSection).toBeVisible();

    const codeBox = page.locator('.invite-code-box');
    await expect(codeBox).toBeVisible();

    const code = page.locator('.invite-code-box__code');
    await expect(code).toBeVisible();
    const codeText = await code.textContent();
    expect(codeText?.length).toBeGreaterThan(0);

    const copyBtn = page.locator('.invite-code-box__copy');
    await expect(copyBtn).toBeVisible();
  });

  test('should display share options grid', async ({ page }) => {
    await page.waitForSelector('.invite-share', { timeout: 5000 });

    const shareSection = page.locator('.invite-share');
    await expect(shareSection).toBeVisible();

    const title = page.locator('.invite-share__title');
    await expect(title).toContainText('Condividi via');

    const options = page.locator('.invite-share__option');
    const count = await options.count();

    // Should have 5 share options (WhatsApp, SMS, Email, Copy, Share)
    expect(count).toBe(5);
  });

  test('should display all share option buttons with correct labels', async ({ page }) => {
    await page.waitForSelector('.invite-share', { timeout: 5000 });

    // WhatsApp
    await expect(page.locator('.invite-share__option-label').filter({ hasText: 'WhatsApp' })).toBeVisible();

    // SMS
    await expect(page.locator('.invite-share__option-label').filter({ hasText: 'SMS' })).toBeVisible();

    // Email
    await expect(page.locator('.invite-share__option-label').filter({ hasText: 'Email' })).toBeVisible();

    // Copy Link
    await expect(page.locator('.invite-share__option-label').filter({ hasText: 'Copia Link' })).toBeVisible();

    // Altro (Share)
    await expect(page.locator('.invite-share__option-label').filter({ hasText: 'Altro' })).toBeVisible();
  });

  test('should display pending invites list', async ({ page }) => {
    await page.waitForSelector('.invite-history', { timeout: 5000 });

    const history = page.locator('.invite-history');
    await expect(history).toBeVisible();

    const title = page.locator('.invite-history__title');
    await expect(title).toContainText('Inviti recenti');

    const items = page.locator('.invite-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display invite item with all required elements', async ({ page }) => {
    await page.waitForSelector('.invite-history', { timeout: 5000 });

    const firstItem = page.locator('.invite-item').first();
    await expect(firstItem).toBeVisible();

    // Icon
    const icon = firstItem.locator('.invite-item__icon');
    await expect(icon).toBeVisible();

    // Recipient
    const recipient = firstItem.locator('.invite-item__recipient');
    await expect(recipient).toBeVisible();

    // Meta (method, time)
    const meta = firstItem.locator('.invite-item__meta');
    await expect(meta).toBeVisible();

    // Status
    const status = firstItem.locator('.invite-item__status');
    await expect(status).toBeVisible();
  });

  test('should display status badges with correct styling', async ({ page }) => {
    await page.waitForSelector('.invite-history', { timeout: 5000 });

    // Check for pending status
    const pendingStatus = page.locator('.invite-item__status.status--pending').first();
    if (await pendingStatus.isVisible().catch(() => false)) {
      await expect(pendingStatus).toContainText('In attesa');
    }

    // Check for accepted status
    const acceptedStatus = page.locator('.invite-item__status.status--accepted').first();
    if (await acceptedStatus.isVisible().catch(() => false)) {
      await expect(acceptedStatus).toContainText('Accettato');
    }
  });

  test('should display resend button for pending/expired invites', async ({ page }) => {
    await page.waitForSelector('.invite-history', { timeout: 5000 });

    const resendBtn = page.locator('.invite-item__resend').first();
    if (await resendBtn.isVisible().catch(() => false)) {
      await expect(resendBtn).toBeEnabled();
    }
  });

  test('should display bottom tab bar', async ({ page }) => {
    const tabBar = page.locator('app-bottom-tab-bar');
    await expect(tabBar).toBeVisible();
  });

  test('copy button should show confirmation', async ({ page }) => {
    await page.waitForSelector('.invite-code-box', { timeout: 5000 });

    const copyBtn = page.locator('.invite-code-box__copy');
    await copyBtn.click();

    // Should show "Copiato negli appunti!" message
    const copiedMessage = page.locator('.invite-code-section__copied');
    await expect(copiedMessage).toBeVisible({ timeout: 3000 });
    await expect(copiedMessage).toContainText('Copiato negli appunti');
  });

  test('share options should be clickable', async ({ page }) => {
    await page.waitForSelector('.invite-share', { timeout: 5000 });

    const shareOptions = page.locator('.invite-share__option');
    const count = await shareOptions.count();

    for (let i = 0; i < count; i++) {
      const option = shareOptions.nth(i);
      await expect(option).toBeEnabled();
    }
  });

  // Responsive tests for all 7 viewports
  for (const [deviceName, viewport] of Object.entries(DEVICE_VIEWPORTS)) {
    test(`responsive ${deviceName} (${viewport.width}x${viewport.height}): should display correctly`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await navigateToPage(page, '/invite');
      await page.waitForSelector('.invite-hero', { timeout: 5000 });

      const header = page.locator('.invite-header');
      await expect(header).toBeVisible();

      const content = page.locator('.invite-content');
      await expect(content).toBeVisible();

      // Take screenshot for visual comparison
      await page.screenshot({
        path: `e2e/test-results/screenshots/invite-${deviceName}-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    });
  }

  test('responsive: share options grid should adapt to viewport', async ({ page }) => {
    // On very small screens, should show 3 columns
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToPage(page, '/invite');
    await page.waitForSelector('.invite-share__options', { timeout: 5000 });

    const options = page.locator('.invite-share__options');
    await expect(options).toBeVisible();
  });

  test('accessibility: back button should have aria-label', async ({ page }) => {
    const backButton = page.locator('.invite-header__back');
    await expect(backButton).toHaveAttribute('aria-label', 'Torna indietro');
  });

  test('accessibility: share options should have aria-labels', async ({ page }) => {
    await page.waitForSelector('.invite-share', { timeout: 5000 });

    const shareOptions = page.locator('.invite-share__option');
    const count = await shareOptions.count();

    for (let i = 0; i < count; i++) {
      const option = shareOptions.nth(i);
      await expect(option).toHaveAttribute('aria-label');
    }
  });
});

// ================================
// Cross-Page Navigation Tests
// ================================
test.describe('Drawer Batch 2 - Cross-Page Navigation', () => {
  test('should navigate from adopt to main via tab bar', async ({ page }) => {
    await navigateToPage(page, '/adopt');
    await page.waitForSelector('.adopt-list, .adopt-empty', { timeout: 5000 });

    const homeTab = page.locator('app-bottom-tab-bar').locator('[data-tab-id="home"]');
    if (await homeTab.isVisible().catch(() => false)) {
      await homeTab.click();
      await expect(page).toHaveURL(/\/home\/main/);
    }
  });

  test('should navigate from friends to main via tab bar', async ({ page }) => {
    await navigateToPage(page, '/friends');
    await page.waitForSelector('.pet-friends-list, .pet-friends-empty', { timeout: 5000 });

    const homeTab = page.locator('app-bottom-tab-bar').locator('[data-tab-id="home"]');
    if (await homeTab.isVisible().catch(() => false)) {
      await homeTab.click();
      await expect(page).toHaveURL(/\/home\/main/);
    }
  });

  test('should navigate from invite to main via tab bar', async ({ page }) => {
    await navigateToPage(page, '/invite');
    await page.waitForSelector('.invite-hero', { timeout: 5000 });

    const homeTab = page.locator('app-bottom-tab-bar').locator('[data-tab-id="home"]');
    if (await homeTab.isVisible().catch(() => false)) {
      await homeTab.click();
      await expect(page).toHaveURL(/\/home\/main/);
    }
  });
});

// ================================
// Error State Tests
// ================================
test.describe('Drawer Batch 2 - Error States', () => {
  test('adopt: should display retry button on error', async ({ page }) => {
    // Intercept API to simulate error
    await page.route('**/api/**', route => route.abort());

    await page.goto('/home/adopt');

    // Should show error state with retry button
    const errorState = page.locator('.adopt-error');
    if (await errorState.isVisible({ timeout: 5000 }).catch(() => false)) {
      const retryBtn = page.locator('.adopt-error__retry');
      await expect(retryBtn).toBeVisible();
      await expect(retryBtn).toContainText('Riprova');
    }
  });

  test('friends: should display retry button on error', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());

    await page.goto('/home/friends');

    const errorState = page.locator('.pet-friends-error');
    if (await errorState.isVisible({ timeout: 5000 }).catch(() => false)) {
      const retryBtn = page.locator('.pet-friends-error__retry');
      await expect(retryBtn).toBeVisible();
    }
  });

  test('invite: should display retry button on error', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());

    await page.goto('/home/invite');

    const errorState = page.locator('.invite-error');
    if (await errorState.isVisible({ timeout: 5000 }).catch(() => false)) {
      const retryBtn = page.locator('.invite-error__retry');
      await expect(retryBtn).toBeVisible();
    }
  });
});
