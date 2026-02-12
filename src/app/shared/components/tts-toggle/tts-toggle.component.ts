import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TtsService } from '../../../core/services/tts.service';

@Component({
  selector: 'app-tts-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tts-toggle.component.html',
  styleUrls: ['./tts-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TtsToggleComponent {
  protected readonly tts = inject(TtsService);

  toggle(): void {
    this.tts.toggleAutoPlay();
  }
}
