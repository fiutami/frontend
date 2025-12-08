import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

export type BackButtonVariant = 'glass' | 'solid' | 'outline';
export type BackButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButtonComponent {
  @Input() variant: BackButtonVariant = 'glass';
  @Input() size: BackButtonSize = 'md';
  @Input() ariaLabel = 'Torna indietro';
  @Input() disabled = false;

  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string[] {
    return [
      'back-btn',
      `back-btn--${this.variant}`,
      `back-btn--${this.size}`,
    ];
  }

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
