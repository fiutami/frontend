import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  CalendarEvent,
  CalendarEventCreate,
  CalendarEventUpdate,
} from '../models/calendar.models';

/**
 * Service for calendar event CRUD operations.
 * Communicates with /api/event backend endpoints.
 * Signal-based state for reactive UI binding.
 */
@Injectable({ providedIn: 'root' })
export class CalendarEventService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/event';

  /** Currently loaded events for the displayed month */
  readonly events = signal<CalendarEvent[]>([]);

  /** Currently loaded month/year for cache invalidation */
  private loadedMonth = signal<{ year: number; month: number } | null>(null);

  /** Loading state */
  readonly loading = signal(false);

  /** Events grouped by day-of-month (1-indexed) for fast lookup */
  readonly eventsByDay = computed(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const ev of this.events()) {
      const d = new Date(ev.startDate).getDate();
      const existing = map.get(d) ?? [];
      existing.push(ev);
      map.set(d, existing);
    }
    return map;
  });

  /**
   * Load events for a specific month.
   * Skips fetch if same month is already loaded (use forceRefresh to override).
   */
  async getMonthEvents(year: number, month: number, forceRefresh = false): Promise<CalendarEvent[]> {
    const loaded = this.loadedMonth();
    if (!forceRefresh && loaded && loaded.year === year && loaded.month === month) {
      return this.events();
    }

    this.loading.set(true);
    try {
      // Backend expects 1-indexed month
      const apiMonth = month + 1;
      const data = await firstValueFrom(
        this.http.get<CalendarEvent[]>(`${this.baseUrl}`, {
          params: { year: year.toString(), month: apiMonth.toString() },
        })
      );
      const events = data ?? [];
      this.events.set(events);
      this.loadedMonth.set({ year, month });
      return events;
    } catch (err) {
      console.error('[CalendarEventService] getMonthEvents error:', err);
      this.events.set([]);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  /** Refresh the currently loaded month */
  async refreshCurrentMonth(): Promise<CalendarEvent[]> {
    const loaded = this.loadedMonth();
    if (!loaded) return [];
    return this.getMonthEvents(loaded.year, loaded.month, true);
  }

  /** Get a single event by ID */
  async getEvent(id: string): Promise<CalendarEvent | null> {
    try {
      return await firstValueFrom(
        this.http.get<CalendarEvent>(`${this.baseUrl}/${id}`)
      );
    } catch (err) {
      console.error('[CalendarEventService] getEvent error:', err);
      return null;
    }
  }

  /** Create a new event */
  async createEvent(data: CalendarEventCreate): Promise<CalendarEvent | null> {
    try {
      const result = await firstValueFrom(
        this.http.post<CalendarEvent>(this.baseUrl, data)
      );
      await this.refreshCurrentMonth();
      return result;
    } catch (err) {
      console.error('[CalendarEventService] createEvent error:', err);
      return null;
    }
  }

  /** Update an existing event */
  async updateEvent(id: string, data: CalendarEventUpdate): Promise<CalendarEvent | null> {
    try {
      const result = await firstValueFrom(
        this.http.put<CalendarEvent>(`${this.baseUrl}/${id}`, data)
      );
      await this.refreshCurrentMonth();
      return result;
    } catch (err) {
      console.error('[CalendarEventService] updateEvent error:', err);
      return null;
    }
  }

  /** Delete an event (soft delete on backend) */
  async deleteEvent(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.baseUrl}/${id}`)
      );
      await this.refreshCurrentMonth();
      return true;
    } catch (err) {
      console.error('[CalendarEventService] deleteEvent error:', err);
      return false;
    }
  }

  /** Get events for a specific date from the loaded month */
  getEventsForDate(date: Date): CalendarEvent[] {
    return this.events().filter(ev => {
      const evDate = new Date(ev.startDate);
      return (
        evDate.getDate() === date.getDate() &&
        evDate.getMonth() === date.getMonth() &&
        evDate.getFullYear() === date.getFullYear()
      );
    });
  }

  /** Check if a day has events */
  dayHasEvents(dayOfMonth: number): boolean {
    return this.eventsByDay().has(dayOfMonth);
  }

  /** Get first event color for a day (for dot indicator) */
  getDayColor(dayOfMonth: number): string {
    const dayEvents = this.eventsByDay().get(dayOfMonth);
    if (!dayEvents?.length) return '#4A74F0';
    return dayEvents[0].color ?? '#4A74F0';
  }
}
