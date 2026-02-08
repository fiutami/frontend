import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import {
  checkPageAssets,
  saveScreenshot,
  generateFullReport,
  saveReportToFile,
  printReportSummary,
  AssetReport
} from '../../utils/asset-checker';

// Mock auth token for authenticated routes
const MOCK_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGZpdXRhbWkuaXQiLCJpYXQiOjE3MzM0ODAwMDAsImV4cCI6MTc2NTAxNjAwMH0.test';

const MOCK_USER = {
  id: 'test-user-id',
  email: 'test@fiutami.it',
  firstName: 'Test',
  lastName: 'User',
  provider: 'email',
  createdAt: new Date().toISOString(),
  hasCompletedOnboarding: true
};

// All screens to audit
const SCREENS = {
  // Auth Module (public - no auth needed)
  auth: [
    { route: '/', name: 'Landing/HomeStart', requiresAuth: false },
    { route: '/login', name: 'Login', requiresAuth: false },
    { route: '/signup', name: 'Signup', requiresAuth: false },
  ],

  // Hero Module - Main
  heroMain: [
    { route: '/home/main', name: 'Home Main', requiresAuth: true },
    { route: '/home/welcome', name: 'Welcome', requiresAuth: true },
    { route: '/home/pet-profile', name: 'Pet Profile', requiresAuth: true },
    { route: '/home/dashboard', name: 'Dashboard', requiresAuth: true },
  ],

  // Hero Module - Pet Registration Flow
  petRegistration: [
    { route: '/home/pet-register', name: 'Pet Register Entry', requiresAuth: true },
    { route: '/home/pet-register/specie', name: 'Pet Species Selection', requiresAuth: true },
    { route: '/home/pet-register/details', name: 'Pet Details Form', requiresAuth: true },
    { route: '/home/pet-register/docs', name: 'Pet Documents', requiresAuth: true },
    { route: '/home/pet-register/wellness', name: 'Pet Wellness', requiresAuth: true },
  ],

  // Hero Module - AI Onboarding
  aiOnboarding: [
    { route: '/home/welcome-ai/1', name: 'AI Welcome Step 1', requiresAuth: true },
    { route: '/home/welcome-ai/2a', name: 'AI Welcome - Have Pets', requiresAuth: true },
    { route: '/home/welcome-ai/2b', name: 'AI Welcome - Want Pets', requiresAuth: true },
  ],

  // Hero Module - Species Questionnaire
  questionnaire: [
    { route: '/home/species-questionnaire/q1', name: 'Questionnaire Q1', requiresAuth: true },
    { route: '/home/species-questionnaire/q2', name: 'Questionnaire Q2', requiresAuth: true },
    { route: '/home/species-questionnaire/q3', name: 'Questionnaire Q3', requiresAuth: true },
    { route: '/home/species-questionnaire/q4', name: 'Questionnaire Q4', requiresAuth: true },
    { route: '/home/species-questionnaire/q5', name: 'Questionnaire Q5', requiresAuth: true },
    { route: '/home/species-questionnaire/q6', name: 'Questionnaire Q6', requiresAuth: true },
    { route: '/home/species-questionnaire/result', name: 'Questionnaire Result', requiresAuth: true },
  ],

  // User Module
  user: [
    { route: '/user/dashboard', name: 'User Dashboard', requiresAuth: true },
    { route: '/user/profile', name: 'User Profile', requiresAuth: true },
    { route: '/user/settings', name: 'User Settings', requiresAuth: true },
    { route: '/user/security', name: 'User Security', requiresAuth: true },
    { route: '/user/account', name: 'User Account', requiresAuth: true },
  ],

  // Other
  other: [
    { route: '/styleguide', name: 'Styleguide', requiresAuth: false },
    { route: '/test-video', name: 'Hero Video', requiresAuth: false },
  ]
};

// Flatten all screens for iteration
const ALL_SCREENS = [
  ...SCREENS.auth,
  ...SCREENS.heroMain,
  ...SCREENS.petRegistration,
  ...SCREENS.aiOnboarding,
  ...SCREENS.questionnaire,
  ...SCREENS.user,
  ...SCREENS.other
];

