import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarOverlayBaseComponent } from './calendar-overlay-base.component';
import { CalendarOverlayService } from '../services/calendar-overlay.service';

interface PublicEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  imageUrl?: string;
  category: string;
}

@Component({
  selector: 'app-calendar-events-overlay',
  standalone: true,
  imports: [CommonModule, CalendarOverlayBaseComponent],
  template: `
    <app-calendar-overlay-base
      title="Eventi"
      [isOpen]="overlayService.isOpen()"
      (closed)="overlayService.close()">

      <div class="events-overlay">
        <!-- Category Filter -->
        <div class="events-overlay__categories">
          @for (cat of categories; track cat.id) {
            <button
              type="button"
              class="events-overlay__category"
              [class.events-overlay__category--active]="activeCategory === cat.id"
              (click)="activeCategory = cat.id">
              <span class="material-icons">{{ cat.icon }}</span>
              <span>{{ cat.label }}</span>
            </button>
          }
        </div>

        <!-- Events List -->
        <div class="events-overlay__list">
          @for (event of filteredEvents; track event.id) {
            <div class="events-overlay__card">
              <div class="events-overlay__card-image">
                @if (event.imageUrl) {
                  <img [src]="event.imageUrl" [alt]="event.title">
                } @else {
                  <span class="material-icons">event</span>
                }
              </div>
              <div class="events-overlay__card-content">
                <span class="events-overlay__card-category">{{ event.category }}</span>
                <h4 class="events-overlay__card-title">{{ event.title }}</h4>
                <p class="events-overlay__card-description">{{ event.description }}</p>
                <div class="events-overlay__card-meta">
                  <span class="events-overlay__card-date">
                    <span class="material-icons">calendar_today</span>
                    {{ formatDate(event.date) }}
                  </span>
                  <span class="events-overlay__card-location">
                    <span class="material-icons">place</span>
                    {{ event.location }}
                  </span>
                </div>
              </div>
              <button type="button" class="events-overlay__card-save" aria-label="Salva">
                <span class="material-icons">bookmark_border</span>
              </button>
            </div>
          } @empty {
            <div class="events-overlay__empty">
              <span class="material-icons">event_busy</span>
              <p>Nessun evento in questa categoria</p>
            </div>
          }
        </div>
      </div>

    </app-calendar-overlay-base>
  `,
  styles: [`
    @import 'src/styles/tokens-figma';

    .events-overlay {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .events-overlay__categories {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 8px;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .events-overlay__category {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;

      .material-icons {
        font-size: 18px;
      }

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

    .events-overlay__list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .events-overlay__card {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      position: relative;
    }

    .events-overlay__card-image {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .material-icons {
        font-size: 32px;
        opacity: 0.5;
      }
    }

    .events-overlay__card-content {
      flex: 1;
      min-width: 0;
    }

    .events-overlay__card-category {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.15);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .events-overlay__card-title {
      margin: 0 0 4px;
      font-size: 15px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .events-overlay__card-description {
      margin: 0 0 8px;
      font-size: 13px;
      opacity: 0.7;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .events-overlay__card-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      opacity: 0.7;
    }

    .events-overlay__card-date,
    .events-overlay__card-location {
      display: flex;
      align-items: center;
      gap: 4px;

      .material-icons {
        font-size: 14px;
      }
    }

    .events-overlay__card-save {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
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
        color: $color-cta-primary;
      }

      .material-icons {
        font-size: 18px;
      }
    }

    .events-overlay__empty {
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
export class CalendarEventsOverlayComponent {
  overlayService = inject(CalendarOverlayService);

  activeCategory = 'all';

  categories = [
    { id: 'all', label: 'Tutti', icon: 'apps' },
    { id: 'fiere', label: 'Fiere', icon: 'storefront' },
    { id: 'mostre', label: 'Mostre', icon: 'pets' },
    { id: 'corsi', label: 'Corsi', icon: 'school' },
  ];

  // Mock data
  events: PublicEvent[] = [
    {
      id: '1',
      title: 'Pet Expo Milano 2026',
      description: 'La fiera internazionale dedicata agli animali domestici',
      location: 'Milano, Fiera',
      date: new Date(2026, 2, 15),
      category: 'Fiere',
    },
    {
      id: '2',
      title: 'Mostra Canina Nazionale',
      description: 'Esposizione delle migliori razze canine italiane',
      location: 'Roma, EUR',
      date: new Date(2026, 3, 8),
      category: 'Mostre',
    },
    {
      id: '3',
      title: 'Corso di Primo Soccorso Pet',
      description: 'Impara a gestire le emergenze del tuo animale',
      location: 'Torino',
      date: new Date(2026, 1, 22),
      category: 'Corsi',
    },
    {
      id: '4',
      title: 'Zoomark Bologna',
      description: 'Fiera internazionale del pet food e accessori',
      location: 'Bologna, Quartiere Fieristico',
      date: new Date(2026, 4, 10),
      category: 'Fiere',
    },
  ];

  get filteredEvents(): PublicEvent[] {
    if (this.activeCategory === 'all') {
      return this.events;
    }
    const categoryMap: Record<string, string> = {
      fiere: 'Fiere',
      mostre: 'Mostre',
      corsi: 'Corsi',
    };
    return this.events.filter(e => e.category === categoryMap[this.activeCategory]);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
