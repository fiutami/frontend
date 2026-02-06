import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Item per QuickActionsRow
 */
export interface QuickActionItem {
  /** ID univoco */
  id: string;
  /** Material Icon name (es: 'notifications', 'calendar_today') */
  icon: string;
  /** Badge count (opzionale) */
  badge?: number;
  /** Aria label */
  ariaLabel?: string;
}

/**
 * QuickActionsRowComponent - Row di icone azioni rapide
 *
 * Usato nel calendario per: notifiche, calendario, bookmark
 *
 * ICONE: Material Icons (string name)
 *
 * ESEMPIO:
 * ```html
 * <app-quick-actions-row
 *   [items]="quickActions"
 *   [activeId]="'notifications'"
 *   (selected)="onActionClick($event)">
 * </app-quick-actions-row>
 * ```
 */
@Component({
  selector: 'app-quick-actions-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-actions-row.component.html',
  styleUrls: ['./quick-actions-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickActionsRowComponent {
  @Input() items: QuickActionItem[] = [];
  @Input() activeId: string | null = null;

  @Output() selected = new EventEmitter<string>();

  onItemClick(id: string): void {
    this.selected.emit(id);
  }

  trackById(index: number, item: QuickActionItem): string {
    return item.id;
  }
}
