import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarOverlayBaseComponent } from './calendar-overlay-base.component';
import { CalendarOverlayService } from '../services/calendar-overlay.service';

type RepetitionType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

@Component({
  selector: 'app-calendar-create-event-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarOverlayBaseComponent],
  template: `
    <app-calendar-overlay-base
      title="Crea evento"
      [isOpen]="overlayService.isOpen()"
      (closed)="overlayService.close()">

      <form class="create-event" (ngSubmit)="onSubmit()">
        <!-- Nome evento -->
        <div class="create-event__field">
          <label class="create-event__label">Nome evento</label>
          <input
            type="text"
            class="create-event__input"
            placeholder="Es. Visita veterinario"
            [(ngModel)]="eventName"
            name="eventName"
            required>
        </div>

        <!-- Luogo -->
        <div class="create-event__field">
          <label class="create-event__label">Luogo</label>
          <div class="create-event__input-icon">
            <span class="material-icons">place</span>
            <input
              type="text"
              class="create-event__input create-event__input--with-icon"
              placeholder="Es. Via Roma 123, Milano"
              [(ngModel)]="eventLocation"
              name="eventLocation">
          </div>
        </div>

        <!-- Data e Ora -->
        <div class="create-event__row">
          <div class="create-event__field create-event__field--half">
            <label class="create-event__label">Data</label>
            <input
              type="date"
              class="create-event__input"
              [(ngModel)]="eventDate"
              name="eventDate"
              required>
          </div>
          <div class="create-event__field create-event__field--half">
            <label class="create-event__label">Ora</label>
            <input
              type="time"
              class="create-event__input"
              [(ngModel)]="eventTime"
              name="eventTime">
          </div>
        </div>

        <!-- Numero (telefono/riferimento) -->
        <div class="create-event__field">
          <label class="create-event__label">Numero (opzionale)</label>
          <div class="create-event__input-icon">
            <span class="material-icons">phone</span>
            <input
              type="tel"
              class="create-event__input create-event__input--with-icon"
              placeholder="Es. +39 02 1234567"
              [(ngModel)]="eventPhone"
              name="eventPhone">
          </div>
        </div>

        <!-- Ripetizione -->
        <div class="create-event__field">
          <label class="create-event__label">Ripetizione</label>
          <div class="create-event__repetition">
            @for (option of repetitionOptions; track option.value) {
              <button
                type="button"
                class="create-event__repetition-btn"
                [class.create-event__repetition-btn--active]="repetition() === option.value"
                (click)="repetition.set(option.value)">
                {{ option.label }}
              </button>
            }
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="create-event__submit"
          [disabled]="!isValid()">
          <span class="material-icons">check</span>
          Salva evento
        </button>
      </form>

    </app-calendar-overlay-base>
  `,
  styles: [`
    @import 'src/styles/tokens-figma';

    .create-event {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .create-event__field {
      display: flex;
      flex-direction: column;
      gap: 8px;

      &--half {
        flex: 1;
      }
    }

    .create-event__row {
      display: flex;
      gap: 12px;
    }

    .create-event__label {
      font-size: 14px;
      font-weight: 600;
      opacity: 0.9;
    }

    .create-event__input {
      width: 100%;
      padding: 14px 16px;
      border-radius: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-family: 'Montserrat', sans-serif;
      font-size: 15px;
      transition: border-color 0.2s ease;

      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }

      &:focus {
        outline: none;
        border-color: $color-cta-primary;
      }

      &--with-icon {
        padding-left: 44px;
      }
    }

    .create-event__input-icon {
      position: relative;

      .material-icons {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 20px;
        opacity: 0.6;
      }
    }

    .create-event__repetition {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .create-event__repetition-btn {
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
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

    .create-event__submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 16px;
      margin-top: 12px;
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
        font-size: 20px;
      }

      &:hover:not(:disabled) {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarCreateEventOverlayComponent {
  overlayService = inject(CalendarOverlayService);

  // Form fields
  eventName = '';
  eventLocation = '';
  eventDate = this.getTodayString();
  eventTime = '10:00';
  eventPhone = '';
  repetition = signal<RepetitionType>('none');

  repetitionOptions: { value: RepetitionType; label: string }[] = [
    { value: 'none', label: 'Mai' },
    { value: 'daily', label: 'Ogni giorno' },
    { value: 'weekly', label: 'Ogni settimana' },
    { value: 'monthly', label: 'Ogni mese' },
    { value: 'yearly', label: 'Ogni anno' },
  ];

  private getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  isValid(): boolean {
    return !!this.eventName.trim() && !!this.eventDate;
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    const event = {
      name: this.eventName,
      location: this.eventLocation,
      date: this.eventDate,
      time: this.eventTime,
      phone: this.eventPhone,
      repetition: this.repetition(),
    };

    console.log('Event created:', event);

    // Reset form
    this.eventName = '';
    this.eventLocation = '';
    this.eventDate = this.getTodayString();
    this.eventTime = '10:00';
    this.eventPhone = '';
    this.repetition.set('none');

    // Close overlay
    this.overlayService.close();
  }
}
