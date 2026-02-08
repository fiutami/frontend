/**
 * Questionnaire E2E Test Fixtures
 *
 * Provides mock data and helpers for testing the questionnaire flow.
 */

import { test as base, Page } from '@playwright/test';

/**
 * Mock breed data for matching results
 */
export const MOCK_BREEDS = [
  {
    id: 'dog-labrador',
    name: 'Labrador Retriever',
    species: 'dog',
    description: 'Cane amichevole, energico, ottimo con bambini.',
    imageUrl: '/assets/breeds/dog-labrador.jpg',
    attributes: {
      size: 'large',
      energyLevel: 'high',
      groomingNeeds: 'medium',
      trainability: 'high',
      goodWithChildren: true,
      goodWithOtherPets: true,
      apartmentFriendly: false,
      exerciseNeeds: 'high'
    }
  },
  {
    id: 'dog-cavalier',
    name: 'Cavalier King Charles Spaniel',
    species: 'dog',
    description: 'Cane affettuoso, tranquillo, perfetto per appartamento.',
    imageUrl: '/assets/breeds/dog-cavalier.jpg',
    attributes: {
      size: 'small',
      energyLevel: 'low',
      groomingNeeds: 'medium',
      trainability: 'high',
      goodWithChildren: true,
      goodWithOtherPets: true,
      apartmentFriendly: true,
      exerciseNeeds: 'low'
    }
  },
  {
    id: 'cat-europeo',
    name: 'Gatto Europeo',
    species: 'cat',
    description: 'Gatto indipendente, robusto, adatto a qualsiasi ambiente.',
    imageUrl: '/assets/breeds/cat-europeo.jpg',
    attributes: {
      size: 'medium',
      energyLevel: 'medium',
      groomingNeeds: 'low',
      goodWithChildren: true,
      goodWithOtherPets: true,
      apartmentFriendly: true
    }
  }
];

/**
 * Extended test fixture with questionnaire helpers
 */
export const test = base.extend<{
  questionnairePage: Page;
}>({
  questionnairePage: async ({ page }, use) => {
    // Setup API mocks
    await page.route('**/api/questionnaire/events', route => {
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.route('**/api/catalogs/breeds**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_BREEDS)
      });
    });

    // Clear localStorage before each test
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await use(page);
  }
});

export { expect } from '@playwright/test';

/**
 * Helper class for interacting with questionnaire UI
 */
export class QuestionnairePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/onboarding/questionnaire');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForQuestion() {
    await this.page.waitForSelector('[data-testid="question-text"]', {
      state: 'visible',
      timeout: 10000
    });
  }

  async getQuestionText() {
    return this.page.textContent('[data-testid="question-text"]');
  }

  async getQuestionId() {
    const element = await this.page.$('[data-testid="question-container"]');
    return element?.getAttribute('data-question-id');
  }

  async selectOption(optionIndex: number) {
    const options = this.page.locator('[data-testid="option-card"]');
    await options.nth(optionIndex).click();
  }

  async selectOptionByText(text: string) {
    await this.page.locator('[data-testid="option-card"]', { hasText: text }).click();
  }

  async goBack() {
    await this.page.click('[data-testid="back-button"]');
  }

  async canGoBack() {
    const backButton = this.page.locator('[data-testid="back-button"]');
    return backButton.isEnabled();
  }

  async getProgress() {
    const progressBar = this.page.locator('[data-testid="progress-bar"]');
    const widthStyle = await progressBar.getAttribute('style');
    const match = widthStyle?.match(/width:\s*(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  async isComplete() {
    return this.page.locator('[data-testid="results-container"]').isVisible();
  }

  async getTopResults() {
    const results = this.page.locator('[data-testid="breed-result"]');
    const count = await results.count();
    const items = [];
    for (let i = 0; i < count; i++) {
      const name = await results.nth(i).locator('[data-testid="breed-name"]').textContent();
      items.push(name);
    }
    return items;
  }

  async openFiutoChat() {
    await this.page.click('[data-testid="fiuto-chat-button"]');
    await this.page.waitForSelector('[data-testid="fiuto-chat-modal"]', { state: 'visible' });
  }

  async closeFiutoChat() {
    await this.page.click('[data-testid="fiuto-chat-close"]');
    await this.page.waitForSelector('[data-testid="fiuto-chat-modal"]', { state: 'hidden' });
  }

  async sendFiutoMessage(message: string) {
    await this.page.fill('[data-testid="fiuto-chat-input"]', message);
    await this.page.click('[data-testid="fiuto-chat-send"]');
  }
}
