import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  hasEvents: boolean;
  eventCount: number;
  events: any[];
}

@Component({
  selector: 'app-calendar-month',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-month.component.html',
  styleUrls: ['./calendar-month.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarMonthComponent {
  @Input() set currentDate(value: Date) {
    this._currentDate.set(value);
  }
  get currentDate(): Date {
    return this._currentDate();
  }

  @Input() set events(value: any[]) {
    this._events.set(value);
  }
  get events(): any[] {
    return this._events();
  }

  @Output() daySelected = new EventEmitter<Date>();

  private _currentDate = signal(new Date());
  private _events = signal<any[]>([]);

  // Days of week
  weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  // Computed calendar days grid
  calendarDays = computed(() => this.generateCalendarDays());

  private generateCalendarDays(): CalendarDay[] {
    const current = this._currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    // Adjust to make Monday = 0
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push(this.createCalendarDay(date, false));
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(this.createCalendarDay(date, true));
    }

    // Next month days to fill the grid (42 days = 6 rows x 7 days)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push(this.createCalendarDay(date, false));
    }

    return days;
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = compareDate.getTime() === today.getTime();

    // Check if this day has events
    const eventsOnDay = this._events().filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === compareDate.getTime();
    });

    return {
      date,
      isCurrentMonth,
      isToday,
      isWeekend,
      hasEvents: eventsOnDay.length > 0,
      eventCount: eventsOnDay.length,
      events: eventsOnDay,
    };
  }

  onDayClick(day: CalendarDay): void {
    this.daySelected.emit(day.date);
  }

  // Get CSS classes for a day cell
  getDayClasses(day: CalendarDay): string[] {
    const classes = ['calendar-month__day'];

    if (!day.isCurrentMonth) {
      classes.push('calendar-month__day--other-month');
    }

    if (day.isToday) {
      classes.push('calendar-month__day--today');
    }

    if (day.isWeekend) {
      classes.push('calendar-month__day--weekend');
    }

    if (day.hasEvents) {
      classes.push('calendar-month__day--has-events');
    }

    return classes;
  }
}
