import { FullConfig } from '@playwright/test';

/**
 * Global setup for E2E tests
 * This runs once before all tests when not in mock mode
 */
async function globalSetup(_config: FullConfig): Promise<void> {
  // Add any global setup logic here
  // For example: authenticate, setup database state, etc.
  console.log('Running global setup...');

  // Set environment variables if needed
  process.env['TEST_STARTED'] = new Date().toISOString();
}

export default globalSetup;
