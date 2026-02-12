/**
 * TTS Service - Text-to-Speech via edge_tts backend
 *
 * Features:
 * - Streams audio from backend TTS microservice
 * - LRU cache for recently played audio (20 entries)
 * - Audio queue for sequential playback
 * - Offline fallback to Web Speech API
 * - User preferences persisted in localStorage
 */
import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of, timeout } from 'rxjs';
import {
  TTS_CONFIG,
  FIUTO_VOICES,
  DEFAULT_VOICES,
  VOICE_STORAGE_KEYS,
  SupportedLanguage,
} from '../config/constants/voice.constants';
import { environment } from '../../../environments/environment';

interface CacheEntry {
  url: string;
  lastUsed: number;
}

@Injectable({ providedIn: 'root' })
export class TtsService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  // ─── State signals ─────────────────────────────────────────
  private readonly _isPlaying = signal(false);
  private readonly _isPaused = signal(false);
  private readonly _isLoading = signal(false);
  private readonly _currentText = signal('');
  private readonly _error = signal<string | null>(null);
  private readonly _autoPlay = signal(this.loadPref(VOICE_STORAGE_KEYS.AUTO_PLAY, false));
  private readonly _volume = signal<number>(this.loadPref(VOICE_STORAGE_KEYS.VOLUME, TTS_CONFIG.DEFAULT_VOLUME));

  readonly isPlaying = this._isPlaying.asReadonly();
  readonly isPaused = this._isPaused.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly currentText = this._currentText.asReadonly();
  readonly error = this._error.asReadonly();
  readonly autoPlay = this._autoPlay.asReadonly();
  readonly volume = this._volume.asReadonly();

  // ─── Internal state ────────────────────────────────────────
  private audio: HTMLAudioElement | null = null;
  private cache = new Map<string, CacheEntry>();
  private queue: string[] = [];
  private isProcessingQueue = false;
  private currentLanguage: SupportedLanguage = 'it';

  constructor() {
    if (this.isBrowser()) {
      this.audio = new Audio();
      this.audio.addEventListener('ended', () => this.onAudioEnded());
      this.audio.addEventListener('error', () => this.onAudioError());
      this.audio.volume = this._volume();
    }
  }

  // ─── Public API ────────────────────────────────────────────

  /**
   * Speak text using TTS.
   */
  async speak(text: string, options?: { voiceId?: string; force?: boolean }): Promise<void> {
    if (!this.isBrowser() || !text.trim()) return;

    const trimmed = text.slice(0, TTS_CONFIG.MAX_TEXT_LENGTH);
    this._error.set(null);

    // Stop current playback if needed
    if (this._isPlaying() || this._isPaused()) {
      this.stop();
    }

    this._currentText.set(trimmed);
    this._isLoading.set(true);

    try {
      const blobUrl = await this.getAudioUrl(trimmed, options?.voiceId);
      await this.playAudio(blobUrl);
    } catch {
      // Fallback to Web Speech API
      this.speakFallback(trimmed);
    }
  }

  /**
   * Speak only if auto-play is enabled.
   */
  speakIfAutoPlay(text: string): void {
    if (this._autoPlay()) {
      this.speak(text);
    }
  }

  /**
   * Enqueue text for sequential playback.
   */
  enqueue(text: string): void {
    this.queue.push(text);
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  /**
   * Pause current playback.
   */
  pause(): void {
    if (this.audio && this._isPlaying()) {
      this.audio.pause();
      this._isPlaying.set(false);
      this._isPaused.set(true);
    }
  }

  /**
   * Resume paused playback.
   */
  resume(): void {
    if (this.audio && this._isPaused()) {
      this.audio.play();
      this._isPlaying.set(true);
      this._isPaused.set(false);
    }
  }

  /**
   * Stop current playback.
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this._isPlaying.set(false);
    this._isPaused.set(false);
    this._isLoading.set(false);
    this._currentText.set('');
    this.queue = [];
    this.isProcessingQueue = false;

    // Also stop Web Speech API if active
    if (this.isBrowser() && window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Skip to next in queue.
   */
  skip(): void {
    this.stop();
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Set volume (0-1).
   */
  setVolume(vol: number): void {
    const v = Math.max(0, Math.min(1, vol));
    this._volume.set(v);
    if (this.audio) {
      this.audio.volume = v;
    }
    this.savePref(VOICE_STORAGE_KEYS.VOLUME, v);
  }

  /**
   * Toggle auto-play on/off.
   */
  toggleAutoPlay(): void {
    const next = !this._autoPlay();
    this._autoPlay.set(next);
    this.savePref(VOICE_STORAGE_KEYS.AUTO_PLAY, next);
  }

  /**
   * Set current language for voice selection.
   */
  setLanguage(lang: SupportedLanguage): void {
    this.currentLanguage = lang;
  }

  // ─── Private methods ──────────────────────────────────────

  private async getAudioUrl(text: string, voiceId?: string): Promise<string> {
    const cacheKey = `${voiceId || this.getDefaultVoice()}_${text}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.lastUsed = Date.now();
      return cached.url;
    }

    // Fetch from backend
    const voice = voiceId || this.getDefaultVoice();
    const blob = await new Promise<Blob>((resolve, reject) => {
      this.http.post(`${environment.apiUrl}/tts/synthesize`, {
        text,
        voice_id: voice,
        rate: TTS_CONFIG.DEFAULT_RATE,
        pitch: TTS_CONFIG.DEFAULT_PITCH,
      }, { responseType: 'blob' }).pipe(
        timeout(15000),
        catchError(err => {
          reject(err);
          return of(null);
        })
      ).subscribe(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Empty response'));
      });
    });

    const url = URL.createObjectURL(blob);

    // Add to cache with LRU eviction
    this.addToCache(cacheKey, url);

    return url;
  }

  private addToCache(key: string, url: string): void {
    if (this.cache.size >= TTS_CONFIG.CACHE_SIZE) {
      // Evict LRU entry
      let oldestKey = '';
      let oldestTime = Infinity;
      for (const [k, v] of this.cache) {
        if (v.lastUsed < oldestTime) {
          oldestTime = v.lastUsed;
          oldestKey = k;
        }
      }
      if (oldestKey) {
        const entry = this.cache.get(oldestKey);
        if (entry) URL.revokeObjectURL(entry.url);
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { url, lastUsed: Date.now() });
  }

  private async playAudio(url: string): Promise<void> {
    if (!this.audio) return;

    this.audio.src = url;
    this.audio.volume = this._volume();
    this._isLoading.set(false);
    this._isPlaying.set(true);
    this._isPaused.set(false);

    try {
      await this.audio.play();
    } catch (err) {
      this._isPlaying.set(false);
      throw err;
    }
  }

  /**
   * Fallback to Web Speech API when backend is unavailable.
   */
  private speakFallback(text: string): void {
    if (!this.isBrowser() || !window.speechSynthesis) {
      this._error.set('TTS non disponibile');
      this._isLoading.set(false);
      return;
    }

    this._isLoading.set(false);
    this._isPlaying.set(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = DEFAULT_VOICES[this.currentLanguage] || 'it-IT';
    utterance.volume = this._volume();

    utterance.onend = () => {
      this._isPlaying.set(false);
      this._currentText.set('');
      this.onAudioEnded();
    };

    utterance.onerror = () => {
      this._isPlaying.set(false);
      this._error.set('Errore riproduzione vocale');
    };

    window.speechSynthesis.speak(utterance);
  }

  private onAudioEnded(): void {
    this._isPlaying.set(false);
    this._currentText.set('');

    // Process next in queue
    if (this.queue.length > 0) {
      this.processQueue();
    } else {
      this.isProcessingQueue = false;
    }
  }

  private onAudioError(): void {
    this._isPlaying.set(false);
    this._isLoading.set(false);
    this._error.set('Errore riproduzione audio');
  }

  private async processQueue(): Promise<void> {
    this.isProcessingQueue = true;
    const text = this.queue.shift();
    if (text) {
      await this.speak(text);
    } else {
      this.isProcessingQueue = false;
    }
  }

  private getDefaultVoice(): string {
    return FIUTO_VOICES[this.currentLanguage] || FIUTO_VOICES['it'];
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private loadPref<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser()) return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private savePref(key: string, value: unknown): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* quota exceeded - ignore */ }
  }
}
