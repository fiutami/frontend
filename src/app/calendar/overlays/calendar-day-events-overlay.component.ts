import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarOverlayBaseComponent } from './calendar-overlay-base.component';
import { CalendarOverlayService } from '../services/calendar-overlay.service';
import { CalendarEventService } from '../../core/services/calendar-event.service';
import { CalendarEvent } from '../../core/models/calendar.models';

@Component({
  selector: 'app-calendar-day-events-overlay',
  standalone: true,
  imports: [CommonModule, TranslateModule, CalendarOverlayBaseComponent],
  template: `
    <app-calendar-overlay-base
      [title]="headerTitle()"
      [isOpen]="overlayService.isOpen()"
      (closed)="overlayService.close()">

      <div class="day-events">
        @if (dayEvents().length === 0) {
          <div class="day-events__empty">
            <span class="material-icons day-events__empty-icon">event_busy</span>
            <p class="day-events__empty-text">{{ 'calendar.dayEvents.noEvents' | translate }}</p>
          </div>
        } @else {
          <div class="day-events__list">
            @for (event of dayEvents(); track event.id) {
              <div class="day-events__card" (click)="toggleExpand(event.id)">
                <div class="day-events__card-header">
                  <div
                    class="day-events__card-dot"
                    [style.background-color]="event.color ?? '#4A74F0'">
                  </div>
                  <div class="day-events__card-info">
                    <span class="day-events__card-title">{{ event.title }}</span>
                    <span class="day-events__card-meta">
                      {{ formatTime(event.startDate) }}
                      @if (event.location) {
                        <span> &middot; {{ event.location }}</span>
                      }
                    </span>
                  </div>
                  <span class="material-icons day-events__card-chevron"
                    [class.day-events__card-chevron--expanded]="expandedId() === event.id">
                    expand_more
                  </span>
                </div>

                @if (expandedId() === event.id) {
                  <div class="day-events__card-detail">
                    @if (event.phone) {
                      <div class="day-events__detail-row">
                        <span class="material-icons">phone</span>
                        <a [href]="'tel:' + event.phone" class="day-events__detail-link" (click)="$event.stopPropagation()">
                          {{ event.phone }}
                        </a>
                      </div>
                    }
                    @if (event.recurrenceRule) {
                      <div class="day-events__detail-row">
                        <span class="material-icons">repeat</span>
                        <span>{{ formatRecurrence(event.recurrenceRule) }}</span>
                      </div>
                    }
                    <div class="day-events__card-actions">
                      <button
                        class="day-events__action-btn day-events__action-btn--edit"
                        (click)="onEdit(event, $event)">
                        <span class="material-icons">edit</span>
                        {{ 'calendar.dayEvents.edit' | translate }}
                      </button>
                      <button
                        class="day-events__action-btn day-events__action-btn--delete"
                        (click)="onDelete(event, $event)">
                        <span class="material-icons">delete</span>
                        {{ 'calendar.dayEvents.delete' | translate }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Add event button -->
        <button class="day-events__add-btn" (click)="onAddEvent()">
          <span class="material-icons">add</span>
          {{ 'calendar.dayEvents.addEvent' | translate }}
        </button>
      </div>

      <!-- Delete confirmation -->
      @if (confirmDeleteId()) {
        <div class="day-events__confirm-backdrop" (click)="confirmDeleteId.set(null)">
          <div class="day-events__confirm-dialog" (click)="$event.stopPropagation()">
            <p>{{ 'calendar.dayEvents.deleteConfirm' | translate }}</p>
            <div class="day-events__confirm-actions">
              <button class="day-events__confirm-btn day-events__confirm-btn--cancel"
                (click)="confirmDeleteId.set(null)">
                {{ 'calendar.cancel' | translate }}
              </button>
              <button class="day-events__confirm-btn day-events__confirm-btn--delete"
                (click)="confirmDelete()">
                {{ 'calendar.dayEvents.delete' | translate }}
              </button>
            </div>
          </div>
        </div>
      }

    </app-calendar-overlay-base>
  `,
  styles: [`
    @import 'src/styles/tokens-figma';

    .day-events {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .day-events__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 32px 0;
    }

    .day-events__empty-icon {
      font-size: 48px;
      opacity: 0.4;
    }

    .day-events__empty-text {
      margin: 0;
      font-size: 15px;
      opacity: 0.7;
    }

    .day-events__list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .day-events__card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s ease;
      overflow: hidden;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }
    }

    .day-events__card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
    }

    .day-events__card-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .day-events__card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .day-events__card-title {
      font-weight: 600;
      font-size: 15px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .day-events__card-meta {
      font-size: 13px;
      opacity: 0.7;
    }

    .day-events__card-chevron {
      font-size: 24px;
      opacity: 0.6;
      transition: transform 0.2s ease;

      &--expanded {
        transform: rotate(180deg);
      }
    }

    .day-events__card-detail {
      padding: 0 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 10px;
      margin: 0 16px;
    }

    .day-events__detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      opacity: 0.85;

      .material-icons {
        font-size: 18px;
        opacity: 0.6;
      }
    }

    .day-events__detail-link {
      color: white;
      text-decoration: underline;
    }

    .day-events__card-actions {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }

    .day-events__action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: transparent;
      color: white;
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      .material-icons { font-size: 16px; }

      &--edit:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: white;
      }

      &--delete {
        border-color: #FF6B6B;
        color: #FF6B6B;

        &:hover {
          background: rgba(255, 107, 107, 0.15);
        }
      }
    }

    .day-events__add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      border-radius: 50px;
      border: 2px dashed rgba(255, 255, 255, 0.3);
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
      font-family: 'Montserrat', sans-serif;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      .material-icons { font-size: 20px; }

      &:hover {
        border-color: white;
        color: white;
        background: rgba(255, 255, 255, 0.05);
      }
    }

    .day-events__confirm-backdrop {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .day-events__confirm-dialog {
      background: #3B5EC4;
      border-radius: 16px;
      padding: 24px;
      max-width: 320px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

      p {
        margin: 0 0 20px;
        font-size: 15px;
        color: white;
        text-align: center;
      }
    }

    .day-events__confirm-actions {
      display: flex;
      gap: 12px;
    }

    .day-events__confirm-btn {
      flex: 1;
      padding: 12px;
      border-radius: 25px;
      border: none;
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &--cancel {
        background: rgba(255, 255, 255, 0.15);
        color: white;

        &:hover { background: rgba(255, 255, 255, 0.25); }
      }

      &--delete {
        background: #FF6B6B;
        color: white;

        &:hover { background: #E55555; }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDayEventsOverlayComponent {
  protected readonly overlayService = inject(CalendarOverlayService);
  private readonly calendarEventService = inject(CalendarEventService);

  protected readonly expandedId = signal<string | null>(null);
  protected readonly confirmDeleteId = signal<string | null>(null);

  protected readonly dayEvents = computed(() => {
    const date = this.overlayService.selectedDate();
    if (!date) return [];
    return this.calendarEventService.getEventsForDate(date);
  });

  protected readonly headerTitle = computed(() => {
    const date = this.overlayService.selectedDate();
    if (!date) return '';
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  });

  protected toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  protected formatTime(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  protected formatRecurrence(rrule: string): string {
    if (rrule.includes('FREQ=DAILY')) return 'Ogni giorno';
    if (rrule.includes('FREQ=WEEKLY')) return 'Ogni settimana';
    if (rrule.includes('FREQ=MONTHLY')) return 'Ogni mese';
    if (rrule.includes('FREQ=YEARLY')) return 'Ogni anno';
    return rrule;
  }

  protected onEdit(event: CalendarEvent, e: MouseEvent): void {
    e.stopPropagation();
    const date = this.overlayService.selectedDate();
    this.overlayService.openCreateEvent(date ?? undefined, event.id);
  }

  protected onDelete(event: CalendarEvent, e: MouseEvent): void {
    e.stopPropagation();
    this.confirmDeleteId.set(event.id);
  }

  protected async confirmDelete(): Promise<void> {
    const id = this.confirmDeleteId();
    if (!id) return;
    await this.calendarEventService.deleteEvent(id);
    this.confirmDeleteId.set(null);
    this.expandedId.set(null);

    // If no more events for this day, close overlay
    if (this.dayEvents().length === 0) {
      this.overlayService.close();
    }
  }

  protected onAddEvent(): void {
    const date = this.overlayService.selectedDate();
    this.overlayService.openCreateEvent(date ?? undefined);
  }
}