const SCREENSHOT_DIR = path.join(__dirname, '../../reports/screenshots');
const REPORT_PATH = path.join(__dirname, '../../reports/asset-audit-report.json');

// Ensure directories exist
test.beforeAll(async () => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

async function setupAuth(page: Page): Promise<void> {
  await page.addInitScript((user) => {
    localStorage.setItem('fiutami_access_token', 'mock-token');
    localStorage.setItem('fiutami_refresh_token', 'mock-refresh-token');
    localStorage.setItem('fiutami_user', JSON.stringify(user));
  }, MOCK_USER);
}

async function mockApiCalls(page: Page): Promise<void> {
  // Mock auth verification
  await page.route('**/api/auth/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ valid: true })
    });
  });

  // Mock pet endpoints
  await page.route('**/api/pet**', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          pets: [{
            id: 'mock-pet-id',
            name: 'Fido',
            speciesName: 'Cane',
            sex: 'male',
            calculatedAge: '2 anni',
            profilePhotoUrl: null
          }],
          total: 1
        })
      });
    } else {
      await route.fulfill({ status: 200, body: '{}' });
    }
  });

  // Mock species endpoints
  await page.route('**/api/species**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', code: 'dog', name: 'Cane', category: 'Mammifero' },
        { id: '2', code: 'cat', name: 'Gatto', category: 'Mammifero' }
      ])
    });
  });

  // Mock user/profile endpoints
  await page.route('**/api/profile**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-profile-id',
        displayName: 'Test User',
        avatarUrl: null
      })
    });
  });

  // Mock questionnaire endpoints
  await page.route('**/api/questionnaire**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        questions: [],
        responses: []
      })
    });
  });
}

// Collect all reports
const allReports: AssetReport[] = [];

