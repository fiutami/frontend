import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarFilterIcon } from '../services/calendar-overlay.service';

@Component({
  selector: 'app-calendar-filter-icons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="filter-icons">
      <!-- Salvati -->
      <button
        type="button"
        class="filter-icons__btn"
        [class.filter-icons__btn--active]="activeIcon === 'saved'"
        (click)="onIconClick('saved')"
        aria-label="Elementi salvati">
        <span class="material-icons">bookmark</span>
      </button>

      <!-- Calendario -->
      <button
        type="button"
        class="filter-icons__btn"
        [class.filter-icons__btn--active]="activeIcon === 'month'"
        (click)="onIconClick('month')"
        aria-label="Vista calendario">
        <span class="material-icons">calendar_today</span>
      </button>

      <!-- Campanella / Notifiche -->
      <button
        type="button"
        class="filter-icons__btn"
        [class.filter-icons__btn--active]="activeIcon === 'notifications'"
        (click)="onIconClick('notifications')"
        aria-label="Notifiche">
        <span class="material-icons">notifications</span>
        @if (notificationCount > 0) {
          <span class="filter-icons__badge">{{ notificationCount > 99 ? '99+' : notificationCount }}</span>
        }
      </button>
    </div>
  `,
  styles: [`
    @import 'src/styles/tokens-figma';

    .filter-icons {
      display: flex;
      justify-content: center;
      gap: 24px;
      padding: 16px 0;
    }

    .filter-icons__btn {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      .material-icons {
        font-size: 24px;
      }

      &:hover {
        border-color: white;
        color: white;
        transform: scale(1.05);
      }

      &--active {
        background: $color-cta-primary;
        border-color: $color-cta-primary;
        color: white;

        &:hover {
          background: darken($color-cta-primary, 5%);
          border-color: darken($color-cta-primary, 5%);
        }
      }
    }

    .filter-icons__badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      border-radius: 9px;
      background: $color-badge-notification;
      color: white;
      font-size: 11px;
      font-weight: 600;
      font-family: 'Montserrat', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarFilterIconsComponent {
  @Input() activeIcon: CalendarFilterIcon = null;
  @Input() notificationCount = 0;
  @Output() iconClick = new EventEmitter<CalendarFilterIcon>();

  onIconClick(icon: CalendarFilterIcon): void {
    this.iconClick.emit(icon);
  }
}
