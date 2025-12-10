import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Pet Page Object for pet registration and management
 */
export class PetPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ============================================================
  // Species Selection Page Locators
  // ============================================================

  get speciesGrid(): Locator {
    return this.page.locator('[data-testid="species-grid"], .species-grid, .species-container');
  }

  speciesCard(code: string): Locator {
    return this.page.locator(`[data-testid="species-${code}"], [data-species="${code}"]`);
  }

  get speciesSearchInput(): Locator {
    return this.page.locator('[data-testid="species-search"], input[placeholder*="Cerca"]');
  }

  get selectedSpeciesIndicator(): Locator {
    return this.page.locator('[data-testid="selected-species"], .species-selected');
  }

  // ============================================================
  // Pet Details Form Locators
  // ============================================================

  get petNameInput(): Locator {
    return this.page.locator('[data-testid="pet-name"], input[name="petName"], #petName');
  }

  get petSexMale(): Locator {
    return this.page.locator('[data-testid="sex-male"], input[value="male"], label:has-text("Maschio")');
  }

  get petSexFemale(): Locator {
    return this.page.locator('[data-testid="sex-female"], input[value="female"], label:has-text("Femmina")');
  }

  get birthDateInput(): Locator {
    return this.page.locator('[data-testid="birth-date"], input[type="date"], input[name="birthDate"]');
  }

  get originInput(): Locator {
    return this.page.locator('[data-testid="origin"], input[name="origin"]');
  }

  get colorInput(): Locator {
    return this.page.locator('[data-testid="color"], input[name="color"]');
  }

  get weightInput(): Locator {
    return this.page.locator('[data-testid="weight"], input[name="weight"]');
  }

  get microchipInput(): Locator {
    return this.page.locator('[data-testid="microchip"], input[name="microchipNumber"]');
  }

  get specialMarksInput(): Locator {
    return this.page.locator('[data-testid="special-marks"], textarea[name="specialMarks"]');
  }

  get submitButton(): Locator {
    return this.page.locator('[data-testid="submit-pet"], button[type="submit"], button:has-text("Salva")');
  }

  get backButton(): Locator {
    return this.page.locator('[data-testid="back-button"], button:has-text("Indietro")');
  }

  // ============================================================
  // Pet List/Card Locators
  // ============================================================

  get petList(): Locator {
    return this.page.locator('[data-testid="pet-list"], .pet-list, .pets-container');
  }

  petCard(id: string): Locator {
    return this.page.locator(`[data-testid="pet-card-${id}"], [data-pet-id="${id}"]`);
  }

  get allPetCards(): Locator {
    return this.page.locator('[data-testid^="pet-card-"], .pet-card');
  }

  get addPetButton(): Locator {
    return this.page.locator('[data-testid="add-pet"], button:has-text("Aggiungi")');
  }

  // ============================================================
  // Error/Validation Locators
  // ============================================================

  get formErrorMessage(): Locator {
    return this.page.locator('[data-testid="error-message"], .error-message, .form-error');
  }

  get fieldValidationErrors(): Locator {
    return this.page.locator('.field-error, .validation-error, [class*="error"]');
  }

  // ============================================================
  // Actions
  // ============================================================

  /**
   * Navigate to species selection page
   */
  async gotoSpeciesSelection(): Promise<void> {
    await this.goto('/home/pet-register/specie');
    await this.waitForLoadingToFinish();
  }

  /**
   * Navigate to pet details form
   */
  async gotoPetDetails(): Promise<void> {
    await this.goto('/home/pet-register/details');
    await this.waitForLoadingToFinish();
  }

  /**
   * Navigate to pet list
   */
  async gotoPetList(): Promise<void> {
    await this.goto('/home/pets');
    await this.waitForLoadingToFinish();
  }

  /**
   * Select a species by code
   */
  async selectSpecies(speciesCode: string): Promise<void> {
    await this.speciesCard(speciesCode).click();
    // Wait for navigation to details page
    await this.page.waitForURL(/pet-register\/details|pet-register\/form/);
  }

  /**
   * Search for a species
   */
  async searchSpecies(query: string): Promise<void> {
    await this.speciesSearchInput.fill(query);
    // Wait for filtered results
    await this.page.waitForTimeout(300);
  }

  /**
   * Fill pet details form
   */
  async fillPetDetails(data: {
    name: string;
    sex: 'male' | 'female';
    birthDate?: string;
    origin?: string;
    color?: string;
    weight?: string;
    microchip?: string;
    specialMarks?: string;
  }): Promise<void> {
    await this.petNameInput.fill(data.name);

    if (data.sex === 'male') {
      await this.petSexMale.click();
    } else {
      await this.petSexFemale.click();
    }

    if (data.birthDate) {
      await this.birthDateInput.fill(data.birthDate);
    }

    if (data.origin) {
      await this.originInput.fill(data.origin);
    }

    if (data.color) {
      await this.colorInput.fill(data.color);
    }

    if (data.weight) {
      await this.weightInput.fill(data.weight);
    }

    if (data.microchip) {
      await this.microchipInput.fill(data.microchip);
    }

    if (data.specialMarks) {
      await this.specialMarksInput.fill(data.specialMarks);
    }
  }

  /**
   * Submit pet registration form
   */
  async submitPetForm(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Complete full pet registration flow
   */
  async registerPet(
    speciesCode: string,
    petData: {
      name: string;
      sex: 'male' | 'female';
      birthDate?: string;
      origin?: string;
      color?: string;
    }
  ): Promise<void> {
    await this.gotoSpeciesSelection();
    await this.selectSpecies(speciesCode);
    await this.fillPetDetails(petData);
    await this.submitPetForm();
  }

  /**
   * Go back to previous step
   */
  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /**
   * Assert pet is visible in the list
   */
  async expectPetVisible(petId: string): Promise<void> {
    await expect(this.petCard(petId)).toBeVisible();
  }

  /**
   * Assert pet count
   */
  async expectPetCount(count: number): Promise<void> {
    await expect(this.allPetCards).toHaveCount(count);
  }

  /**
   * Assert species is selected
   */
  async expectSpeciesSelected(speciesCode: string): Promise<void> {
    await expect(this.speciesCard(speciesCode)).toHaveClass(/selected|active/);
  }

  /**
   * Assert form error is displayed
   */
  async expectFormError(message?: string): Promise<void> {
    await expect(this.formErrorMessage).toBeVisible();
    if (message) {
      await expect(this.formErrorMessage).toContainText(message);
    }
  }

  /**
   * Assert we are on species selection page
   */
  async expectOnSpeciesPage(): Promise<void> {
    await expect(this.page).toHaveURL(/pet-register\/specie/);
    await expect(this.speciesGrid).toBeVisible();
  }

  /**
   * Assert we are on pet details page
   */
  async expectOnDetailsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/pet-register\/details|pet-register\/form/);
    await expect(this.petNameInput).toBeVisible();
  }

  /**
   * Assert we are on documents page (after pet creation)
   */
  async expectOnDocsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/pet-register\/docs|pet\/.*\/documents/);
  }
}
