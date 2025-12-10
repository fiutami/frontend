import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CalendarMonthComponent } from './calendar-month/calendar-month.component';
import { EventCreateComponent } from './event-create/event-create.component';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'appointment' | 'reminder' | 'activity';
  color: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, CalendarMonthComponent, EventCreateComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
  // Current date state
  currentDate = signal(new Date());

  // Computed values for display
  currentMonth = computed(() => {
    const date = this.currentDate();
    return date.toLocaleString('it-IT', { month: 'long' });
  });

  currentYear = computed(() => this.currentDate().getFullYear());

  // Event creation modal state
  showEventModal = signal(false);

  // Mock events data
  events = signal<CalendarEvent[]>([
    {
      id: '1',
      title: 'Visita veterinaria',
      date: new Date(2025, 11, 15, 10, 0),
      type: 'appointment',
      color: '#4A74F0',
    },
    {
      id: '2',
      title: 'Vaccino annuale',
      date: new Date(2025, 11, 20, 14, 30),
      type: 'reminder',
      color: '#F5A623',
    },
    {
      id: '3',
      title: 'Toelettatura',
      date: new Date(2025, 11, 25, 11, 0),
      type: 'activity',
      color: '#43A047',
    },
    {
      id: '4',
      title: 'Controllo parassiti',
      date: new Date(2025, 11, 10, 9, 0),
      type: 'reminder',
      color: '#F5A623',
    },
  ]);

  // Navigation methods
  goToPreviousMonth(): void {
    const current = this.currentDate();
    const newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.currentDate.set(newDate);
  }

  goToNextMonth(): void {
    const current = this.currentDate();
    const newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.currentDate.set(newDate);
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  // Event modal methods
  openEventModal(): void {
    this.showEventModal.set(true);
  }

  closeEventModal(): void {
    this.showEventModal.set(false);
  }

  onEventCreated(event: Partial<CalendarEvent>): void {
    // In real app, this would call a service to persist the event
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: event.title || 'Nuovo evento',
      date: event.date || new Date(),
      type: event.type || 'activity',
      color: event.color || '#4A74F0',
    };

    this.events.update(events => [...events, newEvent]);
    this.closeEventModal();
  }

  // Get events for current month
  getEventsForCurrentMonth(): CalendarEvent[] {
    const current = this.currentDate();
    return this.events().filter(event => {
      return (
        event.date.getFullYear() === current.getFullYear() &&
        event.date.getMonth() === current.getMonth()
      );
    });
  }

  // Handle day selection
  onDaySelected(date: Date): void {
    const eventsOnDay = this.events().filter(event => {
      return (
        event.date.getFullYear() === date.getFullYear() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getDate() === date.getDate()
      );
    });

    if (eventsOnDay.length > 0) {
      console.log('Events on', date, ':', eventsOnDay);
      // In real app, show day detail view with events
    }
  }

  // Navigation
  goBack(): void {
    window.history.back();
  }
}
