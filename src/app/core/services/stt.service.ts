/**
 * STT Service - Speech-to-Text via Web Speech Recognition API
 *
 * Features:
 * - Single-shot and continuous modes
 * - Interim results for live transcription
 * - Silence timeout (auto-stop after 5s)
 * - NgZone-aware callbacks
 * - Permission management
 * - Graceful degradation when not supported
 */
import { Injectable, inject, signal, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { STT_CONFIG, STT_LOCALES, SupportedLanguage } from '../config/constants/voice.constants';

export type SttMode = 'single-shot' | 'continuous';

export interface SttOptions {
  mode?: SttMode;
  language?: string;
}

// Augment Window for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class SttService {
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  // ─── State signals ─────────────────────────────────────────
  private readonly _isListening = signal(false);
  private readonly _transcript = signal('');
  private readonly _interimTranscript = signal('');
  private readonly _confidence = signal(0);
  private readonly _error = signal<string | null>(null);
  private readonly _isSupported = signal(this.checkSupport());

  readonly isListening = this._isListening.asReadonly();
  readonly transcript = this._transcript.asReadonly();
  readonly interimTranscript = this._interimTranscript.asReadonly();
  readonly confidence = this._confidence.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isSupported = this._isSupported.asReadonly();

  // ─── Internal state ────────────────────────────────────────
  private recognition: any = null; // SpeechRecognition instance
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private currentMode: SttMode = 'single-shot';
  private currentLanguage: SupportedLanguage = 'it';

  // ─── Public API ────────────────────────────────────────────

  /**
   * Start speech recognition.
   */
  start(options?: SttOptions): void {
    if (!this.isBrowser() || !this._isSupported()) return;
    if (this._isListening()) {
      this.stop();
    }

    this._error.set(null);
    this._transcript.set('');
    this._interimTranscript.set('');
    this._confidence.set(0);

    this.currentMode = options?.mode ?? 'single-shot';
    const lang = options?.language ?? STT_LOCALES[this.currentLanguage] ?? 'it-IT';

    this.createRecognition(lang);

    try {
      this.recognition?.start();
      this.zone.run(() => this._isListening.set(true));
      this.startSilenceTimer();
    } catch (err) {
      console.error('[STT] Start error:', err);
      this.zone.run(() => {
        this._error.set('Impossibile avviare il riconoscimento vocale');
        this._isListening.set(false);
      });
    }
  }

  /**
   * Stop speech recognition gracefully.
   */
  stop(): void {
    this.clearSilenceTimer();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch { /* ignore */ }
    }
    this.zone.run(() => this._isListening.set(false));
  }

  /**
   * Abort speech recognition immediately.
   */
  abort(): void {
    this.clearSilenceTimer();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch { /* ignore */ }
    }
    this.zone.run(() => {
      this._isListening.set(false);
      this._interimTranscript.set('');
    });
  }

  /**
   * Request microphone permission proactively.
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isBrowser()) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately - we just needed permission
      stream.getTracks().forEach(t => t.stop());
      return true;
    } catch {
      this._error.set('Permesso microfono negato');
      return false;
    }
  }

  /**
   * Clear current transcript.
   */
  clearTranscript(): void {
    this._transcript.set('');
    this._interimTranscript.set('');
  }

  /**
   * Set language for recognition.
   */
  setLanguage(lang: SupportedLanguage): void {
    this.currentLanguage = lang;
  }

  // ─── Private methods ───────────────────────────────────────

  private createRecognition(lang: string): void {
    const SpeechRecognition = (window as any).SpeechRecognition ||
                              (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = lang;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = STT_CONFIG.MAX_ALTERNATIVES;
    this.recognition.continuous = this.currentMode === 'continuous';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.resetSilenceTimer();

      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          this.zone.run(() => this._confidence.set(result[0].confidence));
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      this.zone.run(() => {
        if (finalTranscript) {
          this._transcript.update(t => (t + ' ' + finalTranscript).trim());
          this._interimTranscript.set('');

          // In single-shot mode, stop after final result
          if (this.currentMode === 'single-shot') {
            this.stop();
          }
        } else {
          this._interimTranscript.set(interimTranscript);
        }
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.clearSilenceTimer();
      const errorMsg = this.mapError(event.error);
      this.zone.run(() => {
        // 'no-speech' is not a real error, just silence
        if (event.error !== 'no-speech') {
          this._error.set(errorMsg);
        }
        this._isListening.set(false);
      });
    };

    this.recognition.onend = () => {
      this.clearSilenceTimer();
      this.zone.run(() => this._isListening.set(false));
    };
  }

  private startSilenceTimer(): void {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      if (this._isListening()) {
        this.stop();
      }
    }, STT_CONFIG.SILENCE_TIMEOUT_MS);
  }

  private resetSilenceTimer(): void {
    this.startSilenceTimer();
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private checkSupport(): boolean {
    if (!this.isBrowser()) return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private mapError(error: string): string {
    const messages: Record<string, string> = {
      'not-allowed': 'Permesso microfono negato. Controlla le impostazioni del browser.',
      'no-speech': 'Nessun audio rilevato. Riprova.',
      'audio-capture': 'Microfono non disponibile.',
      'network': 'Errore di rete per il riconoscimento vocale.',
      'aborted': 'Riconoscimento vocale interrotto.',
      'service-not-allowed': 'Servizio di riconoscimento vocale non disponibile.',
    };
    return messages[error] ?? 'Errore riconoscimento vocale.';
  }
}
