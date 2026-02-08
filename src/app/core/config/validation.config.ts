/**
 * Centralized validation rules for forms
 * Change these values to update validation across the entire app
 */

export const VALIDATION = {
  // Password rules
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBER: false,
    REQUIRE_SPECIAL: false,
  },

  // Email rules
  EMAIL: {
    MAX_LENGTH: 254,
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },

  // Name/text fields
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },

  // Bio/description fields
  BIO: {
    MAX_LENGTH: 500,
  },

  // Phone number
  PHONE: {
    MAX_LENGTH: 20,
    PATTERN: /^\+?[0-9\s\-()]+$/,
  },

  // Pet name
  PET_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },

  // Message/contact form
  MESSAGE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000,
  },

  // Location fields
  LOCATION: {
    MAX_LENGTH: 100,
  },
} as const;

// File upload constraints
export const FILE_UPLOAD = {
  IMAGE: {
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const,
  },
  DOCUMENT: {
    MAX_SIZE_MB: 10,
    MAX_SIZE_BYTES: 10 * 1024 * 1024,
    ALLOWED_TYPES: ['application/pdf'] as const,
    ALLOWED_EXTENSIONS: ['.pdf'] as const,
  },
} as const;

// Search/list constraints
export const LIST_CONSTRAINTS = {
  MAX_RECENT_SEARCHES: 5,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
