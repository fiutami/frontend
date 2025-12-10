import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object with common functionality
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common locators
  get loadingSpinner(): Locator {
    return this.page.locator('.spinner, .loading, [data-testid="loading"]');
  }

  get toastMessage(): Locator {
    return this.page.locator('.toast, .notification, [role="alert"]');
  }

  get successMessage(): Locator {
    return this.page.locator('[class*="success"], [class*="--success"]');
  }

  get errorMessage(): Locator {
    return this.page.locator('[class*="error"], [class*="--error"]');
  }

  // Navigation
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForNavigation(url: string | RegExp): Promise<void> {
    await this.page.waitForURL(url);
  }

  // Wait helpers
  async waitForLoadingToFinish(): Promise<void> {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  }

  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForDomContentLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Local storage helpers
  async setLocalStorage(key: string, value: string): Promise<void> {
    await this.page.evaluate(([k, v]) => {
      localStorage.setItem(k, v);
    }, [key, value]);
  }

  async getLocalStorage(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  // Screenshot helpers
  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  async takeFullPageScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true
    });
  }

  // Accessibility helpers
  async checkA11y(): Promise<void> {
    // Check for basic accessibility issues
    const images = await this.page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt, 'Image should have alt attribute').not.toBeNull();
    }

    const buttons = await this.page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel;
      expect(hasAccessibleName, 'Button should have accessible name').toBeTruthy();
    }
  }

  // Form helpers
  async fillInput(selector: string, value: string): Promise<void> {
    const input = this.page.locator(selector);
    await input.clear();
    await input.fill(value);
  }

  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).selectOption(value);
  }

  async clickButton(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  async submitForm(formSelector: string): Promise<void> {
    await this.page.locator(formSelector).evaluate((form: HTMLFormElement) => form.submit());
  }

  // Viewport helpers
  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  async isMobileViewport(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  // Error handling
  async expectNoConsoleErrors(): Promise<void> {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    expect(errors.length, `Console errors found: ${errors.join(', ')}`).toBe(0);
  }
}
