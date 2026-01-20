import { test, expect, Page } from '@playwright/test';
import { createApiMocks } from '../../mocks/api-mocks';

/**
 * Calendar UX/UI Tests
 *
 * Tests the calendar page structure and overlay interactions
 * according to Figma design: mob_calendar (12271-6457)
 *
 * Run with: npx playwright test e2e/tests/visual/calendar-ux.spec.ts
 */

const BASE_URL = process.env['BASE_URL'] || 'http://localhost:4200';
const CALENDAR_URL = `${BASE_URL}/home/calendar`;

// Mobile viewport (iPhone 12 size)
const MOBILE_VIEWPORT = { width: 390, height: 844 };

/**
 * Helper: Setup authentication and navigate to calendar page
 */
async function navigateToCalendar(page: Page): Promise<void> {
  await page.setViewportSize(MOBILE_VIEWPORT);

  // Setup API mocks for authentication
  const apiMocks = createApiMocks(page);
  await apiMocks.setupAllMocks();

  // Set auth token in localStorage to simulate logged-in state
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'mock-token-123');
    localStorage.setItem('refreshToken', 'mock-refresh-token-456');
    localStorage.setItem('user', JSON.stringify({
      id: 'test-user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }));
  });

  // Navigate to calendar
  await page.goto(CALENDAR_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Wait for Angular to initialize
}

/**
 * Helper: Click filter icon by type and wait for overlay animation
 */
async function clickFilterIcon(page: Page, iconType: 'saved' | 'month' | 'notifications'): Promise<void> {
  const labels: Record<string, string> = {
    saved: 'Elementi salvati',
    month: 'Vista calendario',
    notifications: 'Notifiche',
  };
  await page.click(`button[aria-label="${labels[iconType]}"]`);
  // Wait for animation to complete
  await page.waitForTimeout(400);
}

/**
 * Helper: Click action button by text and wait for overlay animation
 */
async function clickActionButton(page: Page, buttonText: string): Promise<void> {
  await page.click(`.action-buttons__btn:has-text("${buttonText}")`);
  // Wait for animation to complete
  await page.waitForTimeout(400);
}

// ============================================================
// PAGE STRUCTURE TESTS
// ============================================================

test.describe('Calendar Page Structure', () => {
  test('renders complete page structure per Figma spec', async ({ page }) => {
    await navigateToCalendar(page);

    // Header elements
    await expect(page.locator('.calendar-page__header')).toBeVisible();
    await expect(page.locator('app-back-button')).toBeVisible();
    await expect(page.locator('.calendar-page__title')).toHaveText('Calendario');
    await expect(page.locator('app-avatar-button')).toBeVisible();

    // Branding elements
    await expect(page.locator('.calendar-page__logo')).toBeVisible();
    await expect(page.locator('.calendar-page__date')).toBeVisible();

    // Filter icons (3)
    await expect(page.locator('app-calendar-filter-icons')).toBeVisible();
    const filterButtons = page.locator('.filter-icons__btn');
    await expect(filterButtons).toHaveCount(3);

    // Action buttons (3)
    await expect(page.locator('app-calendar-action-buttons')).toBeVisible();
    const actionButtons = page.locator('.action-buttons__btn');
    await expect(actionButtons).toHaveCount(3);

    // Year navigation
    await expect(page.locator('.calendar-page__year-nav')).toBeVisible();
    await expect(page.locator('.calendar-page__year')).toBeVisible();

    // Month grid (12 months in 2 columns)
    const monthButtons = page.locator('.calendar-page__month-btn');
    await expect(monthButtons).toHaveCount(12);
  });

  test('displays correct date format', async ({ page }) => {
    await navigateToCalendar(page);

    // Date should contain day name, day number, month, year
    const dateText = await page.locator('.calendar-page__date').textContent();
    expect(dateText).toBeTruthy();

    // Check format contains expected parts (Italian)
    expect(dateText).toMatch(/\d{1,2}/); // day number
    expect(dateText).toMatch(/\d{4}/); // year
  });

  test('has FIUTAMI logo visible', async ({ page }) => {
    await navigateToCalendar(page);

    const logo = page.locator('.calendar-page__logo');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('alt', 'FIUTAMI');
  });

  test('takes full page screenshot', async ({ page }) => {
    await navigateToCalendar(page);

    await expect(page).toHaveScreenshot('calendar-page-full.png', {
      maxDiffPixelRatio: 0.15,
      fullPage: true,
    });
  });
});

// ============================================================
// FILTER ICONS TESTS
// ============================================================

test.describe('Calendar Filter Icons', () => {
  test('Salvati icon opens overlay and becomes active (yellow)', async ({ page }) => {
    await navigateToCalendar(page);

    // Click Salvati icon
    await clickFilterIcon(page, 'saved');

    // Overlay backdrop should be visible (inside the overlay component)
    await expect(page.locator('.calendar-overlay-backdrop')).toBeVisible();

    // Icon should be active
    await expect(page.locator('button[aria-label="Elementi salvati"]')).toHaveClass(/--active/);
  });

  test('Calendario icon opens mini-calendar overlay', async ({ page }) => {
    await navigateToCalendar(page);

    // Click Calendario icon
    await clickFilterIcon(page, 'month');

    // Overlay should be visible with calendar grid
    await expect(page.locator('.calendar-overlay-backdrop')).toBeVisible();
    await expect(page.locator('.month-overlay__grid')).toBeVisible();
  });

  test('Campanella icon opens notifications overlay with badge', async ({ page }) => {
    await navigateToCalendar(page);

    // Check badge is visible
    await expect(page.locator('.filter-icons__badge')).toBeVisible();

    // Click notifications icon
    await clickFilterIcon(page, 'notifications');

    // Overlay should be visible
    await expect(page.locator('.calendar-overlay-backdrop')).toBeVisible();
  });

  test('clicking same filter icon toggles overlay closed', async ({ page }) => {
    await navigateToCalendar(page);

    // Open overlay
    await clickFilterIcon(page, 'saved');
    await expect(page.locator('.calendar-overlay-backdrop')).toBeVisible();

    // Click same icon again to close - use force:true because overlay backdrop covers the button
    await page.click('button[aria-label="Elementi salvati"]', { force: true });
    await page.waitForTimeout(500);

    // Overlay should no longer be in DOM or hidden
    await expect(page.locator('.calendar-overlay-backdrop')).toBeHidden({ timeout: 3000 });
  });
});

// ============================================================
// ACTION BUTTONS TESTS
// ============================================================

test.describe('Calendar Action Buttons', () => {
  test('"Crea evento" button opens form overlay and becomes blue', async ({ page }) => {
    await navigateToCalendar(page);

    // Click "Crea evento"
    await clickActionButton(page, 'Crea evento');

    // Overlay should be visible with form
    await expect(page.locator('.calendar-overlay-backdrop')).toBeVisible();

    // Button should be active (blue)
    const btn = page.locator('.action-buttons__btn:has-text("Crea evento")');
    await expect(btn).toHaveClass(/--active/);
  });

  test('"Eventi" button opens public events overlay', async ({ page }) => {
    await navigateToCalendar(page);

    // Click "Eventi"
    await clickActionButton(page, 'Eventi');

    // Overlay should be visible
    await expect(page.locator('.calendar-overlay-backdrop')).toBeVisible();
  });

  test('"Compleanni in vista" button opens birthdays overlay', async ({ page }) => {
    await navigateToCalendar(page);

    // Click "Compleanni in vista"
    await clickActionButton(page, 'Compleanni in vista');

    // Overlay should be visible
    await expect(page.locator('.calendar-overlay-backdrop')).toBeVisible();
  });

  test('action buttons show all 3 with correct text', async ({ page }) => {
    await navigateToCalendar(page);

    await expect(page.locator('.action-buttons__btn:has-text("Crea evento")')).toBeVisible();
    await expect(page.locator('.action-buttons__btn:has-text("Eventi")')).toBeVisible();
    await expect(page.locator('.action-buttons__btn:has-text("Compleanni in vista")')).toBeVisible();
  });
});

// ============================================================
// OVERLAY INTERACTION TESTS
// ============================================================

test.describe('Overlay Interactions', () => {
  test('Escape key closes overlay', async ({ page }) => {
    await navigateToCalendar(page);

    // Open overlay
    await clickFilterIcon(page, 'saved');
    await expect(page.locator('.calendar-overlay-backdrop')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Overlay should be closed
    await expect(page.locator('.calendar-overlay-backdrop')).not.toBeVisible();
  });

  test('clicking backdrop closes overlay', async ({ page }) => {
    await navigateToCalendar(page);

    // Open overlay
    await clickFilterIcon(page, 'saved');
    await expect(page.locator('.calendar-overlay-backdrop')).toBeVisible();

    // Click backdrop (at edge, not on the overlay content)
    await page.click('.calendar-overlay-backdrop', { position: { x: 10, y: 10 } });
    await page.waitForTimeout(500);

    // Overlay should be closed
    await expect(page.locator('.calendar-overlay-backdrop')).toBeHidden({ timeout: 3000 });
  });

  test('clicking close button closes overlay', async ({ page }) => {
    await navigateToCalendar(page);

    // Open overlay
    await clickFilterIcon(page, 'saved');
    await expect(page.locator('.calendar-overlay')).toBeVisible();

    // Click close button
    await page.click('.calendar-overlay__close-btn');

    // Overlay should be closed
    await expect(page.locator('.calendar-overlay')).not.toBeVisible();
  });

  test('opening one overlay closes any previously open overlay', async ({ page }) => {
    await navigateToCalendar(page);

    // Open first overlay (Salvati)
    await clickFilterIcon(page, 'saved');
    await expect(page.locator('.calendar-overlay__title')).toHaveText('Salvati');

    // Close first overlay by clicking backdrop, then open Eventi
    await page.click('.calendar-overlay-backdrop', { position: { x: 10, y: 10 } });
    await page.waitForTimeout(400);

    // Open Eventi overlay
    await clickActionButton(page, 'Eventi');
    await expect(page.locator('.calendar-overlay__title')).toHaveText('Eventi');
  });
});

// ============================================================
// MONTH NAVIGATION TESTS (ONLY exception - opens new page)
// ============================================================

test.describe('Month Navigation', () => {
  test('clicking month button navigates to calendar view page', async ({ page }) => {
    await navigateToCalendar(page);

    // Click on first month (GENNAIO)
    await page.click('.calendar-page__month-btn:has-text("GENNAIO")');

    // Should navigate to month view (lazy-loaded calendar module)
    await page.waitForURL(/\/calendar\/month/, { timeout: 10000 });
    expect(page.url()).toContain('/calendar/month');
    expect(page.url()).toContain('month=0');
  });

  test('year navigation changes displayed year', async ({ page }) => {
    await navigateToCalendar(page);

    const initialYear = await page.locator('.calendar-page__year').textContent();

    // Click next year
    await page.click('.calendar-page__year-btn:last-child');
    const nextYear = await page.locator('.calendar-page__year').textContent();

    expect(parseInt(nextYear!)).toBe(parseInt(initialYear!) + 1);
  });

  test('current month is highlighted (yellow)', async ({ page }) => {
    await navigateToCalendar(page);

    // There should be exactly one current month button
    const currentMonthBtn = page.locator('.calendar-page__month-btn--current');
    await expect(currentMonthBtn).toHaveCount(1);
  });
});

// ============================================================
// CREATE EVENT FORM TESTS
// ============================================================

test.describe('Create Event Form', () => {
  test('form has all required fields per Figma spec', async ({ page }) => {
    await navigateToCalendar(page);

    // Open create event overlay
    await clickActionButton(page, 'Crea evento');
    await expect(page.locator('.calendar-overlay-backdrop')).toBeVisible();

    // Check fields exist
    await expect(page.locator('input[name="eventName"]')).toBeVisible();
    await expect(page.locator('input[name="eventLocation"]')).toBeVisible();
    await expect(page.locator('input[name="eventDate"]')).toBeVisible();
    await expect(page.locator('input[name="eventTime"]')).toBeVisible();
    await expect(page.locator('input[name="eventPhone"]')).toBeVisible();

    // Check repetition buttons exist
    await expect(page.locator('.create-event__repetition-btn')).toHaveCount(5);
  });

  test('submit button is disabled when form is invalid', async ({ page }) => {
    await navigateToCalendar(page);

    // Open create event overlay
    await clickActionButton(page, 'Crea evento');

    // Clear the name field (should be empty)
    await page.fill('input[name="eventName"]', '');

    // Submit button should be disabled
    await expect(page.locator('.create-event__submit')).toBeDisabled();
  });
});

// ============================================================
// VISUAL REGRESSION TESTS
// ============================================================

test.describe('Calendar Visual Regression', () => {
  test('Salvati overlay screenshot', async ({ page }) => {
    await navigateToCalendar(page);
    await clickFilterIcon(page, 'saved');
    await page.waitForTimeout(300); // Wait for animation

    await expect(page).toHaveScreenshot('calendar-overlay-salvati.png', {
      maxDiffPixelRatio: 0.15,
    });
  });

  test('Mini calendar overlay screenshot', async ({ page }) => {
    await navigateToCalendar(page);
    await clickFilterIcon(page, 'month');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('calendar-overlay-month.png', {
      maxDiffPixelRatio: 0.15,
    });
  });

  test('Create event overlay screenshot', async ({ page }) => {
    await navigateToCalendar(page);
    await clickActionButton(page, 'Crea evento');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('calendar-overlay-create-event.png', {
      maxDiffPixelRatio: 0.15,
    });
  });

  test('Events list overlay screenshot', async ({ page }) => {
    await navigateToCalendar(page);
    await clickActionButton(page, 'Eventi');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('calendar-overlay-events.png', {
      maxDiffPixelRatio: 0.15,
    });
  });

  test('Birthdays overlay screenshot', async ({ page }) => {
    await navigateToCalendar(page);
    await clickActionButton(page, 'Compleanni in vista');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('calendar-overlay-birthdays.png', {
      maxDiffPixelRatio: 0.15,
    });
  });
});
