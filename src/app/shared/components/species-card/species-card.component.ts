import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SpeciesCardComponent - Card for displaying a species in the grid
 *
 * Features:
 * - Background image with cover fit
 * - Centered label with shadow
 * - Rounded corners (22px top-left, 0 top-right, 22px bottom)
 * - Click interaction
 *
 * @example
 * ```html
 * <app-species-card
 *   [label]="'CANE'"
 *   [image]="'assets/images/species/species-cane.png'"
 *   (clicked)="onSpeciesClick('Cane')">
 * </app-species-card>
 * ```
 */
@Component({
  selector: 'app-species-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './species-card.component.html',
  styleUrls: ['./species-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesCardComponent {
  /**
   * Species label to display
   * @required
   */
  @Input({ required: true }) label!: string;

  /**
   * Background image URL
   * @required
   */
  @Input({ required: true }) image!: string;

  /**
   * Whether to use smaller font for long labels
   * @default false
   */
  @Input() smallLabel = false;

  /**
   * Emits when card is clicked
   */
  @Output() clicked = new EventEmitter<void>();

  /**
   * Handle card click
   */
  onClick(): void {
    this.clicked.emit();
  }

  /**
   * Handle keyboard activation
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.clicked.emit();
    }
  }
}
