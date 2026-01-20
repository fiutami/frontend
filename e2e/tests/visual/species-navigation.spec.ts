import { test, expect } from '@playwright/test';

test('Species navigation test', async ({ page }) => {
  await page.goto('http://localhost:4200/home/species');
  await page.waitForTimeout(1500);

  // Screenshot iniziale
  await page.screenshot({ path: 'e2e/screenshots/species-nav-1-initial.png', fullPage: true });

  // Verifica titolo iniziale
  const title = page.locator('.section-navigator__title');
  await expect(title).toHaveText('Specie');

  // Verifica che prev sia disabilitato
  const prevBtn = page.locator('.section-navigator__btn--prev');
  const nextBtn = page.locator('.section-navigator__btn--next');

  await expect(prevBtn).toBeDisabled();
  await expect(nextBtn).toBeEnabled();

  console.log('Step 1: Initial state OK - Specie');

  // Click next con force per bypassare l'overlay
  await nextBtn.click({ force: true });
  await page.waitForTimeout(500);

  await expect(title).toHaveText('Specie speciale');
  await page.screenshot({ path: 'e2e/screenshots/species-nav-2-special.png', fullPage: true });
  console.log('Step 2: Navigated to Specie speciale');

  // Click next again
  await nextBtn.click({ force: true });
  await page.waitForTimeout(500);

  await expect(title).toHaveText('La tua razza');
  await expect(nextBtn).toBeDisabled();
  await page.screenshot({ path: 'e2e/screenshots/species-nav-3-your-breed.png', fullPage: true });
  console.log('Step 3: Navigated to La tua razza');

  // Go back
  await prevBtn.click({ force: true });
  await page.waitForTimeout(500);
  await expect(title).toHaveText('Specie speciale');
  console.log('Step 4: Back to Specie speciale');

  console.log('All navigation tests passed!');
});
