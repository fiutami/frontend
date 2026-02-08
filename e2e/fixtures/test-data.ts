/**
 * Test data and fixtures for E2E tests
 */

export const testUsers = {
  // Valid Google OAuth user
  googleUser: {
    id: 'test-user-google-001',
    email: 'test.user@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    provider: 'google',
    createdAt: '2024-01-15T10:30:00Z',
  },

  // Valid email/password user
  emailUser: {
    id: 'test-user-email-001',
    email: 'user@fiutami.test',
    firstName: 'Mario',
    lastName: 'Rossi',
    provider: 'email',
    createdAt: '2024-06-20T14:00:00Z',
  },

  // New user for registration tests
  newUser: {
    email: 'new.user@fiutami.test',
    password: 'SecurePass123!',
    firstName: 'Nuovo',
    lastName: 'Utente',
  },

  // Invalid credentials
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
};

export const testTokens = {
  validAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItZ29vZ2xlLTAwMSIsImVtYWlsIjoidGVzdC51c2VyQGdtYWlsLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.mock-signature',
  validRefreshToken: 'mock-refresh-token-valid',
  expiredAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJleHAiOjF9.expired-signature',
};

export const testProfile = {
  id: 'profile-001',
  userId: 'test-user-google-001',
  displayName: 'Test User',
  avatarUrl: '',
  bio: 'Test user bio for E2E testing',
  phoneNumber: '+39 123 456 7890',
  address: 'Via Roma 1',
  city: 'Milano',
  country: 'Italia',
  dateOfBirth: '1990-05-15',
  updatedAt: '2024-11-01T10:00:00Z',
};

export const testSettings = {
  id: 'settings-001',
  emailNotifications: true,
  pushNotifications: false,
  marketingEmails: false,
  weeklyDigest: true,
  profilePublic: false,
  showEmail: false,
  showPhone: false,
  allowSearchByEmail: true,
  language: 'it',
  timezone: 'Europe/Rome',
  theme: 'light',
  updatedAt: '2024-11-01T10:00:00Z',
};

export const testSessions = {
  sessions: [
    {
      id: 'session-001',
      deviceType: 'desktop',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      deviceName: 'Desktop PC',
      city: 'Milano',
      country: 'Italia',
      createdAt: '2024-11-30T08:00:00Z',
      lastActivityAt: '2024-11-30T10:30:00Z',
      isCurrent: true,
    },
    {
      id: 'session-002',
      deviceType: 'mobile',
      browser: 'Safari 17',
      operatingSystem: 'iOS 17',
      deviceName: 'iPhone 15',
      city: 'Roma',
      country: 'Italia',
      createdAt: '2024-11-28T15:00:00Z',
      lastActivityAt: '2024-11-29T09:00:00Z',
      isCurrent: false,
    },
  ],
  totalCount: 2,
};

export const testAccountStatus = {
  isDeleted: false,
  isEmailVerified: true,
  hasPassword: false,
  hasPendingEmailChange: false,
  pendingEmail: null,
  hasPendingDeletion: false,
  scheduledDeletionAt: null,
  lastPasswordChangeAt: null,
  activeSessionsCount: 2,
};

export const authResponses = {
  loginSuccess: {
    userId: testUsers.googleUser.id,
    email: testUsers.googleUser.email,
    firstName: testUsers.googleUser.firstName,
    lastName: testUsers.googleUser.lastName,
    accessToken: testTokens.validAccessToken,
    refreshToken: testTokens.validRefreshToken,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  },

  loginError: {
    error: 'Invalid credentials',
    message: 'Email o password non validi',
  },

  registrationSuccess: {
    userId: 'new-user-001',
    email: testUsers.newUser.email,
    firstName: testUsers.newUser.firstName,
    lastName: testUsers.newUser.lastName,
    accessToken: testTokens.validAccessToken,
    refreshToken: testTokens.validRefreshToken,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  },
};

// ============================================================
// Pet Test Data
// ============================================================

export const testSpecies = [
  {
    id: 'species-001',
    code: 'CAT',
    name: 'Gatto',
    category: 'mammifero',
    description: 'Gatto domestico',
    iconUrl: '/assets/species/cat.svg',
  },
  {
    id: 'species-002',
    code: 'DOG',
    name: 'Cane',
    category: 'mammifero',
    description: 'Cane domestico',
    iconUrl: '/assets/species/dog.svg',
  },
  {
    id: 'species-003',
    code: 'RABBIT',
    name: 'Coniglio',
    category: 'mammifero',
    description: 'Coniglio domestico',
    iconUrl: '/assets/species/rabbit.svg',
  },
  {
    id: 'species-004',
    code: 'BIRD',
    name: 'Uccello',
    category: 'volatile',
    description: 'Uccelli domestici',
    iconUrl: '/assets/species/bird.svg',
  },
];

