import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PetInfoItem,
  PetInfoLayout,
  PetInfoVariant,
} from './pet-info-card.models';

/**
 * PetInfoCardComponent - Pet Information Display Card
 *
 * Displays pet information in a card format with labeled values.
 * Used for showing pet stats like SEX, ANNI, PESO, RAZZA.
 *
 * @example
 * ```html
 * <app-pet-info-card
 *   [items]="[
 *     { label: 'SEX', value: 'M' },
 *     { label: 'ANNI', value: '3' },
 *     { label: 'PESO', value: '12kg' },
 *     { label: 'RAZZA', value: 'Golden' }
 *   ]"
 *   layout="horizontal">
 * </app-pet-info-card>
 * ```
 */
@Component({
  selector: 'app-pet-info-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-info-card.component.html',
  styleUrls: ['./pet-info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetInfoCardComponent {
  /**
   * Array of info items to display
   * @required
   */
  @Input({ required: true }) items: PetInfoItem[] = [];

  /**
   * Layout arrangement
   * @default 'horizontal'
   */
  @Input() layout: PetInfoLayout = 'horizontal';

  /**
   * Visual variant
   * @default 'solid'
   */
  @Input() variant: PetInfoVariant = 'solid';

  /**
   * Whether to show compact mode (smaller text)
   * @default false
   */
  @Input() compact = false;

  /**
   * Get CSS classes for the container
   */
  get containerClasses(): Record<string, boolean> {
    return {
      'pet-info-card': true,
      [`pet-info-card--${this.layout}`]: true,
      [`pet-info-card--${this.variant}`]: true,
      'pet-info-card--compact': this.compact,
    };
  }
}
