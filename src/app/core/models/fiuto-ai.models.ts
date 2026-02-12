/**
 * Fiuto AI Models - Global AI types
 *
 * Shared types for the Fiuto AI concierge system.
 * Used across all pages, not just questionnaire.
 */

export type FiutoMode = 'general' | 'search' | 'guide' | 'concierge' | 'questionnaire' | 'results';

export type FiutoRoute =
  | 'home'
  | 'search'
  | 'map'
  | 'calendar'
  | 'profile'
  | 'breeds'
  | 'adoption'
  | 'lost-pets'
  | 'onboarding'
  | 'chat'
  | 'premium'
  | 'user'
  | 'unknown';

export interface FiutoChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  audioUrl?: string;
  isVoiceInput?: boolean;
}

export interface FiutoContext {
  route: FiutoRoute;
  mode: FiutoMode;
  pageData?: Record<string, unknown>;
  // Backward compat questionnaire
  currentQuestionId?: string;
  currentQuestionText?: string;
  userProfile?: Record<string, unknown>;
  matchResults?: unknown[];
}

export interface FiutoSuggestion {
  id: string;
  icon: string;
  text: string;
  action?: string;
}
