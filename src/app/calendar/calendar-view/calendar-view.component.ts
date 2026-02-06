import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MAIN_TAB_BAR_CONFIG } from '../../core/config/tab-bar.config';
import { AvatarButtonComponent } from '../../shared/components/avatar-button';
import { CalendarOverlayService } from '../services/calendar-overlay.service';

/**
 * Calendar event types
 */
export type CalendarEventType = 'vet' | 'grooming' | 'walk' | 'vaccine' | 'birthday' | 'custom';

/**
 * Calendar event interface
 */
export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: Date;
  time?: string;
  petId?: string;
  petName?: string;
}

/**
 * Calendar day interface
 */
export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
}

/**
 * Month names in Italian
 */
const MONTH_NAMES = [
  'GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO',
  'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'
];

/**
 * Day names in Italian (short)
 */
const DAY_NAMES = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];

/**
 * Event type colors
 */
const EVENT_COLORS: Record<CalendarEventType, string> = {
  vet: '#FF6B6B',
  grooming: '#4ECDC4',
  walk: '#45B7D1',
  vaccine: '#96CEB4',
  birthday: '#F2B830',
  custom: '#9B59B6',
};

/**
 * CalendarViewComponent
 *
 * Main calendar view for the app. Displays a monthly calendar grid
 * with events and allows navigation between months.
 *
 * Based on Figma designs: mob_calendar (12271-6457) and mob_calendar_month_jan (12271-5501)
 */
@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, SharedModule, AvatarButtonComponent],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarViewComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly overlayService = inject(CalendarOverlayService);

  /** Tab bar configuration */
  protected readonly tabs = MAIN_TAB_BAR_CONFIG;

  /** Notification count from overlay service */
  protected readonly notificationCount = this.overlayService.notificationCount;

  /** Check if notifications overlay is open */
  protected readonly isNotificationsOpen = computed(() =>
    this.overlayService.activeFilter() === 'notifications'
  );

  /** Day names for header */
  protected readonly dayNames = DAY_NAMES;

  /** Event colors map */
  protected readonly eventColors = EVENT_COLORS;

  /** Current displayed date (month/year) */
  protected currentDate = signal(new Date());

  /** Selected date */
  protected selectedDate = signal(new Date());

  /** Mock events for MVP */
  protected readonly mockEvents = signal<CalendarEvent[]>([
    {
      id: '1',
      title: 'Vaccino antirabbia',
      type: 'vaccine',
      date: new Date(),
      time: '10:00',
      petName: 'Luna',
    },
    {
      id: '2',
      title: 'Toelettatura',
      type: 'grooming',
      date: new Date(Date.now() + 86400000 * 3),
      time: '15:00',
      petName: 'Luna',
    },
    {
      id: '3',
      title: 'Visita dal veterinario',
      type: 'vet',
      date: new Date(Date.now() + 86400000 * 7),
      time: '11:30',
      petName: 'Luna',
    },
    {
      id: '4',
      title: 'Compleanno Luna!',
      type: 'birthday',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
      petName: 'Luna',
    },
  ]);

  /** Current month name */
  protected currentMonthName = computed(() => {
    return MONTH_NAMES[this.currentDate().getMonth()];
  });

  /** Current year */
  protected currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  /** Calendar days grid (42 days = 6 weeks) */
  protected calendarDays = computed(() => {
    return this.generateCalendarDays();
  });

  /** Events for selected day */
  protected selectedDayEvents = computed(() => {
    const selected = this.selectedDate();
    return this.mockEvents().filter(event =>
      this.isSameDay(event.date, selected)
    );
  });

  /** Formatted selected date */
  protected formattedSelectedDate = computed(() => {
    const date = this.selectedDate();
    const dayName = this.getDayName(date);
    const day = date.getDate().toString().padStart(2, '0');
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName} ${day} ${month} ${year}`;
  });

  /**
   * Initialize component with query params if present
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const month = params['month'];
      const year = params['year'];

      if (month !== undefined && year !== undefined) {
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        if (!isNaN(monthNum) && !isNaN(yearNum)) {
          this.currentDate.set(new Date(yearNum, monthNum, 1));
          this.selectedDate.set(new Date(yearNum, monthNum, 1));
        }
      }
    });
  }

  /**
   * Navigate to previous month
   */
  prevMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  /**
   * Navigate to next month
   */
  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  /**
   * Select a day
   */
  selectDay(day: CalendarDay): void {
    this.selectedDate.set(day.date);
  }

  /**
   * Navigate back to month selector
   */
  onBack(): void {
    this.router.navigate(['/home/calendar']);
  }

  /**
   * Open create event overlay (same behavior as mob_calendar)
   */
  onCreateEvent(): void {
    this.overlayService.openCreateEvent();
  }

  /**
   * Toggle notifications overlay (same behavior as mob_calendar)
   */
  onNotificationsClick(): void {
    this.overlayService.toggleFilter('notifications');
  }

  /**
   * View event details (placeholder)
   */
  onEventClick(event: CalendarEvent): void {
    // TODO: Navigate to event detail
    console.log('Event clicked:', event);
  }

  /**
   * Get event icon based on type
   */
  getEventIcon(type: CalendarEventType): string {
    const icons: Record<CalendarEventType, string> = {
      vet: '🏥',
      grooming: '✂️',
      walk: '🚶',
      vaccine: '💉',
      birthday: '🎂',
      custom: '📌',
    };
    return icons[type] || '📌';
  }

  /**
   * Track by function for calendar days
   */
  trackByDay(index: number, day: CalendarDay): string {
    return day.date.toISOString();
  }

  /**
   * Track by function for events
   */
  trackByEvent(index: number, event: CalendarEvent): string {
    return event.id;
  }

  /**
   * Generate calendar days for current month view
   */
  private generateCalendarDays(): CalendarDay[] {
    const days: CalendarDay[] = [];
    const current = this.currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();
    const today = new Date();
    const selected = this.selectedDate();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Day of week for first day (0 = Sunday, convert to Monday = 0)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(this.createCalendarDay(date, false, today, selected));
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push(this.createCalendarDay(date, true, today, selected));
    }

    // Add days from next month to complete 42 days (6 weeks)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(this.createCalendarDay(date, false, today, selected));
    }

    return days;
  }

  /**
   * Create a CalendarDay object
   */
  private createCalendarDay(
    date: Date,
    isCurrentMonth: boolean,
    today: Date,
    selected: Date
  ): CalendarDay {
    return {
      date,
      dayOfMonth: date.getDate(),
      isCurrentMonth,
      isToday: this.isSameDay(date, today),
      isSelected: this.isSameDay(date, selected),
      events: this.mockEvents().filter(e => this.isSameDay(e.date, date)),
    };
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  /**
   * Get Italian day name
   */
  private getDayName(date: Date): string {
    const dayNames = ['DOMENICA', 'LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI', 'SABATO'];
    return dayNames[date.getDay()];
  }

}
