import { test, expect } from '@playwright/test';
import { createApiMocks } from '../../mocks/api-mocks';

/**
 * Quick test to verify calendar description text
 */

const BASE_URL = 'http://localhost:4200';
const CALENDAR_URL = `${BASE_URL}/home/calendar`;
const MOBILE_VIEWPORT = { width: 390, height: 844 };

test('calendar page has description text "In che mese andiamo a mettere il naso?"', async ({ page }) => {
  await page.setViewportSize(MOBILE_VIEWPORT);

  const apiMocks = createApiMocks(page);
  await apiMocks.setupAllMocks();

  await page.goto(BASE_URL);
  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'mock-token-123');
    localStorage.setItem('refreshToken', 'mock-refresh-token-456');
  });

  await page.goto(CALENDAR_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Verify description text is visible
  const description = page.locator('.calendar-page__description');
  await expect(description).toBeVisible();
  await expect(description).toHaveText('In che mese andiamo a mettere il naso?');
});

test('header has title next to back button (not centered)', async ({ page }) => {
  await page.setViewportSize(MOBILE_VIEWPORT);

  const apiMocks = createApiMocks(page);
  await apiMocks.setupAllMocks();

  await page.goto(BASE_URL);
  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'mock-token-123');
  });

  await page.goto(CALENDAR_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Verify header-left group exists (back button + title together)
  const headerLeft = page.locator('.calendar-page__header-left');
  await expect(headerLeft).toBeVisible();

  // Verify back button and title are inside the same container
  const backBtn = headerLeft.locator('app-back-button');
  const title = headerLeft.locator('.calendar-page__title');

  await expect(backBtn).toBeVisible();
  await expect(title).toBeVisible();
  await expect(title).toHaveText('Calendario');
});

test('action buttons are displayed horizontally in a row', async ({ page }) => {
  await page.setViewportSize(MOBILE_VIEWPORT);

  const apiMocks = createApiMocks(page);
  await apiMocks.setupAllMocks();

  await page.goto(BASE_URL);
  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'mock-token-123');
  });

  await page.goto(CALENDAR_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Get all action buttons
  const buttons = page.locator('.action-buttons__btn');
  await expect(buttons).toHaveCount(3);

  // Verify all buttons are visible
  await expect(buttons.nth(0)).toBeVisible();
  await expect(buttons.nth(1)).toBeVisible();
  await expect(buttons.nth(2)).toBeVisible();

  // Verify buttons don't have icons (no material-icons inside)
  const icons = page.locator('.action-buttons__btn .material-icons');
  await expect(icons).toHaveCount(0);

  // Verify horizontal layout by checking that buttons have similar Y position
  const button1Box = await buttons.nth(0).boundingBox();
  const button2Box = await buttons.nth(1).boundingBox();
  const button3Box = await buttons.nth(2).boundingBox();

  expect(button1Box).not.toBeNull();
  expect(button2Box).not.toBeNull();
  expect(button3Box).not.toBeNull();

  // All buttons should be on the same row (similar Y position, within 5px tolerance)
  const yTolerance = 5;
  expect(Math.abs(button1Box!.y - button2Box!.y)).toBeLessThan(yTolerance);
  expect(Math.abs(button2Box!.y - button3Box!.y)).toBeLessThan(yTolerance);
});
