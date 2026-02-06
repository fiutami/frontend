import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

/**
 * CalendarDateDisplayComponent - Display data grande (come Figma)
 *
 * Mostra:
 * - Giorno settimana (es: "MARTEDÌ")
 * - Data (es: "27/01")
 * - Anno (es: "2025")
 *
 * ESEMPIO:
 * ```html
 * <app-calendar-date-display [date]="today" />
 * ```
 */
@Component({
  selector: 'app-calendar-date-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-date-display.component.html',
  styleUrls: ['./calendar-date-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDateDisplayComponent {
  @Input() date: Date = new Date();

  get dayName(): string {
    return this.date.toLocaleDateString('it-IT', { weekday: 'long' }).toUpperCase();
  }

  get dayMonth(): string {
    const day = this.date.getDate().toString().padStart(2, '0');
    const month = (this.date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }

  get year(): string {
    return this.date.getFullYear().toString();
  }
}
