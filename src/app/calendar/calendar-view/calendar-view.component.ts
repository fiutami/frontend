import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TabPageShellBlueComponent } from '../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';
import { MascotBottomSheetComponent } from '../../shared/components/mascot-bottom-sheet/mascot-bottom-sheet.component';
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
 * Promo slide interface
 */
export interface PromoSlide {
  id: string;
  type: 'tracker' | 'match' | 'premium';
  title: string;
  description: string;
  badge?: string;
}

/**
 * Month names in Italian
 */
const MONTH_NAMES = [
  'GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO',
  'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'
];

/**
 * Month names in Italian (lowercase for display)
 */
const MONTH_NAMES_LOWER = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

/**
 * Day names in Italian (short)
 */
const DAY_NAMES = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];

/**
 * Day names in Italian (full)
 */
const DAY_NAMES_FULL = ['DOMENICA', 'LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI', 'SABATO'];

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
 * UX Corrections applied:
 * - Fixed section (header + logo + info block) that doesn't scroll
 * - Scrollable section (month title + grid + events + promo carousel)
 * - "Crea evento" button is WHITE (not yellow)
 * - Events status text is clickable → opens events overlay
 * - Removed notification bell icon
 * - Added promo carousel at bottom
 */
@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, SharedModule, TabPageShellBlueComponent, MascotBottomSheetComponent],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarViewComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly overlayService = inject(CalendarOverlayService);

  /** Day names for header */
  protected readonly dayNames = DAY_NAMES;

  /** Event colors map */
  protected readonly eventColors = EVENT_COLORS;

  /** Current displayed date (month/year) */
  protected currentDate = signal(new Date());

  /** Selected date */
  protected selectedDate = signal(new Date());

  /** Today's date (fixed reference) */
  protected readonly today = signal(new Date());

  /** Promo carousel current slide */
  protected currentPromoSlide = signal(0);

  /** Mascot bottom sheet visibility */
  protected showMascotSheet = signal(false);

  /** Promo carousel auto-advance interval */
  private promoInterval: ReturnType<typeof setInterval> | null = null;

  /** Promo slides data */
  protected readonly promoSlides: PromoSlide[] = [
    {
      id: 'tracker',
      type: 'tracker',
      title: 'FIUTAMI Tracker',
      description: 'Monitora il tuo animale in tempo reale',
      badge: 'Coming Soon',
    },
    {
      id: 'match',
      type: 'match',
      title: 'FIUTAMI Match',
      description: 'Trova il compagno perfetto per il tuo pet',
      badge: 'Presto',
    },
    {
      id: 'premium',
      type: 'premium',
      title: 'Diventa Premium',
      description: 'Sblocca tutte le funzionalità esclusive',
    },
  ];

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

  // ===========================================
  // TODAY INFO (Blocco Info Sinistra)
  // ===========================================

  /** Today's day name (es. "DOMENICA") */
  protected todayDayName = computed(() => {
    return DAY_NAMES_FULL[this.today().getDay()];
  });

  /** Today's day number (es. "03") */
  protected todayDayNumber = computed(() => {
    return this.today().getDate().toString().padStart(2, '0');
  });

  /** Today's month and year (es. "Febbraio 2026") */
  protected todayMonthYear = computed(() => {
    const month = MONTH_NAMES_LOWER[this.today().getMonth()];
    const year = this.today().getFullYear();
    return `${month} ${year}`;
  });

  // ===========================================
  // EVENTS STATUS (Blocco Info Destra)
  // ===========================================

  /** Count of events in current displayed month */
  protected monthEventsCount = computed(() => {
    const current = this.currentDate();
    const month = current.getMonth();
    const year = current.getFullYear();
    return this.mockEvents().filter(event => {
      return event.date.getMonth() === month && event.date.getFullYear() === year;
    }).length;
  });

  /** Events status text for display */
  protected eventsStatusText = computed(() => {
    const count = this.monthEventsCount();
    if (count === 0) {
      return 'Nessun evento questo mese';
    } else if (count === 1) {
      return 'Hai 1 evento questo mese';
    } else {
      return `Hai ${count} eventi questo mese`;
    }
  });

  // ===========================================
  // MONTH NAVIGATION
  // ===========================================

  /** Current month name (font Moul) */
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

  // ===========================================
  // LIFECYCLE
  // ===========================================

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

    // Start promo carousel auto-advance
    this.startPromoAutoAdvance();
  }

  ngOnDestroy(): void {
    this.stopPromoAutoAdvance();
  }

  // ===========================================
  // NAVIGATION METHODS
  // ===========================================

  prevMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  selectDay(day: CalendarDay): void {
    this.selectedDate.set(day.date);
  }

  onBack(): void {
    this.router.navigate(['/home/calendar']);
  }

  // ===========================================
  // OVERLAY METHODS
  // ===========================================

  /** Open events overlay (triggered by clicking events status text) */
  openEventsOverlay(): void {
    this.overlayService.openEvents();
  }

  /** Open create event overlay */
  openCreateEventOverlay(): void {
    this.overlayService.openCreateEvent();
  }

  /** View event details (placeholder) */
  onEventClick(event: CalendarEvent): void {
    console.log('Event clicked:', event);
  }

  // ===========================================
  // MASCOT METHODS
  // ===========================================

  /** Handle mascot peek click - open bottom sheet */
  onMascotClick(): void {
    this.showMascotSheet.set(true);
  }

  /** Close mascot bottom sheet */
  closeMascotSheet(): void {
    this.showMascotSheet.set(false);
  }

  // ===========================================
  // PROMO CAROUSEL METHODS
  // ===========================================

  setPromoSlide(index: number): void {
    this.currentPromoSlide.set(index);
    // Reset auto-advance timer
    this.stopPromoAutoAdvance();
    this.startPromoAutoAdvance();
  }

  private startPromoAutoAdvance(): void {
    this.promoInterval = setInterval(() => {
      const current = this.currentPromoSlide();
      const next = (current + 1) % this.promoSlides.length;
      this.currentPromoSlide.set(next);
    }, 5000); // 5 seconds
  }

  private stopPromoAutoAdvance(): void {
    if (this.promoInterval) {
      clearInterval(this.promoInterval);
      this.promoInterval = null;
    }
  }

  // ===========================================
  // HELPER METHODS
  // ===========================================

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

  trackByDay(index: number, day: CalendarDay): string {
    return day.date.toISOString();
  }

  trackByEvent(index: number, event: CalendarEvent): string {
    return event.id;
  }

  private generateCalendarDays(): CalendarDay[] {
    const days: CalendarDay[] = [];
    const current = this.currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();
    const today = new Date();
    const selected = this.selectedDate();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(this.createCalendarDay(date, false, today, selected));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push(this.createCalendarDay(date, true, today, selected));
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(this.createCalendarDay(date, false, today, selected));
    }

    return days;
  }

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

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
}
