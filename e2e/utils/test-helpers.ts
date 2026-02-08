import { Page, BrowserContext, expect } from '@playwright/test';
import { createApiMocks } from '../mocks/api-mocks';
import { testTokens, testUsers } from '../fixtures/test-data';

/**
 * Test Helper Functions
 */

/**
 * Setup authenticated test context
 */
export async function setupAuthenticatedContext(page: Page): Promise<void> {
  const apiMocks = createApiMocks(page);
  await apiMocks.setupAllMocks();
  await apiMocks.setupAuthenticatedState();
}

/**
 * Clear all authentication state
 */
export async function clearAuthState(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
}

/**
 * Take a named screenshot for debugging
 */
export async function debugScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `test-results/debug/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Mock specific API endpoint with custom response
 */
export async function mockApiResponse(
  page: Page,
  endpoint: string,
  response: {
    status?: number;
    body?: object;
    delay?: number;
  }
): Promise<void> {
  await page.route(`**/api${endpoint}`, async (route) => {
    if (response.delay) {
      await new Promise((resolve) => setTimeout(resolve, response.delay));
    }
    await route.fulfill({
      status: response.status || 200,
      contentType: 'application/json',
      body: JSON.stringify(response.body || {}),
    });
  });
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, selector);
}

/**
 * Get computed style property
 */
export async function getComputedStyle(
  page: Page,
  selector: string,
  property: string
): Promise<string> {
  return await page.evaluate(
    ([sel, prop]) => {
      const element = document.querySelector(sel);
      if (!element) return '';
      return window.getComputedStyle(element).getPropertyValue(prop);
    },
    [selector, property]
  );
}

/**
 * Simulate network conditions
 */
export async function simulateSlowNetwork(page: Page): Promise<void> {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (500 * 1024) / 8, // 500 kbps
    uploadThroughput: (500 * 1024) / 8,
    latency: 400, // 400ms latency
  });
}

/**
 * Restore normal network conditions
 */
export async function restoreNetwork(page: Page): Promise<void> {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: -1,
    uploadThroughput: -1,
    latency: 0,
  });
}

/**
 * Generate random test data
 */
export function generateTestData(): {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
} {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@example.com`,
    password: `SecurePass${timestamp}!`,
    firstName: `Test${timestamp}`,
    lastName: `User${timestamp}`,
  };
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, type: 'success' | 'error' = 'success'): Promise<void> {
  const selector = type === 'success'
    ? '[class*="success"], [class*="--success"]'
    : '[class*="error"], [class*="--error"]';

  await expect(page.locator(selector).first()).toBeVisible({ timeout: 5000 });
}

/**
 * Fill form fields by name
 */
export async function fillForm(
  page: Page,
  fields: Record<string, string>
): Promise<void> {
  for (const [name, value] of Object.entries(fields)) {
    const input = page.locator(`[name="${name}"], [formControlName="${name}"], #${name}`);
    await input.fill(value);
  }
}

/**
 * Verify form field values
 */
export async function verifyFormValues(
  page: Page,
  fields: Record<string, string>
): Promise<void> {
  for (const [name, value] of Object.entries(fields)) {
    const input = page.locator(`[name="${name}"], [formControlName="${name}"], #${name}`);
    await expect(input).toHaveValue(value);
  }
}

/**
 * Get all console errors from page
 */
export function captureConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Check for JavaScript errors
 */
export function capturePageErrors(page: Page): Error[] {
  const errors: Error[] = [];
  page.on('pageerror', (error) => {
    errors.push(error);
  });
  return errors;
}

/**
 * Viewport breakpoints for responsive testing
 */
export const viewports = {
  mobile: { width: 375, height: 667 },
  mobileLandscape: { width: 667, height: 375 },
  tablet: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  desktop: { width: 1280, height: 800 },
  desktopLarge: { width: 1920, height: 1080 },
  desktop4k: { width: 3840, height: 2160 },
};

/**
 * Test across multiple viewports
 */
export async function testAcrossViewports(
  page: Page,
  testFn: () => Promise<void>,
  viewportNames: (keyof typeof viewports)[] = ['mobile', 'tablet', 'desktop']
): Promise<void> {
  for (const viewportName of viewportNames) {
    await page.setViewportSize(viewports[viewportName]);
    await testFn();
  }
}

/**
 * Accessibility: Check color contrast (simplified)
 */
export async function checkContrastRatio(
  page: Page,
  selector: string
): Promise<{ foreground: string; background: string }> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return { foreground: '', background: '' };

    const styles = window.getComputedStyle(element);
    return {
      foreground: styles.color,
      background: styles.backgroundColor,
    };
  }, selector);
}
