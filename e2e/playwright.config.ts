import { defineConfig, devices } from '@playwright/test';

/**
 * Fiutami E2E Test Configuration
 *
 * Supports two modes:
 * - MOCK_API=true: Uses mocked API responses (for CI)
 * - MOCK_API=false: Uses real backend (for integration testing)
 */

const isMockMode = process.env['MOCK_API'] === 'true';
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';
const apiURL = process.env['API_URL'] || 'http://localhost:5000/api';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
    ...(process.env['CI'] ? [['github'] as const] : []),
  ],

  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  // Global setup for authentication state
  globalSetup: isMockMode ? undefined : './fixtures/global-setup.ts',

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },

    // Responsive breakpoints for visual testing
    {
      name: 'responsive-320',
      use: { viewport: { width: 320, height: 720 } },
      testMatch: /visual/,
    },
    {
      name: 'responsive-768',
      use: { viewport: { width: 768, height: 1024 } },
      testMatch: /visual/,
    },
    {
      name: 'responsive-1024',
      use: { viewport: { width: 1024, height: 768 } },
      testMatch: /visual/,
    },
    {
      name: 'responsive-1440',
      use: { viewport: { width: 1440, height: 900 } },
      testMatch: /visual/,
    },

    // Drawer Menu Device Matrix (8 devices)
    {
      name: 'drawer-mobile',
      use: { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true },
      testMatch: /drawer-menu/,
    },
    {
      name: 'drawer-tablet',
      use: { viewport: { width: 768, height: 1024 }, isMobile: false, hasTouch: true },
      testMatch: /drawer-menu/,
    },
    {
      name: 'drawer-desktop',
      use: { viewport: { width: 1440, height: 900 }, isMobile: false },
      testMatch: /drawer-menu/,
    },
    {
      name: 'drawer-foldable-folded',
      use: { viewport: { width: 717, height: 512 }, isMobile: true, hasTouch: true },
      testMatch: /drawer-menu/,
    },
    {
      name: 'drawer-foldable-unfolded',
      use: { viewport: { width: 1485, height: 720 }, isMobile: false, hasTouch: true },
      testMatch: /drawer-menu/,
    },
    {
      name: 'drawer-iphone-2025',
      use: { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
      testMatch: /drawer-menu/,
    },
    {
      name: 'drawer-honor-magic-v3',
      use: { viewport: { width: 795, height: 720 }, isMobile: true, hasTouch: true },
      testMatch: /drawer-menu/,
    },
    {
      name: 'drawer-honor-magic-v5',
      use: { viewport: { width: 795, height: 720 }, isMobile: true, hasTouch: true },
      testMatch: /drawer-menu/,
    },
  ],

  webServer: {
    command: 'npm run start',
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },

  // Output directories
  outputDir: 'test-results/artifacts',
  snapshotDir: 'test-results/snapshots',
});

export { isMockMode, baseURL, apiURL };
