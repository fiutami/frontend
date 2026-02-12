import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TtsService } from '../../../core/services/tts.service';

@Component({
  selector: 'app-audio-playback-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-playback-indicator.component.html',
  styleUrls: ['./audio-playback-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlaybackIndicatorComponent {
  protected readonly tts = inject(TtsService);

  @Input() variant: 'inline' | 'floating' | 'mini' = 'inline';

  onPauseResume(): void {
    if (this.tts.isPaused()) {
      this.tts.resume();
    } else {
      this.tts.pause();
    }
  }

  onStop(): void {
    this.tts.stop();
  }
}
