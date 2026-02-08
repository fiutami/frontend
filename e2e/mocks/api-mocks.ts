import { Page, Route } from '@playwright/test';
import {
  testUsers,
  testTokens,
  testProfile,
  testSettings,
  testSessions,
  testAccountStatus,
  authResponses,
  testSpecies,
  testPets,
  testPetList,
  testPetPhotos,
  testNotifications,
  testQuestionnaireResponse,
} from '../fixtures/test-data';

/**
 * API Mock Handler for Playwright Tests
 * Intercepts API calls and returns mock responses
 */
export class ApiMockHandler {
  private page: Page;
  private apiBaseUrl: string;

  constructor(page: Page, apiBaseUrl: string = 'http://localhost:5000/api') {
    this.page = page;
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Setup all API mocks
   */
  async setupAllMocks(): Promise<void> {
    await this.setupAuthMocks();
    await this.setupProfileMocks();
    await this.setupSettingsMocks();
    await this.setupSessionMocks();
    await this.setupAccountMocks();
    await this.setupPetMocks();
    await this.setupNotificationMocks();
    await this.setupQuestionnaireMocks();
  }

  /**
   * Authentication API mocks
   */
  async setupAuthMocks(): Promise<void> {
    // Login endpoint
    await this.page.route(`${this.apiBaseUrl}/auth/login`, async (route) => {
      const request = route.request();
      const body = request.postDataJSON();

      if (body.email === testUsers.emailUser.email) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(authResponses.loginSuccess),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify(authResponses.loginError),
        });
      }
    });

    // Registration endpoint
    await this.page.route(`${this.apiBaseUrl}/auth/register`, async (route) => {
      const body = route.request().postDataJSON();

      // Check if email already exists
      if (body.email === testUsers.emailUser.email) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Email già registrata' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(authResponses.registrationSuccess),
        });
      }
    });

    // OAuth endpoint
    await this.page.route(`${this.apiBaseUrl}/auth/oauth`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(authResponses.loginSuccess),
      });
    });

    // Refresh token endpoint
    await this.page.route(`${this.apiBaseUrl}/auth/refresh`, async (route) => {
      const body = route.request().postDataJSON();

      if (body.refreshToken === testTokens.validRefreshToken) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(authResponses.loginSuccess),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid refresh token' }),
        });
      }
    });

    // Revoke token endpoint
    await this.page.route(`${this.apiBaseUrl}/auth/revoke`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  }

  /**
   * Profile API mocks
   */
  async setupProfileMocks(): Promise<void> {
    // Get profile
    await this.page.route(`${this.apiBaseUrl}/profile`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testProfile),
        });
      } else if (route.request().method() === 'PUT') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...testProfile, ...body, updatedAt: new Date().toISOString() }),
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Settings API mocks
   */
  async setupSettingsMocks(): Promise<void> {
    // Get settings
    await this.page.route(`${this.apiBaseUrl}/settings`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(testSettings),
      });
    });

    // Update notifications
    await this.page.route(`${this.apiBaseUrl}/settings/notifications`, async (route) => {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...testSettings, ...body }),
      });
    });

    // Update privacy
    await this.page.route(`${this.apiBaseUrl}/settings/privacy`, async (route) => {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...testSettings, ...body }),
      });
    });

    // Update preferences
    await this.page.route(`${this.apiBaseUrl}/settings/preferences`, async (route) => {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...testSettings, ...body }),
      });
    });
  }

  /**
   * Session API mocks
   */
  async setupSessionMocks(): Promise<void> {
    // Get sessions
    await this.page.route(`${this.apiBaseUrl}/session`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(testSessions),
      });
    });

    // Get current session
    await this.page.route(`${this.apiBaseUrl}/session/current`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(testSessions.sessions[0]),
      });
    });

    // Revoke single session
    await this.page.route(`${this.apiBaseUrl}/session/*`, async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Session revoked' }),
        });
      } else {
        await route.continue();
      }
    });

    // Revoke all sessions
    await this.page.route(`${this.apiBaseUrl}/session/all*`, async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'All sessions revoked' }),
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Account API mocks
   */
  async setupAccountMocks(): Promise<void> {
    // Get account status
    await this.page.route(`${this.apiBaseUrl}/account/status`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(testAccountStatus),
      });
    });

    // Change password
    await this.page.route(`${this.apiBaseUrl}/account/change-password`, async (route) => {
      const body = route.request().postDataJSON();

      if (body.currentPassword === 'wrongpassword') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Password attuale non corretta' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Password modificata',
            passwordChangedAt: new Date().toISOString(),
          }),
        });
      }
    });

    // Change email
    await this.page.route(`${this.apiBaseUrl}/account/change-email`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Email di verifica inviata' }),
      });
    });

    // Delete account
    await this.page.route(`${this.apiBaseUrl}/account/delete`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Richiesta eliminazione ricevuta',
          scheduledDeletionAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          deletionRequestId: 'del-req-001',
        }),
      });
    });

    // Export data
    await this.page.route(`${this.apiBaseUrl}/account/export`, async (route) => {
      const exportData = {
        user: testUsers.googleUser,
        profile: testProfile,
        settings: testSettings,
        sessions: testSessions,
        exportedAt: new Date().toISOString(),
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(exportData),
      });
    });
  }

  /**
   * Pet API mocks
   */
  async setupPetMocks(): Promise<void> {
    // Get pet list
    await this.page.route(`${this.apiBaseUrl}/pet`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testPetList),
        });
      } else if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        const newPet = {
          id: `pet-${Date.now()}`,
          ...body,
          userId: testUsers.googleUser.id,
          speciesName: testSpecies.find(s => s.id === body.speciesId)?.name || 'Unknown',
          speciesCategory: testSpecies.find(s => s.id === body.speciesId)?.category || 'unknown',
          calculatedAge: '0 anni',
          profilePhotoUrl: null,
          photoCount: 0,
          status: 'active',
          isNeutered: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newPet),
        });
      } else {
        await route.continue();
      }
    });

    // Get/Update/Delete single pet
    await this.page.route(`${this.apiBaseUrl}/pet/*`, async (route) => {
      const url = route.request().url();
      const petId = url.split('/pet/')[1]?.split('/')[0]?.split('?')[0];
      const method = route.request().method();

      // Handle photo endpoints separately
      if (url.includes('/photos')) {
        await this.handlePetPhotoRoutes(route);
        return;
      }

      if (method === 'GET') {
        const pet = petId === 'pet-001' ? testPets.existingPet :
                    petId === 'pet-002' ? testPets.secondPet : null;
        if (pet) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(pet),
          });
        } else {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Pet non trovato' }),
          });
        }
      } else if (method === 'PUT') {
        const body = route.request().postDataJSON();
        const existingPet = petId === 'pet-001' ? testPets.existingPet : testPets.secondPet;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...existingPet, ...body, updatedAt: new Date().toISOString() }),
        });
      } else if (method === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Pet eliminato' }),
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Handle pet photo routes
   */
  private async handlePetPhotoRoutes(route: Route): Promise<void> {
    const url = route.request().url();
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(testPetPhotos),
      });
    } else if (method === 'POST') {
      const newPhoto = {
        id: `photo-${Date.now()}`,
        petId: 'pet-001',
        url: '/photos/new-photo.jpg',
        thumbnailUrl: '/photos/new-photo-thumb.jpg',
        caption: null,
        isProfilePhoto: false,
        sortOrder: testPetPhotos.length,
        uploadedAt: new Date().toISOString(),
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newPhoto),
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    } else if (method === 'PUT' && url.includes('/primary')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    } else {
      await route.continue();
    }
  }

  /**
   * Notification API mocks
   */
  async setupNotificationMocks(): Promise<void> {
    // Get notifications list
    await this.page.route(`${this.apiBaseUrl}/notification`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testNotifications),
        });
      } else {
        await route.continue();
      }
    });

    // Get unread count
    await this.page.route(`${this.apiBaseUrl}/notification/unread-count`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: testNotifications.unreadCount }),
      });
    });

    // Mark all as read
    await this.page.route(`${this.apiBaseUrl}/notification/mark-all-read`, async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ count: testNotifications.unreadCount }),
        });
      } else {
        await route.continue();
      }
    });

    // Single notification operations
    await this.page.route(`${this.apiBaseUrl}/notification/*`, async (route) => {
      const url = route.request().url();
      const notifId = url.split('/notification/')[1]?.split('/')[0];
      const method = route.request().method();

      if (url.includes('/read') && method === 'PUT') {
        // Mark as read
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else if (method === 'GET') {
        const notification = testNotifications.notifications.find(n => n.id === notifId);
        if (notification) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(notification),
          });
        } else {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Notifica non trovata' }),
          });
        }
      } else if (method === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Questionnaire API mocks
   */
  async setupQuestionnaireMocks(): Promise<void> {
    // Get questionnaire
    await this.page.route(`${this.apiBaseUrl}/questionnaire`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testQuestionnaireResponse),
        });
      } else {
        await route.continue();
      }
    });

    // Get species list
    await this.page.route(`${this.apiBaseUrl}/questionnaire/species`, async (route) => {
      const url = route.request().url();
      const category = new URL(url).searchParams.get('category');

      let species = testSpecies;
      if (category) {
        species = testSpecies.filter(s => s.category === category);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(species),
      });
    });

    // Search species
    await this.page.route(`${this.apiBaseUrl}/questionnaire/species/search*`, async (route) => {
      const url = route.request().url();
      const query = new URL(url).searchParams.get('query')?.toLowerCase() || '';

      const results = testSpecies.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query)
      );

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(results),
      });
    });

    // Get single species
    await this.page.route(`${this.apiBaseUrl}/questionnaire/species/*`, async (route) => {
      const url = route.request().url();
      const speciesId = url.split('/species/')[1]?.split('?')[0];

      const species = testSpecies.find(s => s.id === speciesId);
      if (species) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(species),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Specie non trovata' }),
        });
      }
    });

    // Submit answer
    await this.page.route(`${this.apiBaseUrl}/questionnaire/answer`, async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        const updatedResponse = {
          ...testQuestionnaireResponse,
          [body.QuestionKey]: body.Value,
          updatedAt: new Date().toISOString(),
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(updatedResponse),
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Setup authenticated state in browser
   */
  async setupAuthenticatedState(): Promise<void> {
    const user = testUsers.googleUser;
    const accessToken = testTokens.validAccessToken;
    const refreshToken = testTokens.validRefreshToken;

    await this.page.evaluate(({ user, accessToken, refreshToken }) => {
      localStorage.setItem('fiutami_access_token', accessToken);
      localStorage.setItem('fiutami_refresh_token', refreshToken);
      localStorage.setItem('fiutami_user', JSON.stringify(user));
    }, { user, accessToken, refreshToken });
  }

  /**
   * Clear authenticated state
   */
  async clearAuthenticatedState(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('fiutami_access_token');
      localStorage.removeItem('fiutami_refresh_token');
      localStorage.removeItem('fiutami_user');
    });
  }

  /**
   * Mock network failure
   */
  async mockNetworkFailure(pattern: string | RegExp): Promise<void> {
    await this.page.route(pattern, (route) => route.abort('failed'));
  }

  /**
   * Mock slow response
   */
  async mockSlowResponse(pattern: string | RegExp, delayMs: number = 3000): Promise<void> {
    await this.page.route(pattern, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await route.continue();
    });
  }

  /**
   * Mock rate limiting
   */
  async mockRateLimitResponse(pattern: string | RegExp): Promise<void> {
    await this.page.route(pattern, async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Troppi tentativi. Riprova tra 1 ora.',
        }),
      });
    });
  }
}

/**
 * Helper to create mock handler
 */
export function createApiMocks(page: Page): ApiMockHandler {
  return new ApiMockHandler(page);
}
