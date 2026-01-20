import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarOverlayBaseComponent } from './calendar-overlay-base.component';
import { CalendarOverlayService } from '../services/calendar-overlay.service';

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvent: boolean;
}

@Component({
  selector: 'app-calendar-month-overlay',
  standalone: true,
  imports: [CommonModule, CalendarOverlayBaseComponent],
  template: `
    <app-calendar-overlay-base
      title="Calendario"
      [isOpen]="overlayService.isOpen()"
      (closed)="overlayService.close()">

      <div class="month-overlay">
        <!-- Month/Year Navigation -->
        <div class="month-overlay__nav">
          <button type="button" class="month-overlay__nav-btn" (click)="prevMonth()">
            <span class="material-icons">chevron_left</span>
          </button>
          <h3 class="month-overlay__month-year">{{ monthYearLabel() }}</h3>
          <button type="button" class="month-overlay__nav-btn" (click)="nextMonth()">
            <span class="material-icons">chevron_right</span>
          </button>
        </div>

        <!-- Weekday Headers -->
        <div class="month-overlay__weekdays">
          @for (day of weekdays; track day) {
            <span class="month-overlay__weekday">{{ day }}</span>
          }
        </div>

        <!-- Calendar Grid -->
        <div class="month-overlay__grid">
          @for (day of calendarDays(); track $index) {
            <button
              type="button"
              class="month-overlay__day"
              [class.month-overlay__day--other]="!day.isCurrentMonth"
              [class.month-overlay__day--today]="day.isToday"
              [class.month-overlay__day--event]="day.hasEvent"
              [disabled]="!day.isCurrentMonth">
              {{ day.date }}
              @if (day.hasEvent) {
                <span class="month-overlay__day-dot"></span>
              }
            </button>
          }
        </div>
      </div>

    </app-calendar-overlay-base>
  `,
  styles: [`
    @import 'src/styles/tokens-figma';

    .month-overlay {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .month-overlay__nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .month-overlay__nav-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.15);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
      }
    }

    .month-overlay__month-year {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      text-transform: capitalize;
    }

    .month-overlay__weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      text-align: center;
    }

    .month-overlay__weekday {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      opacity: 0.7;
      padding: 8px 0;
    }

    .month-overlay__grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .month-overlay__day {
      position: relative;
      aspect-ratio: 1;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.15);
      }

      &--other {
        opacity: 0.3;
        cursor: default;
      }

      &--today {
        background: $color-cta-primary;
        color: $color-text-dark;
        font-weight: 700;

        &:hover {
          background: darken($color-cta-primary, 5%);
        }
      }

      &--event {
        font-weight: 600;
      }
    }

    .month-overlay__day-dot {
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: $color-cta-primary;

      .month-overlay__day--today & {
        background: $color-text-dark;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarMonthOverlayComponent {
  overlayService = inject(CalendarOverlayService);

  weekdays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  private monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());

  // Mock events (days with events)
  private eventDays = new Set([5, 12, 18, 25]);

  monthYearLabel = computed(() => {
    return `${this.monthNames[this.currentMonth()]} ${this.currentYear()}`;
  });

  calendarDays = computed((): CalendarDay[] => {
    const month = this.currentMonth();
    const year = this.currentYear();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get Monday-based first day of week (0 = Mon, 6 = Sun)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: CalendarDay[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false,
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const isToday = today.getDate() === i &&
                      today.getMonth() === month &&
                      today.getFullYear() === year;
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday,
        hasEvent: this.eventDays.has(i),
      });
    }

    // Next month days (fill to 42 cells = 6 weeks)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false,
      });
    }

    return days;
  });

  prevMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
  }
}
