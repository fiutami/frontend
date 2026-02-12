import { Component, ChangeDetectionStrategy, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TtsService } from '../../../core/services/tts.service';

@Component({
  selector: 'app-message-play-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-play-button.component.html',
  styleUrls: ['./message-play-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagePlayButtonComponent {
  private readonly tts = inject(TtsService);

  @Input({ required: true }) text!: string;

  readonly isThisPlaying = computed(() =>
    this.tts.currentText() === this.text && this.tts.isPlaying()
  );

  readonly isThisLoading = computed(() =>
    this.tts.currentText() === this.text && this.tts.isLoading()
  );

  toggle(): void {
    if (this.isThisPlaying()) {
      this.tts.stop();
    } else {
      this.tts.speak(this.text);
    }
  }
}
