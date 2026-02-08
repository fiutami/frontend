import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * UiPillButtonComponent - Pulsante pill riusabile
 *
 * VARIANTI:
 * - primary: Blu pieno (azioni principali)
 * - yellow: Giallo pieno (FIGMA: action chips calendario)
 * - outline-yellow: Bordo giallo (CTA secondarie)
 * - outline-danger: Bordo rosso (azioni pericolose)
 *
 * NOTA: Niente EventEmitter - usa (click) standard.
 *
 * ESEMPIO:
 * ```html
 * <app-ui-pill-button variant="yellow" size="sm">
 *   Compleanni in vista
 * </app-ui-pill-button>
 * ```
 */
@Component({
  selector: 'app-ui-pill-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="ui-pill"
      [class.ui-pill--primary]="variant === 'primary'"
      [class.ui-pill--yellow]="variant === 'yellow'"
      [class.ui-pill--outline-yellow]="variant === 'outline-yellow'"
      [class.ui-pill--outline-danger]="variant === 'outline-danger'"
      [class.ui-pill--sm]="size === 'sm'"
      [class.ui-pill--md]="size === 'md'"
      [class.ui-pill--full]="fullWidth"
      [disabled]="disabled"
      type="button">
      <ng-content />
    </button>
  `,
  styleUrls: ['./ui-pill-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPillButtonComponent {
  @Input() variant: 'primary' | 'yellow' | 'outline-yellow' | 'outline-danger' = 'primary';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() fullWidth = false;
  @Input() disabled = false;
}
