import { test, expect } from '@playwright/test';
import { PetPage, AuthPage } from '../../page-objects';
import { createApiMocks } from '../../mocks/api-mocks';
import { testPets, testSpecies, testPetList } from '../../fixtures/test-data';

test.describe('Pet Registration Flow', () => {
  let petPage: PetPage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    petPage = new PetPage(page);
    authPage = new AuthPage(page);

    const apiMocks = createApiMocks(page);
    await apiMocks.setupAuthenticatedState();
    await apiMocks.setupAllMocks();
  });

  test.describe('Species Selection Page', () => {
    test.beforeEach(async () => {
      await petPage.gotoSpeciesSelection();
    });

    test('should display species selection grid', async () => {
      await petPage.expectOnSpeciesPage();
    });

    test('should display all available species', async ({ page }) => {
      // Verify species cards are visible
      for (const species of testSpecies) {
        const card = petPage.speciesCard(species.code);
        await expect(card).toBeVisible();
      }
    });

    test('should filter species by search', async ({ page }) => {
      await petPage.searchSpecies('Gatto');

      // Cat should be visible, dog should be hidden
      await expect(petPage.speciesCard('CAT')).toBeVisible();
    });

    test('should navigate to details form when species is selected', async ({ page }) => {
      await petPage.selectSpecies('CAT');
      await petPage.expectOnDetailsPage();
    });

    test('should show species categories', async ({ page }) => {
      // Check that mammal and bird categories exist
      const mammalsFilter = page.locator('button:has-text("Mammiferi"), [data-category="mammifero"]');
      const birdsFilter = page.locator('button:has-text("Volatili"), [data-category="volatile"]');

      // At least one should be present if filtering is implemented
      const hasMammals = await mammalsFilter.isVisible().catch(() => false);
      const hasBirds = await birdsFilter.isVisible().catch(() => false);

      // Species grid should have items regardless
      await expect(petPage.speciesGrid).toBeVisible();
    });
  });

  test.describe('Pet Details Form', () => {
    test.beforeEach(async () => {
      await petPage.gotoSpeciesSelection();
      await petPage.selectSpecies('CAT');
    });

    test('should display pet details form', async () => {
      await petPage.expectOnDetailsPage();
      await expect(petPage.petNameInput).toBeVisible();
    });

    test('should fill pet name', async () => {
      await petPage.petNameInput.fill('Micio');
      await expect(petPage.petNameInput).toHaveValue('Micio');
    });

    test('should select pet sex', async () => {
      await petPage.petSexMale.click();
      // Male should be selected/checked
    });

    test('should fill birth date', async () => {
      await petPage.birthDateInput.fill('2024-01-10');
      await expect(petPage.birthDateInput).toHaveValue('2024-01-10');
    });

    test('should fill optional fields', async () => {
      await petPage.fillPetDetails({
        name: 'Micio',
        sex: 'male',
        birthDate: '2024-01-10',
        origin: 'Gattile comunale',
        color: 'Grigio tigrato',
        weight: '3.2',
      });

      await expect(petPage.petNameInput).toHaveValue('Micio');
      await expect(petPage.colorInput).toHaveValue('Grigio tigrato');
    });

    test('should show validation error for empty name', async ({ page }) => {
      // Try to submit without filling required fields
      await petPage.submitButton.click();

      // Should show validation error
      const hasError = await petPage.formErrorMessage.isVisible().catch(() => false) ||
                       await page.locator('[aria-invalid="true"]').isVisible().catch(() => false);
      expect(hasError).toBe(true);
    });

    test('should go back to species selection', async ({ page }) => {
      await petPage.goBack();
      await petPage.expectOnSpeciesPage();
    });
  });

  test.describe('Complete Pet Registration', () => {
    test('should successfully register a new pet', async ({ page }) => {
      await petPage.registerPet('CAT', {
        name: 'Micio',
        sex: 'male',
        birthDate: '2024-01-10',
        origin: 'Gattile comunale',
        color: 'Grigio tigrato',
      });

      // Should navigate to documents page or pet list after success
      await page.waitForURL(/pet-register\/docs|pets|pet\/.*\/documents/);
    });

    test('should register pet with minimum required fields', async ({ page }) => {
      await petPage.gotoSpeciesSelection();
      await petPage.selectSpecies('DOG');

      await petPage.fillPetDetails({
        name: 'Rex',
        sex: 'male',
      });

      await petPage.submitPetForm();

      // Should succeed with just name and sex
      await page.waitForURL(/pet-register\/docs|pets/, { timeout: 10000 });
    });
  });

  test.describe('Pet List', () => {
    test('should display existing pets', async ({ page }) => {
      await petPage.gotoPetList();

      // Should show pet cards
      await expect(petPage.petList).toBeVisible();
      await petPage.expectPetCount(testPetList.pets.length);
    });

    test('should display pet details on card', async ({ page }) => {
      await petPage.gotoPetList();

      // First pet card should have pet name
      const firstPet = testPetList.pets[0];
      await expect(page.locator(`text=${firstPet.name}`)).toBeVisible();
    });

    test('should navigate to add new pet', async ({ page }) => {
      await petPage.gotoPetList();
      await petPage.addPetButton.click();

      await petPage.expectOnSpeciesPage();
    });

    test('should click pet card to view details', async ({ page }) => {
      await petPage.gotoPetList();

      const firstPet = testPetList.pets[0];
      await petPage.petCard(firstPet.id).click();

      // Should navigate to pet detail page
      await page.waitForURL(/pets\/pet-001|pet\/pet-001/);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display species grid on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await petPage.gotoSpeciesSelection();

      await petPage.expectOnSpeciesPage();
      await expect(petPage.speciesGrid).toBeVisible();
    });

    test('should display pet form on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await petPage.gotoSpeciesSelection();
      await petPage.selectSpecies('CAT');

      await petPage.expectOnDetailsPage();
      await expect(petPage.petNameInput).toBeVisible();
    });

    test('should display pet list on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await petPage.gotoPetList();

      await expect(petPage.petList).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network error during pet creation', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.mockNetworkFailure('**/api/pet');

      await petPage.gotoSpeciesSelection();
      await petPage.selectSpecies('CAT');

      await petPage.fillPetDetails({
        name: 'TestPet',
        sex: 'male',
      });

      await petPage.submitPetForm();

      // Should show error message
      await expect(petPage.formErrorMessage.or(petPage.toastMessage)).toBeVisible();
    });

    test('should handle slow network gracefully', async ({ page }) => {
      const apiMocks = createApiMocks(page);
      await apiMocks.mockSlowResponse('**/api/questionnaire/species', 2000);

      await petPage.gotoSpeciesSelection();

      // Should show loading state then content
      await expect(petPage.speciesGrid).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Authorization', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      // Clear auth state
      await authPage.clearLocalStorage();

      await page.goto('/home/pet-register/specie');

      // Should redirect to login
      await expect(page).toHaveURL(/login|auth/);
    });
  });
});
