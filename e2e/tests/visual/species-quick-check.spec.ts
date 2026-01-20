import { test, expect } from '@playwright/test';

test('Species page quick screenshot', async ({ page }) => {
  await page.goto('http://localhost:4200/home/species');
  await page.waitForTimeout(2000); // Wait for animations

  // Take screenshot
  await page.screenshot({
    path: 'e2e/screenshots/species-page-check.png',
    fullPage: true
  });

  // Log what we find
  const header = await page.locator('.species-page__header').count();
  const branding = await page.locator('.species-page__branding').count();
  const navigator = await page.locator('app-section-navigator').count();
  const navTitle = await page.locator('.section-navigator__title').count();
  const grid = await page.locator('app-species-grid').count();

  console.log('Elements found:');
  console.log('  Header:', header);
  console.log('  Branding:', branding);
  console.log('  Navigator:', navigator);
  console.log('  Nav Title:', navTitle);
  console.log('  Grid:', grid);

  // Check visibility
  if (navTitle > 0) {
    const titleText = await page.locator('.section-navigator__title').textContent();
    console.log('  Title text:', titleText);
  }

  expect(header).toBe(1);
});