test.describe('Screen Asset Audit', () => {
  test.describe.configure({ mode: 'serial' });

  // Auth Module Tests
  test.describe('Auth Module Screens', () => {
    for (const screen of SCREENS.auth) {
      test(`Audit: ${screen.name} (${screen.route})`, async ({ page }) => {
        await mockApiCalls(page);
        await page.goto(screen.route);
        await page.waitForLoadState('networkidle');

        // Take screenshot
        await saveScreenshot(page, screen.route, SCREENSHOT_DIR);

        // Check assets
        const report = await checkPageAssets(page, screen.route);
        allReports.push(report);

        // Log results
        console.log(`\n[${screen.name}] Status: ${report.summary.status}`);
        console.log(`  Images: ${report.summary.loadedImages}/${report.summary.totalImages}`);
        console.log(`  SVGs: ${report.summary.visibleSvgs}/${report.summary.totalSvgs}`);

        if (report.missingAssets.length > 0) {
          console.log(`  Missing: ${report.missingAssets.join(', ')}`);
        }

        // Assert no critical failures (allow warnings)
        expect(report.summary.missingImages).toBeLessThanOrEqual(2); // Allow up to 2 missing images
      });
    }
  });

  // Hero Main Screens
  test.describe('Hero Main Screens', () => {
    for (const screen of SCREENS.heroMain) {
      test(`Audit: ${screen.name} (${screen.route})`, async ({ page }) => {
        await mockApiCalls(page);
        if (screen.requiresAuth) {
          await setupAuth(page);
        }
        await page.goto(screen.route);
        await page.waitForLoadState('networkidle');

        await saveScreenshot(page, screen.route, SCREENSHOT_DIR);
        const report = await checkPageAssets(page, screen.route);
        allReports.push(report);

        console.log(`\n[${screen.name}] Status: ${report.summary.status}`);
        console.log(`  Images: ${report.summary.loadedImages}/${report.summary.totalImages}`);
        if (report.missingAssets.length > 0) {
          console.log(`  Missing: ${report.missingAssets.join(', ')}`);
        }
      });
    }
  });

  // Pet Registration Flow
  test.describe('Pet Registration Flow', () => {
    for (const screen of SCREENS.petRegistration) {
      test(`Audit: ${screen.name} (${screen.route})`, async ({ page }) => {
        await mockApiCalls(page);
        if (screen.requiresAuth) {
          await setupAuth(page);
        }

        // For pet registration, we might need to set some session storage
        await page.addInitScript(() => {
          sessionStorage.setItem('selectedSpecies', JSON.stringify({
            id: 'dog',
            name: 'Cane',
            category: 'Mammifero'
          }));
        });

        await page.goto(screen.route);
        await page.waitForLoadState('networkidle');

        await saveScreenshot(page, screen.route, SCREENSHOT_DIR);
        const report = await checkPageAssets(page, screen.route);
        allReports.push(report);

        console.log(`\n[${screen.name}] Status: ${report.summary.status}`);
        if (report.missingAssets.length > 0) {
          console.log(`  Missing: ${report.missingAssets.join(', ')}`);
        }
      });
    }
  });

  // AI Onboarding
  test.describe('AI Onboarding Screens', () => {
    for (const screen of SCREENS.aiOnboarding) {
      test(`Audit: ${screen.name} (${screen.route})`, async ({ page }) => {
        await mockApiCalls(page);
        if (screen.requiresAuth) {
          await setupAuth(page);
        }
        await page.goto(screen.route);
        await page.waitForLoadState('networkidle');

        await saveScreenshot(page, screen.route, SCREENSHOT_DIR);
        const report = await checkPageAssets(page, screen.route);
        allReports.push(report);

        console.log(`\n[${screen.name}] Status: ${report.summary.status}`);
        if (report.missingAssets.length > 0) {
          console.log(`  Missing: ${report.missingAssets.join(', ')}`);
        }
      });
    }
  });

  // Species Questionnaire
  test.describe('Species Questionnaire Screens', () => {
    for (const screen of SCREENS.questionnaire) {
      test(`Audit: ${screen.name} (${screen.route})`, async ({ page }) => {
        await mockApiCalls(page);
        if (screen.requiresAuth) {
          await setupAuth(page);
        }
        await page.goto(screen.route);
        await page.waitForLoadState('networkidle');

        await saveScreenshot(page, screen.route, SCREENSHOT_DIR);
        const report = await checkPageAssets(page, screen.route);
        allReports.push(report);

        console.log(`\n[${screen.name}] Status: ${report.summary.status}`);
        if (report.missingAssets.length > 0) {
          console.log(`  Missing: ${report.missingAssets.join(', ')}`);
        }
      });
    }
  });

  // User Module
  test.describe('User Module Screens', () => {
    for (const screen of SCREENS.user) {
      test(`Audit: ${screen.name} (${screen.route})`, async ({ page }) => {
        await mockApiCalls(page);
        if (screen.requiresAuth) {
          await setupAuth(page);
        }
        await page.goto(screen.route);
        await page.waitForLoadState('networkidle');

        await saveScreenshot(page, screen.route, SCREENSHOT_DIR);
        const report = await checkPageAssets(page, screen.route);
        allReports.push(report);

        console.log(`\n[${screen.name}] Status: ${report.summary.status}`);
        if (report.missingAssets.length > 0) {
          console.log(`  Missing: ${report.missingAssets.join(', ')}`);
        }
      });
    }
  });

  // Other Screens
  test.describe('Other Screens', () => {
    for (const screen of SCREENS.other) {
      test(`Audit: ${screen.name} (${screen.route})`, async ({ page }) => {
        await mockApiCalls(page);
        if (screen.requiresAuth) {
          await setupAuth(page);
        }
        await page.goto(screen.route);
        await page.waitForLoadState('networkidle');

        await saveScreenshot(page, screen.route, SCREENSHOT_DIR);
        const report = await checkPageAssets(page, screen.route);
        allReports.push(report);

        console.log(`\n[${screen.name}] Status: ${report.summary.status}`);
        if (report.missingAssets.length > 0) {
          console.log(`  Missing: ${report.missingAssets.join(', ')}`);
        }
      });
    }
  });

  // Generate final report after all tests
  test.afterAll(async () => {
    if (allReports.length > 0) {
      const fullReport = generateFullReport(allReports);
      saveReportToFile(fullReport, REPORT_PATH);
      printReportSummary(fullReport);
    }
  });
});
