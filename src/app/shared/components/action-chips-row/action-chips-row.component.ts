import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiPillButtonComponent } from '../ui-pill-button/ui-pill-button.component';

/**
 * Item per ActionChipsRow
 */
export interface ActionChip {
  /** ID univoco */
  id: string;
  /** Testo del chip */
  label: string;
  /** Variante colore */
  variant: 'primary' | 'yellow' | 'outline-yellow' | 'outline-danger';
}

/**
 * ActionChipsRowComponent - Row di chip azioni
 *
 * Usato nel calendario per: "Compleanni in vista", "Eventi", "Crea Evento"
 *
 * RESPONSIVE:
 * - Mobile: scroll orizzontale
 * - Tablet+: wrap centrato
 *
 * ESEMPIO:
 * ```html
 * <app-action-chips-row
 *   [chips]="actionChips"
 *   (chipClicked)="onChipClick($event)">
 * </app-action-chips-row>
 * ```
 */
@Component({
  selector: 'app-action-chips-row',
  standalone: true,
  imports: [CommonModule, UiPillButtonComponent],
  templateUrl: './action-chips-row.component.html',
  styleUrls: ['./action-chips-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionChipsRowComponent {
  @Input() chips: ActionChip[] = [];

  @Output() chipClicked = new EventEmitter<string>();

  onChipClick(id: string): void {
    this.chipClicked.emit(id);
  }

  trackById(index: number, chip: ActionChip): string {
    return chip.id;
  }
}
