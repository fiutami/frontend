import { test, expect } from '@playwright/test';
import { createApiMocks } from '../../mocks/api-mocks';

/**
 * Tests for calendar month view page (mob_calendar_month_*)
 * Verifies corrections per FIUTAMI UX specs
 */

const BASE_URL = 'http://localhost:4200';
const CALENDAR_URL = `${BASE_URL}/home/calendar`;
const MOBILE_VIEWPORT = { width: 390, height: 844 };

async function navigateToMonthView(page: any) {
  const apiMocks = createApiMocks(page);
  await apiMocks.setupAllMocks();

  await page.goto(BASE_URL);
  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'mock-token-123');
    localStorage.setItem('refreshToken', 'mock-refresh-token-456');
  });

  // Navigate to main calendar
  await page.goto(CALENDAR_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Click on a month button to navigate to month view
  const monthBtn = page.locator('.calendar-page__month-btn').first();
  await monthBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test.describe('Calendar Month View - Action Row', () => {
  test('has only "Crea evento" button and notification bell (not 3 action buttons)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await navigateToMonthView(page);

    // Verify "Crea evento" button exists
    const createEventBtn = page.locator('.calendar__create-event-btn');
    await expect(createEventBtn).toBeVisible();
    await expect(createEventBtn).toContainText('Crea evento');

    // Verify notification bell exists
    const notificationBtn = page.locator('.calendar__notification-btn');
    await expect(notificationBtn).toBeVisible();

    // Verify the OLD action buttons component is NOT present
    const oldActionButtons = page.locator('.action-buttons');
    await expect(oldActionButtons).toHaveCount(0);

    // Verify specific old buttons don't exist
    const eventiBtn = page.locator('button:has-text("Eventi")');
    await expect(eventiBtn).toHaveCount(0);

    const compleanniBtn = page.locator('button:has-text("Compleanni in vista")');
    await expect(compleanniBtn).toHaveCount(0);
  });

  test('"Crea evento" and bell are aligned horizontally', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await navigateToMonthView(page);

    const createBtn = page.locator('.calendar__create-event-btn');
    const bellBtn = page.locator('.calendar__notification-btn');

    const createBox = await createBtn.boundingBox();
    const bellBox = await bellBtn.boundingBox();

    expect(createBox).not.toBeNull();
    expect(bellBox).not.toBeNull();

    // Both should be on the same row (similar Y position)
    const yTolerance = 10;
    expect(Math.abs(createBox!.y - bellBox!.y)).toBeLessThan(yTolerance);
  });
});

test.describe('Calendar Month View - No Promo Sections', () => {
  test('does NOT have FIUTAMI Plus promo section', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await navigateToMonthView(page);

    const promoSection = page.locator('.calendar__promo-section');
    await expect(promoSection).toHaveCount(0);

    const fiutamiPlusText = page.locator('text=FIUTAMI Plus');
    await expect(fiutamiPlusText).toHaveCount(0);
  });

  test('does NOT have Track Emotion preview', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await navigateToMonthView(page);

    const trackEmotion = page.locator('.calendar__track-emotion');
    await expect(trackEmotion).toHaveCount(0);

    const trackEmotionText = page.locator('text=Track Emotion');
    await expect(trackEmotionText).toHaveCount(0);
  });

  test('does NOT have Promozioni button', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await navigateToMonthView(page);

    const promoBtn = page.locator('.calendar__promo-btn');
    await expect(promoBtn).toHaveCount(0);

    const promoBtnText = page.locator('button:has-text("Promozioni")');
    await expect(promoBtnText).toHaveCount(0);
  });
});

test.describe('Calendar Month View - Events Section', () => {
  test('does NOT show placeholder when no events (clean/neutral space)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await navigateToMonthView(page);

    // Select a day without events (e.g., click on day 28 which likely has no events)
    const dayWithoutEvents = page.locator('.calendar__day').filter({ hasText: '28' }).first();
    await dayWithoutEvents.click();
    await page.waitForTimeout(300);

    // Verify no "Nessun evento" placeholder
    const noEventsPlaceholder = page.locator('.calendar__no-events');
    await expect(noEventsPlaceholder).toHaveCount(0);

    const noEventsText = page.locator('text=Nessun evento per questo giorno');
    await expect(noEventsText).toHaveCount(0);
  });
});

test.describe('Calendar Month View - Visual Snapshot', () => {
  test('takes screenshot of clean month view', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await navigateToMonthView(page);

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'test-results/calendar-month-view-clean.png',
      fullPage: true
    });
  });
});
