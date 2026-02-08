import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

export type IconButtonVariant = 'default' | 'ghost' | 'glass';
export type IconButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  @Input({ required: true }) ariaLabel!: string;
  @Input() variant: IconButtonVariant = 'default';
  @Input() size: IconButtonSize = 'md';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string[] {
    return [
      'icon-btn',
      `icon-btn--${this.variant}`,
      `icon-btn--${this.size}`,
    ];
  }

  onClick(event: MouseEvent): void {
    if (!this.disabled) {
      this.clicked.emit(event);
    }
  }
}
