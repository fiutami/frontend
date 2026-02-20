import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Shell Default (sfondo gradiente giallo, include: Avatar, Logo, MascotPeek, BottomTabBar)
import { TabPageShellDefaultComponent } from '../../shared/components/tab-page-shell-default/tab-page-shell-default.component';

// Shared standalone components
import { QuickActionsRowComponent, QuickActionItem } from '../../shared/components/quick-actions-row/quick-actions-row.component';
import { ActionChipsRowComponent, ActionChip } from '../../shared/components/action-chips-row/action-chips-row.component';

// Calendar-specific components
import { CalendarDateDisplayComponent } from '../components/calendar-date-display/calendar-date-display.component';
import { CalendarSavedOverlayComponent } from '../overlays/calendar-saved-overlay.component';
import { CalendarMonthOverlayComponent } from '../overlays/calendar-month-overlay.component';
import { CalendarNotificationsOverlayComponent } from '../overlays/calendar-notifications-overlay.component';
import { CalendarCreateEventOverlayComponent } from '../overlays/calendar-create-event-overlay.component';
import { CalendarEventsOverlayComponent } from '../overlays/calendar-events-overlay.component';
import { CalendarBirthdaysOverlayComponent } from '../overlays/calendar-birthdays-overlay.component';
import { CalendarDayEventsOverlayComponent } from '../overlays/calendar-day-events-overlay.component';

// Services
import { CalendarOverlayService, CalendarFilterIcon, CalendarActionButton } from '../services/calendar-overlay.service';

interface MonthItem {
  name: string;
  index: number;
}

/**
 * CalendarMonthSelectorComponent
 *
 * Usa TabPageShellDefault che include automaticamente:
 * - Avatar, Logo, MascotPeek, BottomTabBar
 *
 * Questo componente aggiunge solo:
 * - CalendarDateDisplay (in shellBrandingExtra)
 * - QuickActions + ActionChips (in shellStickyContent)
 * - Month grid + overlays (main content)
 */
@Component({
  selector: 'app-calendar-month-selector',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    // Layout - TabPageShellDefault gestisce Avatar, Logo, Mascot, TabBar (sfondo gradiente giallo)
    TabPageShellDefaultComponent,
    // Shared UI (solo quelli non automatici)
    QuickActionsRowComponent,
    ActionChipsRowComponent,
    // Calendar-specific
    CalendarDateDisplayComponent,
    CalendarSavedOverlayComponent,
    CalendarMonthOverlayComponent,
    CalendarNotificationsOverlayComponent,
    CalendarCreateEventOverlayComponent,
    CalendarEventsOverlayComponent,
    CalendarBirthdaysOverlayComponent,
    CalendarDayEventsOverlayComponent,
  ],
  templateUrl: './calendar-month-selector.component.html',
  styleUrls: ['./calendar-month-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarMonthSelectorComponent {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  protected readonly overlayService = inject(CalendarOverlayService);

  /** Translated page title */
  protected calendarTitle = this.translate.instant('calendar.title');

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.calendarTitle = this.translate.instant('calendar.title');
    });
  }

  /** Current date for display */
  protected currentDate = signal(new Date());

  /** Currently selected year */
  protected selectedYear = signal(new Date().getFullYear());

  /** Quick Action Items (2 icons: notifications, bookmark) */
  protected readonly quickActionItems: QuickActionItem[] = [
    { id: 'notifications', icon: 'notifications', badge: this.overlayService.notificationCount(), ariaLabel: 'Notifiche' },
    { id: 'saved', icon: 'bookmark', ariaLabel: 'Salvati' },
  ];

  /** Action Chips (2 pills: birthdays, events) - FIGMA: tutti gialli */
  protected readonly actionChips: ActionChip[] = [
    { id: 'birthdays', label: 'Compleanni in vista', variant: 'yellow' },
    { id: 'events-list', label: 'Eventi', variant: 'yellow' },
  ];

  /** Left column months */
  protected readonly leftColumnMonths: MonthItem[] = [
    { name: 'GENNAIO', index: 0 },
    { name: 'FEBBRAIO', index: 1 },
    { name: 'MARZO', index: 2 },
    { name: 'APRILE', index: 3 },
    { name: 'MAGGIO', index: 4 },
    { name: 'GIUGNO', index: 5 },
  ];

  /** Right column months */
  protected readonly rightColumnMonths: MonthItem[] = [
    { name: 'LUGLIO', index: 6 },
    { name: 'AGOSTO', index: 7 },
    { name: 'SETTEMBRE', index: 8 },
    { name: 'OTTOBRE', index: 9 },
    { name: 'NOVEMBRE', index: 10 },
    { name: 'DICEMBRE', index: 11 },
  ];

  /** Check if a month is the current month */
  isCurrentMonth(monthIndex: number): boolean {
    const now = new Date();
    return monthIndex === now.getMonth() && this.selectedYear() === now.getFullYear();
  }

  prevYear(): void {
    this.selectedYear.update(y => y - 1);
  }

  nextYear(): void {
    this.selectedYear.update(y => y + 1);
  }

  selectMonth(monthIndex: number): void {
    this.router.navigate(['/calendar/month'], {
      queryParams: { month: monthIndex, year: this.selectedYear() }
    });
  }

  onBack(): void {
    this.router.navigate(['/home/main']);
  }

  /** Handle quick action click (filter icons) */
  onFilterIconClick(id: string): void {
    this.overlayService.toggleFilter(id as CalendarFilterIcon);
  }

  /** Handle action chip click */
  onActionButtonClick(id: string): void {
    this.overlayService.toggleAction(id as CalendarActionButton);
  }
}
