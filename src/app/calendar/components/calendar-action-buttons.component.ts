import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarActionButton } from '../services/calendar-overlay.service';

@Component({
  selector: 'app-calendar-action-buttons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="action-buttons">
      <!-- Crea evento -->
      <button
        type="button"
        class="action-buttons__btn"
        [class.action-buttons__btn--active]="activeButton === 'create'"
        (click)="onButtonClick('create')">
        Crea evento
      </button>

      <!-- Eventi -->
      <button
        type="button"
        class="action-buttons__btn"
        [class.action-buttons__btn--active]="activeButton === 'events'"
        (click)="onButtonClick('events')">
        Eventi
      </button>

      <!-- Compleanni in vista -->
      <button
        type="button"
        class="action-buttons__btn"
        [class.action-buttons__btn--active]="activeButton === 'birthdays'"
        (click)="onButtonClick('birthdays')">
        Compleanni in vista
      </button>
    </div>
  `,
  styles: [`
    @import 'src/styles/tokens-figma';

    .action-buttons {
      display: flex;
      flex-direction: row;
      gap: 10px;
      padding: 12px 16px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .action-buttons__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      padding: 12px 18px;
      border-radius: 50px;
      border: none;
      background: $color-cta-primary;
      color: $color-text-dark;
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      &:active {
        transform: scale(0.98);
      }

      &--active {
        background: $color-ai-primary;
        color: white;

        &:hover {
          background: darken($color-ai-primary, 5%);
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarActionButtonsComponent {
  @Input() activeButton: CalendarActionButton = null;
  @Output() buttonClick = new EventEmitter<CalendarActionButton>();

  onButtonClick(button: CalendarActionButton): void {
    this.buttonClick.emit(button);
  }
}