export const testPets = {
  existingPet: {
    id: 'pet-001',
    userId: 'test-user-google-001',
    speciesId: 'species-001',
    speciesName: 'Gatto',
    speciesCategory: 'mammifero',
    name: 'Luna',
    sex: 'female',
    birthDate: '2022-03-15',
    calculatedAge: '2 anni',
    profilePhotoUrl: '/photos/luna.jpg',
    photoCount: 3,
    status: 'active',
    isNeutered: true,
    microchip: '941000012345678',
    color: 'Bianco e nero',
    weight: 4.5,
    notes: 'Adora giocare con i topi di peluche',
    createdAt: '2022-04-01T10:00:00Z',
    updatedAt: '2024-11-15T14:30:00Z',
  },
  secondPet: {
    id: 'pet-002',
    userId: 'test-user-google-001',
    speciesId: 'species-002',
    speciesName: 'Cane',
    speciesCategory: 'mammifero',
    name: 'Max',
    sex: 'male',
    birthDate: '2021-07-20',
    calculatedAge: '3 anni',
    profilePhotoUrl: '/photos/max.jpg',
    photoCount: 5,
    status: 'active',
    isNeutered: false,
    microchip: '941000098765432',
    color: 'Marrone',
    weight: 25.0,
    notes: null,
    createdAt: '2021-08-15T09:00:00Z',
    updatedAt: '2024-10-20T11:00:00Z',
  },
  newPet: {
    speciesId: 'species-001',
    name: 'Micio',
    sex: 'male',
    birthDate: '2024-01-10',
    origin: 'Gattile comunale',
    color: 'Grigio tigrato',
    weight: 3.2,
    specialMarks: 'Occhi verdi',
    microchipNumber: '941000011112222',
  },
};

export const testPetList = {
  pets: [
    {
      id: 'pet-001',
      name: 'Luna',
      speciesName: 'Gatto',
      profilePhotoUrl: '/photos/luna.jpg',
      calculatedAge: '2 anni',
    },
    {
      id: 'pet-002',
      name: 'Max',
      speciesName: 'Cane',
      profilePhotoUrl: '/photos/max.jpg',
      calculatedAge: '3 anni',
    },
  ],
  totalCount: 2,
};

export const testPetPhotos = [
  {
    id: 'photo-001',
    petId: 'pet-001',
    url: '/photos/luna-1.jpg',
    thumbnailUrl: '/photos/luna-1-thumb.jpg',
    caption: 'Luna che dorme',
    isProfilePhoto: true,
    sortOrder: 0,
    uploadedAt: '2024-06-15T10:00:00Z',
  },
  {
    id: 'photo-002',
    petId: 'pet-001',
    url: '/photos/luna-2.jpg',
    thumbnailUrl: '/photos/luna-2-thumb.jpg',
    caption: 'Luna che gioca',
    isProfilePhoto: false,
    sortOrder: 1,
    uploadedAt: '2024-07-20T14:30:00Z',
  },
];

// ============================================================
// Notification Test Data
// ============================================================

export const testNotifications = {
  notifications: [
    {
      id: 'notif-001',
      type: 'system',
      title: 'Benvenuto su Fiutami!',
      message: 'Grazie per esserti registrato. Inizia aggiungendo il tuo primo pet.',
      actionUrl: '/home/pet-register/specie',
      imageUrl: null,
      isRead: false,
      readAt: null,
      createdAt: '2024-11-30T10:00:00Z',
    },
    {
      id: 'notif-002',
      type: 'reminder',
      title: 'Promemoria vaccinazione',
      message: 'Luna ha una vaccinazione programmata per domani.',
      actionUrl: '/home/pets/pet-001/health',
      imageUrl: '/photos/luna.jpg',
      isRead: false,
      readAt: null,
      createdAt: '2024-11-29T08:00:00Z',
    },
    {
      id: 'notif-003',
      type: 'info',
      title: 'Aggiornamento profilo',
      message: 'Completa il profilo di Max per ricevere consigli personalizzati.',
      actionUrl: '/home/pets/pet-002',
      imageUrl: '/photos/max.jpg',
      isRead: true,
      readAt: '2024-11-28T15:30:00Z',
      createdAt: '2024-11-28T09:00:00Z',
    },
  ],
  totalCount: 3,
  unreadCount: 2,
};

export const testQuestionnaireResponse = {
  id: 'questionnaire-001',
  userId: 'test-user-google-001',
  status: 'in_progress',
  Q1_Time: 'molto',
  Q2_Space: null,
  Q3_Budget: null,
  Q4_Experience: null,
  completedAt: null,
  createdAt: '2024-11-30T10:00:00Z',
  updatedAt: '2024-11-30T10:30:00Z',
};

// ARIA labels for accessibility testing
export const ariaLabels = {
  loginForm: 'Login form',
  emailInput: 'Email',
  passwordInput: 'Password',
  loginButton: 'Accedi',
  googleLoginButton: 'Accedi con Google',
  logoutButton: 'Esci',
  sidebarNavigation: 'Navigazione utente',
  menuButton: 'Menu',
};

// Test timeouts
export const timeouts = {
  animation: 500,
  apiCall: 5000,
  pageLoad: 10000,
  oauthPopup: 30000,
};
