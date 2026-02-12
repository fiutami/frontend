/**
 * Voice Constants - TTS/STT configuration
 */

export type SupportedLanguage = 'it' | 'en' | 'de' | 'es' | 'fr' | 'pt-BR';

/** Fiuto's voice per language (warm, friendly male voices) */
export const FIUTO_VOICES: Record<SupportedLanguage, string> = {
  it: 'it-IT-DiegoNeural',
  en: 'en-US-GuyNeural',
  de: 'de-DE-ConradNeural',
  es: 'es-ES-AlvaroNeural',
  fr: 'fr-FR-HenriNeural',
  'pt-BR': 'pt-BR-AntonioNeural',
};

/** Default fallback voices (Web Speech API) */
export const DEFAULT_VOICES: Record<SupportedLanguage, string> = {
  it: 'it-IT',
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  'pt-BR': 'pt-BR',
};

/** BCP-47 locale for STT recognition per language */
export const STT_LOCALES: Record<SupportedLanguage, string> = {
  it: 'it-IT',
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  'pt-BR': 'pt-BR',
};

/** TTS configuration */
export const TTS_CONFIG = {
  MAX_TEXT_LENGTH: 5000,
  CACHE_SIZE: 20,
  DEFAULT_VOLUME: 0.8,
  DEFAULT_RATE: '+0%',
  DEFAULT_PITCH: '+0Hz',
} as const;

/** STT configuration */
export const STT_CONFIG = {
  SILENCE_TIMEOUT_MS: 5000,
  MAX_ALTERNATIVES: 1,
} as const;

/** LocalStorage keys for voice preferences */
export const VOICE_STORAGE_KEYS = {
  AUTO_PLAY: 'fiutami_tts_autoplay',
  VOLUME: 'fiutami_tts_volume',
  VOICE_ID: 'fiutami_tts_voice',
} as const;
