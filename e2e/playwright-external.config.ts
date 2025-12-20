import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for testing deployed environments
 * No webServer - runs against external URL
 */

const baseURL = process.env['BASE_URL'] || 'https://app.fiutami.pet';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: 1,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-external' }],
  ],

  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // NO webServer - testing external deployment
});
