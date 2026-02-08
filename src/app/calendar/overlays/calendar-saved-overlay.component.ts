import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarOverlayBaseComponent } from './calendar-overlay-base.component';
import { CalendarOverlayService } from '../services/calendar-overlay.service';

interface SavedEvent {
  id: string;
  title: string;
  date: Date;
  type: 'event' | 'birthday' | 'recurring' | 'reminder';
  icon: string;
}

@Component({
  selector: 'app-calendar-saved-overlay',
  standalone: true,
  imports: [CommonModule, CalendarOverlayBaseComponent],
  template: `
    <app-calendar-overlay-base
      title="Salvati"
      [isOpen]="overlayService.isOpen()"
      (closed)="overlayService.close()">

      <div class="saved-overlay">
        <!-- Tabs -->
        <div class="saved-overlay__tabs">
          @for (tab of tabs; track tab.id) {
            <button
              type="button"
              class="saved-overlay__tab"
              [class.saved-overlay__tab--active]="activeTab === tab.id"
              (click)="activeTab = tab.id">
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- Event List -->
        <div class="saved-overlay__list">
          @for (event of filteredEvents; track event.id) {
            <div class="saved-overlay__item">
              <div class="saved-overlay__item-icon">
                <span class="material-icons">{{ event.icon }}</span>
              </div>
              <div class="saved-overlay__item-content">
                <h4 class="saved-overlay__item-title">{{ event.title }}</h4>
                <p class="saved-overlay__item-date">{{ formatDate(event.date) }}</p>
              </div>
              <button type="button" class="saved-overlay__item-action" aria-label="Rimuovi">
                <span class="material-icons">bookmark</span>
              </button>
            </div>
          } @empty {
            <div class="saved-overlay__empty">
              <span class="material-icons">bookmark_border</span>
              <p>Nessun elemento salvato</p>
            </div>
          }
        </div>
      </div>

    </app-calendar-overlay-base>
  `,
  styles: [`
    @import 'src/styles/tokens-figma';

    .saved-overlay {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .saved-overlay__tabs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 8px;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .saved-overlay__tab {
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;

      &:hover {
        border-color: white;
        color: white;
      }

      &--active {
        background: $color-cta-primary;
        border-color: $color-cta-primary;
        color: $color-text-dark;
      }
    }

    .saved-overlay__list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .saved-overlay__item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
    }

    .saved-overlay__item-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;

      .material-icons {
        font-size: 20px;
        color: $color-cta-primary;
      }
    }

    .saved-overlay__item-content {
      flex: 1;
    }

    .saved-overlay__item-title {
      margin: 0 0 4px;
      font-size: 15px;
      font-weight: 600;
    }

    .saved-overlay__item-date {
      margin: 0;
      font-size: 13px;
      opacity: 0.7;
    }

    .saved-overlay__item-action {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: $color-cta-primary;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .saved-overlay__empty {
      text-align: center;
      padding: 40px 20px;
      opacity: 0.7;

      .material-icons {
        font-size: 48px;
        margin-bottom: 12px;
      }

      p {
        margin: 0;
        font-size: 15px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarSavedOverlayComponent {
  overlayService = inject(CalendarOverlayService);

  activeTab: 'all' | 'events' | 'birthdays' | 'recurring' | 'reminders' = 'all';

  tabs = [
    { id: 'all' as const, label: 'Tutti' },
    { id: 'events' as const, label: 'Eventi' },
    { id: 'birthdays' as const, label: 'Compleanni' },
    { id: 'recurring' as const, label: 'Ricorrenti' },
    { id: 'reminders' as const, label: 'Promemoria' },
  ];

  // Mock data
  savedEvents: SavedEvent[] = [
    { id: '1', title: 'Vaccino antirabbia', date: new Date(2026, 1, 15), type: 'event', icon: 'vaccines' },
    { id: '2', title: 'Compleanno di Luna', date: new Date(2026, 2, 8), type: 'birthday', icon: 'cake' },
    { id: '3', title: 'Toelettatura mensile', date: new Date(2026, 0, 25), type: 'recurring', icon: 'repeat' },
    { id: '4', title: 'Comprare crocchette', date: new Date(2026, 0, 20), type: 'reminder', icon: 'notifications' },
  ];

  get filteredEvents(): SavedEvent[] {
    if (this.activeTab === 'all') {
      return this.savedEvents;
    }
    const typeMap: Record<string, SavedEvent['type']> = {
      events: 'event',
      birthdays: 'birthday',
      recurring: 'recurring',
      reminders: 'reminder',
    };
    return this.savedEvents.filter(e => e.type === typeMap[this.activeTab]);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }
}
