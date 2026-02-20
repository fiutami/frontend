import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { TabPageShellBlueComponent } from '../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';
import { MascotBottomSheetComponent } from '../../shared/components/mascot-bottom-sheet/mascot-bottom-sheet.component';
import { CalendarOverlayService } from '../services/calendar-overlay.service';
import { CalendarEventService } from '../../core/services/calendar-event.service';
import { CalendarEvent } from '../../core/models/calendar.models';

// Overlay components
import { CalendarCreateEventOverlayComponent } from '../overlays/calendar-create-event-overlay.component';
import { CalendarDayEventsOverlayComponent } from '../overlays/calendar-day-events-overlay.component';
import { CalendarEventsOverlayComponent } from '../overlays/calendar-events-overlay.component';
import { CalendarBirthdaysOverlayComponent } from '../overlays/calendar-birthdays-overlay.component';
import { CalendarSavedOverlayComponent } from '../overlays/calendar-saved-overlay.component';
import { CalendarMonthOverlayComponent } from '../overlays/calendar-month-overlay.component';
import { CalendarNotificationsOverlayComponent } from '../overlays/calendar-notifications-overlay.component';

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

const MONTH_NAMES_LOWER = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const DAY_NAMES = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];
const DAY_NAMES_FULL = ['DOMENICA', 'LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI', 'SABATO'];

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    TabPageShellBlueComponent,
    MascotBottomSheetComponent,
    // Overlay components
    CalendarCreateEventOverlayComponent,
    CalendarDayEventsOverlayComponent,
    CalendarEventsOverlayComponent,
    CalendarBirthdaysOverlayComponent,
    CalendarSavedOverlayComponent,
    CalendarMonthOverlayComponent,
    CalendarNotificationsOverlayComponent,
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarViewComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly overlayService = inject(CalendarOverlayService);
  protected readonly calendarEventService = inject(CalendarEventService);

  /** Day names for header */
  protected readonly dayNames = DAY_NAMES;

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

  // ===========================================
  // TODAY INFO (Blocco Info Sinistra)
  // ===========================================

  protected todayDayName = computed(() => DAY_NAMES_FULL[this.today().getDay()]);
  protected todayDayNumber = computed(() => this.today().getDate().toString().padStart(2, '0'));
  protected todayMonthYear = computed(() => {
    const month = MONTH_NAMES_LOWER[this.today().getMonth()];
    return `${month} ${this.today().getFullYear()}`;
  });

  // ===========================================
  // EVENTS STATUS (Blocco Info Destra)
  // ===========================================

  protected monthEventsCount = computed(() => this.calendarEventService.events().length);

  protected eventsStatusText = computed(() => {
    const count = this.monthEventsCount();
    if (count === 0) return 'Nessun evento questo mese';
    if (count === 1) return 'Hai 1 evento questo mese';
    return `Hai ${count} eventi questo mese`;
  });

  // ===========================================
  // MONTH NAVIGATION
  // ===========================================

  protected currentMonthName = computed(() => MONTH_NAMES[this.currentDate().getMonth()]);
  protected currentYear = computed(() => this.currentDate().getFullYear());

  /** Calendar days grid (42 days = 6 weeks) */
  protected calendarDays = computed(() => this.generateCalendarDays());

  /** Events for selected day */
  protected selectedDayEvents = computed(() => {
    const selected = this.selectedDate();
    return this.calendarEventService.getEventsForDate(selected);
  });

  constructor() {
    // Reload events when month changes
    effect(() => {
      const date = this.currentDate();
      this.calendarEventService.getMonthEvents(date.getFullYear(), date.getMonth());
    });
  }

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
    // If day has events, open day events overlay
    if (day.events.length > 0) {
      this.overlayService.openDayEvents(day.date);
    }
  }

  onBack(): void {
    this.router.navigate(['/home/calendar']);
  }

  // ===========================================
  // OVERLAY METHODS
  // ===========================================

  openEventsOverlay(): void {
    this.overlayService.openEvents();
  }

  openCreateEventOverlay(): void {
    this.overlayService.openCreateEvent(this.selectedDate());
  }

  // ===========================================
  // MASCOT METHODS
  // ===========================================

  onMascotClick(): void {
    this.showMascotSheet.set(true);
  }

  closeMascotSheet(): void {
    this.showMascotSheet.set(false);
  }

  // ===========================================
  // PROMO CAROUSEL METHODS
  // ===========================================

  setPromoSlide(index: number): void {
    this.currentPromoSlide.set(index);
    this.stopPromoAutoAdvance();
    this.startPromoAutoAdvance();
  }

  private startPromoAutoAdvance(): void {
    this.promoInterval = setInterval(() => {
      const current = this.currentPromoSlide();
      this.currentPromoSlide.set((current + 1) % this.promoSlides.length);
    }, 5000);
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

  getEventColor(event: CalendarEvent): string {
    return event.color ?? '#4A74F0';
  }

  formatEventTime(event: CalendarEvent): string {
    const d = new Date(event.startDate);
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
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
    const todayDate = new Date();
    const selected = this.selectedDate();
    const apiEvents = this.calendarEventService.events();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(this.createCalendarDay(date, false, todayDate, selected, apiEvents));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push(this.createCalendarDay(date, true, todayDate, selected, apiEvents));
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(this.createCalendarDay(date, false, todayDate, selected, apiEvents));
    }

    return days;
  }

  private createCalendarDay(
    date: Date,
    isCurrentMonth: boolean,
    today: Date,
    selected: Date,
    allEvents: CalendarEvent[]
  ): CalendarDay {
    const dayEvents = allEvents.filter(ev => {
      const evDate = new Date(ev.startDate);
      return this.isSameDay(evDate, date);
    });

    return {
      date,
      dayOfMonth: date.getDate(),
      isCurrentMonth,
      isToday: this.isSameDay(date, today),
      isSelected: this.isSameDay(date, selected),
      events: dayEvents,
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
