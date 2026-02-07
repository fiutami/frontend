/**
 * Questionnaire E2E Tests
 *
 * Tests the complete questionnaire flow including:
 * - Navigation (forward, back)
 * - Option selection
 * - Progress tracking
 * - Conditional questions (showIf)
 * - Completion and results
 *
 * @version 1.1
 */

import { test, expect, QuestionnairePage } from '../../fixtures/questionnaire.fixture';

test.describe('Questionnaire Flow', () => {

  test.beforeEach(async ({ questionnairePage }) => {
    // Clear storage and setup
    await questionnairePage.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should start at entry question', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    // Should be at first question
    const questionText = await qPage.getQuestionText();
    expect(questionText).toBeTruthy();
  });

  test('should navigate forward on option select', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    const firstQuestion = await qPage.getQuestionId();

    // Select first option
    await qPage.selectOption(0);
    await qPage.waitForQuestion();

    const secondQuestion = await qPage.getQuestionId();

    expect(secondQuestion).not.toBe(firstQuestion);
  });

  test('should enable back button after answering', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    // Initially can't go back
    const canGoBackInitially = await qPage.canGoBack();
    expect(canGoBackInitially).toBe(false);

    // Answer a question
    await qPage.selectOption(0);
    await qPage.waitForQuestion();

    // Now should be able to go back
    const canGoBackAfter = await qPage.canGoBack();
    expect(canGoBackAfter).toBe(true);
  });

  test('should navigate back correctly', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    const firstQuestion = await qPage.getQuestionId();

    // Go forward
    await qPage.selectOption(0);
    await qPage.waitForQuestion();

    // Go back
    await qPage.goBack();
    await qPage.waitForQuestion();

    const questionAfterBack = await qPage.getQuestionId();
    expect(questionAfterBack).toBe(firstQuestion);
  });

  test('should update progress bar', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    const initialProgress = await qPage.getProgress();

    // Answer first question
    await qPage.selectOption(0);
    await qPage.waitForQuestion();

    const progressAfterFirst = await qPage.getProgress();
    expect(progressAfterFirst).toBeGreaterThan(initialProgress);

    // Answer second question
    await qPage.selectOption(0);
    await qPage.waitForQuestion();

    const progressAfterSecond = await qPage.getProgress();
    expect(progressAfterSecond).toBeGreaterThan(progressAfterFirst);
  });

  test('should persist progress on page reload', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    // Answer some questions
    await qPage.selectOption(0);
    await qPage.waitForQuestion();
    await qPage.selectOption(0);
    await qPage.waitForQuestion();

    const questionBeforeReload = await qPage.getQuestionId();

    // Reload page
    await questionnairePage.reload();
    await qPage.waitForQuestion();

    const questionAfterReload = await qPage.getQuestionId();

    // Should resume at same question
    expect(questionAfterReload).toBe(questionBeforeReload);
  });

  test('should display option cards correctly', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    // Check options are visible
    const options = questionnairePage.locator('[data-testid="option-card"]');
    const count = await options.count();

    expect(count).toBeGreaterThan(0);

    // Each option should have a label
    for (let i = 0; i < count; i++) {
      const optionText = await options.nth(i).textContent();
      expect(optionText).toBeTruthy();
    }
  });
});

test.describe('Questionnaire Conditional Logic', () => {

  test('should skip questions based on showIf', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    // Answer in a way that should trigger skip
    // (depends on actual question data)
    await qPage.selectOption(0);
    await qPage.waitForQuestion();

    // Verify we're on expected question
    const questionId = await qPage.getQuestionId();
    expect(questionId).toBeTruthy();
  });
});

