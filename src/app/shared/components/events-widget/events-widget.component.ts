import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EventItem {
  id?: string;
  title: string;
  date: string;
  icon?: string;
}

/**
 * EventsWidget - Shows upcoming events in a card
 *
 * Features:
 * - Title header with optional notification bell
 * - List of events with title and date
 * - Empty state message
 * - Click handler for events
 */
@Component({
  selector: 'app-events-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events-widget.component.html',
  styleUrls: ['./events-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsWidgetComponent {
  @Input() title = 'Prossimi eventi';
  @Input() events: EventItem[] = [];
  @Input() emptyMessage = "Non c'è nessun evento in programma.";
  @Input() maxItems = 5;
  @Input() showNotificationBell = false;
  @Input() notificationCount = 0;

  @Output() eventClick = new EventEmitter<EventItem>();
  @Output() viewAllClick = new EventEmitter<void>();
  @Output() notificationClick = new EventEmitter<void>();

  get displayedEvents(): EventItem[] {
    return this.events.slice(0, this.maxItems);
  }

  get hasMoreEvents(): boolean {
    return this.events.length > this.maxItems;
  }

  onEventClick(event: EventItem): void {
    this.eventClick.emit(event);
  }

  onViewAll(): void {
    this.viewAllClick.emit();
  }

  onNotificationClick(): void {
    this.notificationClick.emit();
  }
}
