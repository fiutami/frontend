import {
  Component,
  Input,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-locked-section-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './locked-section-card.component.html',
  styleUrls: ['./locked-section-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LockedSectionCardComponent {
  private translate = inject(TranslateService);

  @Input({ required: true }) title = '';
  @Input() icon = 'lock';

  showToast = signal(false);

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  onClick(): void {
    // Clear any existing timeout to prevent stacking
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.showToast.set(true);

    this.toastTimeout = setTimeout(() => {
      this.showToast.set(false);
      this.toastTimeout = null;
    }, 2000);
  }
}
