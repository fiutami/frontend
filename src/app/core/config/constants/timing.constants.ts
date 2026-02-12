/**
 * Timing constants for consistent delays and intervals across the app
 */

// Time unit constants (in milliseconds)
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const MS_PER_WEEK = 7 * MS_PER_DAY;

// Polling intervals
export const POLLING_INTERVAL = {
  CHAT: 5000,           // 5 seconds for chat messages
  NOTIFICATIONS: 30000, // 30 seconds for notifications
  ACTIVITY: 60000,      // 1 minute for activity feed
} as const;

// Debounce times
export const DEBOUNCE_TIME = {
  SEARCH: 300,      // Search input debounce
  SCROLL: 100,      // Scroll events
  RESIZE: 150,      // Window resize
  INPUT: 200,       // Form input validation
} as const;

// Animation delays
export const ANIMATION_DELAY = {
  FADE: 150,
  SLIDE: 200,
  TRANSITION: 300,
  MODAL: 200,
  TOAST: 3000,      // Toast notification display time
  PROGRESS: 100,    // Progress bar update
  TYPEWRITER_CHAR_MS: 30, // Typewriter effect: ms per character
  TTS_FADE_IN: 200,       // TTS audio fade in
  TTS_FADE_OUT: 150,      // TTS audio fade out
} as const;

// Mock API delays (for development - should be 0 in production)
export const MOCK_API_DELAY = {
  FAST: 200,
  NORMAL: 400,
  SLOW: 600,
  NETWORK: 1500,
} as const;

// Timeout values
export const TIMEOUT = {
  CLIPBOARD_FEEDBACK: 2000,
  AUTO_ADVANCE: 300,
  OAUTH_CLEANUP: 60000,
  HTTP_REQUEST: 30000,
} as const;
