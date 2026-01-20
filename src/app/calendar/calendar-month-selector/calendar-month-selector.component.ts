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
import { AvatarButtonComponent } from '../../shared/components/avatar-button/avatar-button.component';
import { BottomTabBarComponent } from '../../shared/components/bottom-tab-bar/bottom-tab-bar.component';
import { MAIN_TAB_BAR_CONFIG } from '../../core/config/tab-bar.config';
import { CalendarOverlayService, CalendarFilterIcon, CalendarActionButton } from '../services/calendar-overlay.service';
import { CalendarFilterIconsComponent } from '../components/calendar-filter-icons.component';
import { CalendarActionButtonsComponent } from '../components/calendar-action-buttons.component';
import { CalendarSavedOverlayComponent } from '../overlays/calendar-saved-overlay.component';
import { CalendarMonthOverlayComponent } from '../overlays/calendar-month-overlay.component';
import { CalendarNotificationsOverlayComponent } from '../overlays/calendar-notifications-overlay.component';
import { CalendarCreateEventOverlayComponent } from '../overlays/calendar-create-event-overlay.component';
import { CalendarEventsOverlayComponent } from '../overlays/calendar-events-overlay.component';
import { CalendarBirthdaysOverlayComponent } from '../overlays/calendar-birthdays-overlay.component';

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
  'Domenica', 'Lunedi', 'Martedi', 'Mercoledi',
  'Giovedi', 'Venerdi', 'Sabato'
];

/**
 * Italian month names
 */
const MONTH_NAMES_LONG = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

/**
 * CalendarMonthSelectorComponent
 *
 * Main calendar page with:
 * - Header (back button, title, drawer icon)
 * - Logo + current date
 * - Filter icons (3) - open overlays
 * - Action buttons (3) - open overlays
 * - Month grid (12 months) - navigate to pages
 * - All overlay components
 *
 * Based on Figma design: mob_calendar (12271-6457)
 */
@Component({
  selector: 'app-calendar-month-selector',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    AvatarButtonComponent,
    BottomTabBarComponent,
    CalendarFilterIconsComponent,
    CalendarActionButtonsComponent,
    CalendarSavedOverlayComponent,
    CalendarMonthOverlayComponent,
    CalendarNotificationsOverlayComponent,
    CalendarCreateEventOverlayComponent,
    CalendarEventsOverlayComponent,
    CalendarBirthdaysOverlayComponent,
  ],
  templateUrl: './calendar-month-selector.component.html',
  styleUrls: ['./calendar-month-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarMonthSelectorComponent {
  private readonly router = inject(Router);
  protected readonly overlayService = inject(CalendarOverlayService);

  /** Tab bar configuration */
  protected readonly tabs = MAIN_TAB_BAR_CONFIG;

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

  /** Formatted current date: "Lunedi 19 Gennaio 2026" */
  protected formattedFullDate = computed(() => {
    const date = this.currentDate();
    const dayName = DAY_NAMES_FULL[date.getDay()];
    const day = date.getDate();
    const month = MONTH_NAMES_LONG[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName} ${day} ${month} ${year}`;
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

  /** Select a month and navigate to monthly view (ONLY navigation that opens a new page) */
  selectMonth(monthIndex: number): void {
    this.router.navigate(['/calendar/month'], {
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

  /** Handle filter icon click - toggle overlay */
  onFilterIconClick(icon: CalendarFilterIcon): void {
    this.overlayService.toggleFilter(icon);
  }

  /** Handle action button click - toggle overlay */
  onActionButtonClick(button: CalendarActionButton): void {
    this.overlayService.toggleAction(button);
  }

  /** Track by function */
  trackByMonth(_index: number, month: MonthItem): number {
    return month.index;
  }
}
