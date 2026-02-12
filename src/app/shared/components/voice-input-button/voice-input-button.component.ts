import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SttService } from '../../../core/services/stt.service';

@Component({
  selector: 'app-voice-input-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-input-button.component.html',
  styleUrls: ['./voice-input-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoiceInputButtonComponent {
  protected readonly stt = inject(SttService);

  @Input() mode: 'tap-toggle' | 'hold-to-record' = 'tap-toggle';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() transcriptReady = new EventEmitter<string>();
  @Output() interimTranscript = new EventEmitter<string>();

  private previousTranscript = '';

  get isHidden(): boolean {
    return !this.stt.isSupported();
  }

  onTap(): void {
    if (this.mode !== 'tap-toggle') return;

    if (this.stt.isListening()) {
      this.stt.stop();
      this.emitFinalTranscript();
    } else {
      this.previousTranscript = '';
      this.stt.start({ mode: 'single-shot' });
      this.watchTranscript();
    }
  }

  onPointerDown(): void {
    if (this.mode !== 'hold-to-record') return;
    this.previousTranscript = '';
    this.stt.start({ mode: 'continuous' });
    this.watchTranscript();
  }

  onPointerUp(): void {
    if (this.mode !== 'hold-to-record') return;
    this.stt.stop();
    this.emitFinalTranscript();
  }

  private watchTranscript(): void {
    const checkInterval = setInterval(() => {
      const interim = this.stt.interimTranscript();
      if (interim) {
        this.interimTranscript.emit(interim);
      }

      const final = this.stt.transcript();
      if (final && final !== this.previousTranscript) {
        this.previousTranscript = final;
        this.transcriptReady.emit(final);
        clearInterval(checkInterval);
      }

      if (!this.stt.isListening()) {
        clearInterval(checkInterval);
        this.emitFinalTranscript();
      }
    }, 100);
  }

  private emitFinalTranscript(): void {
    const transcript = this.stt.transcript();
    if (transcript && transcript !== this.previousTranscript) {
      this.transcriptReady.emit(transcript);
    }
  }
}