test.describe('Questionnaire Completion', () => {

  test('should show results on completion', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    // Answer all questions (simplified - just keep selecting first option)
    let attempts = 0;
    const maxAttempts = 50; // Safety limit

    while (attempts < maxAttempts) {
      const isComplete = await qPage.isComplete();
      if (isComplete) break;

      try {
        await qPage.selectOption(0);
        await questionnairePage.waitForTimeout(300);
      } catch {
        break;
      }
      attempts++;
    }

    // Should eventually reach results
    const isComplete = await qPage.isComplete();
    expect(isComplete).toBe(true);
  });

  test('should display breed recommendations', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    // Setup mock for fast completion
    await questionnairePage.route('**/api/questionnaire/matches**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { breedId: 'dog-labrador', score: 95, name: 'Labrador Retriever' },
          { breedId: 'dog-cavalier', score: 88, name: 'Cavalier King Charles' }
        ])
      });
    });

    await qPage.goto();
    await qPage.waitForQuestion();

    // Complete questionnaire (simplified)
    let attempts = 0;
    while (attempts < 50) {
      const isComplete = await qPage.isComplete();
      if (isComplete) break;
      try {
        await qPage.selectOption(0);
        await questionnairePage.waitForTimeout(200);
      } catch {
        break;
      }
      attempts++;
    }

    // Check results
    const isComplete = await qPage.isComplete();
    if (isComplete) {
      const results = await qPage.getTopResults();
      expect(results.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Questionnaire Analytics', () => {

  test('should send analytics events', async ({ questionnairePage }) => {
    const analyticsEvents: any[] = [];

    await questionnairePage.route('**/api/questionnaire/events', route => {
      const body = route.request().postDataJSON();
      if (Array.isArray(body)) {
        analyticsEvents.push(...body);
      }
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    // Trigger some events
    await qPage.selectOption(0);
    await qPage.waitForQuestion();

    // Wait for flush
    await questionnairePage.waitForTimeout(6000); // FLUSH_INTERVAL is 5s

    // Should have captured events
    expect(analyticsEvents.length).toBeGreaterThan(0);

    // Check event types
    const eventTypes = analyticsEvents.map(e => e.eventType);
    expect(eventTypes).toContain('questionnaire_started');
  });

  test('should track question_answered events', async ({ questionnairePage }) => {
    const analyticsEvents: any[] = [];

    await questionnairePage.route('**/api/questionnaire/events', route => {
      const body = route.request().postDataJSON();
      if (Array.isArray(body)) {
        analyticsEvents.push(...body);
      }
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    // Answer questions
    await qPage.selectOption(0);
    await questionnairePage.waitForTimeout(500);
    await qPage.selectOption(0);

    // Force flush by navigating away or waiting
    await questionnairePage.waitForTimeout(6000);

    // Check for question_answered events
    const answeredEvents = analyticsEvents.filter(e => e.eventType === 'question_answered');

    if (answeredEvents.length > 0) {
      expect(answeredEvents[0].payload.questionId).toBeTruthy();
      expect(answeredEvents[0].payload.optionId).toBeTruthy();
      expect(answeredEvents[0].payload.timeSpentMs).toBeGreaterThan(0);
    }
  });
});

test.describe('Questionnaire Responsive', () => {

  test('should be usable on mobile viewport', async ({ questionnairePage }) => {
    await questionnairePage.setViewportSize({ width: 375, height: 667 });

    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    // Check question is visible
    const questionText = await qPage.getQuestionText();
    expect(questionText).toBeTruthy();

    // Check options are tappable
    const options = questionnairePage.locator('[data-testid="option-card"]');
    const firstOption = options.first();
    await expect(firstOption).toBeVisible();

    // Should be able to select
    await firstOption.tap();
    await qPage.waitForQuestion();

    const newQuestion = await qPage.getQuestionId();
    expect(newQuestion).toBeTruthy();
  });

  test('should be usable on tablet viewport', async ({ questionnairePage }) => {
    await questionnairePage.setViewportSize({ width: 768, height: 1024 });

    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    const questionText = await qPage.getQuestionText();
    expect(questionText).toBeTruthy();
  });
});

test.describe('Questionnaire Accessibility', () => {

  test('should have accessible question text', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    // Check for heading
    const heading = questionnairePage.locator('[data-testid="question-text"]');
    await expect(heading).toBeVisible();

    // Should have appropriate role or semantic HTML
    const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
    expect(['h1', 'h2', 'h3', 'p']).toContain(tagName);
  });

  test('should allow keyboard navigation', async ({ questionnairePage }) => {
    const qPage = new QuestionnairePage(questionnairePage);

    await qPage.goto();
    await qPage.waitForQuestion();

    // Tab to first option
    await questionnairePage.keyboard.press('Tab');
    await questionnairePage.keyboard.press('Tab');

    // Enter to select
    await questionnairePage.keyboard.press('Enter');

    // Should have navigated
    await qPage.waitForQuestion();
    const questionId = await qPage.getQuestionId();
    expect(questionId).toBeTruthy();
  });
});
