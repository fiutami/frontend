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
        <span class="material-icons">add</span>
        <span class="action-buttons__label">Crea evento</span>
      </button>

      <!-- Eventi -->
      <button
        type="button"
        class="action-buttons__btn"
        [class.action-buttons__btn--active]="activeButton === 'events'"
        (click)="onButtonClick('events')">
        <span class="material-icons">event</span>
        <span class="action-buttons__label">Eventi</span>
      </button>

      <!-- Compleanni in vista -->
      <button
        type="button"
        class="action-buttons__btn"
        [class.action-buttons__btn--active]="activeButton === 'birthdays'"
        (click)="onButtonClick('birthdays')">
        <span class="material-icons">cake</span>
        <span class="action-buttons__label">Compleanni in vista</span>
      </button>
    </div>
  `,
  styles: [`
    @import 'src/styles/tokens-figma';

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 20px;
    }

    .action-buttons__btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 14px 20px;
      border-radius: 50px;
      border: none;
      background: $color-cta-primary;
      color: $color-text-dark;
      font-family: 'Montserrat', sans-serif;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      .material-icons {
        font-size: 22px;
      }

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

    .action-buttons__label {
      flex: 1;
      text-align: left;
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
