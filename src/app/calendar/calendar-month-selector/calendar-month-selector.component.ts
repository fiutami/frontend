import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

/**
 * Month data interface
 */
interface MonthItem {
  name: string;
  index: number;
}

/**
 * Italian day names (full)
 */
const DAY_NAMES_FULL = [
  'DOMENICA', 'LUNEDI', 'MARTEDI', 'MERCOLEDI',
  'GIOVEDI', 'VENERDI', 'SABATO'
];

/**
 * Italian month names
 */
const MONTH_NAMES = [
  'GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO',
  'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'
];

/**
 * CalendarMonthSelectorComponent
 *
 * First level calendar view showing a grid of 12 months.
 * Users can select a month to navigate to the detailed monthly view.
 *
 * Based on Figma design: mob_calendar (12271-6457)
 */
@Component({
  selector: 'app-calendar-month-selector',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './calendar-month-selector.component.html',
  styleUrls: ['./calendar-month-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarMonthSelectorComponent {
  private readonly router = inject(Router);

  /** Current date for display */
  protected currentDate = signal(new Date());

  /** Currently selected year */
  protected selectedYear = signal(new Date().getFullYear());

  /** Left column months (Gennaio - Giugno) */
  protected readonly leftColumnMonths: MonthItem[] = [
    { name: 'GENNAIO', index: 0 },
    { name: 'FEBBRAIO', index: 1 },
    { name: 'MARZO', index: 2 },
    { name: 'APRILE', index: 3 },
    { name: 'MAGGIO', index: 4 },
    { name: 'GIUGNO', index: 5 },
  ];

  /** Right column months (Luglio - Dicembre) */
  protected readonly rightColumnMonths: MonthItem[] = [
    { name: 'LUGLIO', index: 6 },
    { name: 'AGOSTO', index: 7 },
    { name: 'SETTEMBRE', index: 8 },
    { name: 'OTTOBRE', index: 9 },
    { name: 'NOVEMBRE', index: 10 },
    { name: 'DICEMBRE', index: 11 },
  ];

  /** Current month index */
  protected currentMonthIndex = computed(() => {
    return new Date().getMonth();
  });

  /** Formatted current date display */
  protected formattedDate = computed(() => {
    const date = this.currentDate();
    const dayName = DAY_NAMES_FULL[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName} ${day}/${month}/${year}`;
  });

  /** Check if a month is the current month */
  isCurrentMonth(monthIndex: number): boolean {
    const now = new Date();
    return monthIndex === now.getMonth() &&
           this.selectedYear() === now.getFullYear();
  }

  /** Navigate to previous year */
  prevYear(): void {
    this.selectedYear.update(y => y - 1);
  }

  /** Navigate to next year */
  nextYear(): void {
    this.selectedYear.update(y => y + 1);
  }

  /** Select a month and navigate to monthly view */
  selectMonth(monthIndex: number): void {
    // Navigate to calendar view with month/year params
    this.router.navigate(['/home/calendar/month'], {
      queryParams: {
        month: monthIndex,
        year: this.selectedYear()
      }
    });
  }

  /** Navigate back */
  onBack(): void {
    this.router.navigate(['/home/main']);
  }

  /** Handle create event button */
  onCreateEvent(): void {
    // TODO: Open create event modal
    console.log('Create event clicked');
  }

  /** Track by function */
  trackByMonth(_index: number, month: MonthItem): number {
    return month.index;
  }
}
