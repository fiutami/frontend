import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CalendarOverlayBaseComponent } from './calendar-overlay-base.component';
import { CalendarOverlayService } from '../services/calendar-overlay.service';
import { CalendarEventService } from '../../core/services/calendar-event.service';
import {
  CalendarEventCreate,
  RecurrenceFrequency,
  toRRule,
  fromRRule,
} from '../../core/models/calendar.models';

/** Default event colors user can pick */
const EVENT_COLORS = [
  '#4A74F0', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#F2B830', '#9B59B6', '#E67E22',
];

@Component({
  selector: 'app-calendar-create-event-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CalendarOverlayBaseComponent],
  template: `
    <app-calendar-overlay-base
      [title]="overlayTitle()"
      [isOpen]="overlayService.isOpen()"
      (closed)="overlayService.close()">

      <form class="create-event" (ngSubmit)="onSubmit()">
        <!-- Nome evento -->
        <div class="create-event__field">
          <label class="create-event__label">{{ 'calendar.createEvent.name' | translate }}</label>
          <input
            type="text"
            class="create-event__input"
            [placeholder]="'calendar.createEvent.namePlaceholder' | translate"
            [(ngModel)]="eventName"
            name="eventName"
            required>
        </div>

        <!-- Luogo -->
        <div class="create-event__field">
          <label class="create-event__label">{{ 'calendar.createEvent.location' | translate }}</label>
          <div class="create-event__input-icon">
            <span class="material-icons">place</span>
            <input
              type="text"
              class="create-event__input create-event__input--with-icon"
              [placeholder]="'calendar.createEvent.locationPlaceholder' | translate"
              [(ngModel)]="eventLocation"
              name="eventLocation">
          </div>
        </div>

        <!-- Data e Ora -->
        <div class="create-event__row">
          <div class="create-event__field create-event__field--half">
            <label class="create-event__label">{{ 'calendar.createEvent.date' | translate }}</label>
            <input
              type="date"
              class="create-event__input"
              [(ngModel)]="eventDate"
              name="eventDate"
              required>
          </div>
          <div class="create-event__field create-event__field--half">
            <label class="create-event__label">{{ 'calendar.createEvent.time' | translate }}</label>
            <input
              type="time"
              class="create-event__input"
              [(ngModel)]="eventTime"
              name="eventTime">
          </div>
        </div>

        <!-- Numero (telefono/riferimento) -->
        <div class="create-event__field">
          <label class="create-event__label">{{ 'calendar.createEvent.phone' | translate }}</label>
          <div class="create-event__input-icon">
            <span class="material-icons">phone</span>
            <input
              type="tel"
              class="create-event__input create-event__input--with-icon"
              [placeholder]="'calendar.createEvent.phonePlaceholder' | translate"
              [(ngModel)]="eventPhone"
              name="eventPhone">
          </div>
        </div>

        <!-- Colore -->
        <div class="create-event__field">
          <label class="create-event__label">{{ 'calendar.createEvent.color' | translate }}</label>
          <div class="create-event__colors">
            @for (c of colors; track c) {
              <button
                type="button"
                class="create-event__color-btn"
                [class.create-event__color-btn--active]="selectedColor() === c"
                [style.background-color]="c"
                (click)="selectedColor.set(c)">
                @if (selectedColor() === c) {
                  <span class="material-icons">check</span>
                }
              </button>
            }
          </div>
        </div>

        <!-- Ripetizione -->
        <div class="create-event__field">
          <label class="create-event__label">{{ 'calendar.createEvent.recurrence' | translate }}</label>
          <div class="create-event__repetition">
            @for (option of repetitionOptions; track option.value) {
              <button
                type="button"
                class="create-event__repetition-btn"
                [class.create-event__repetition-btn--active]="repetition() === option.value"
                (click)="repetition.set(option.value)">
                {{ option.labelKey | translate }}
              </button>
            }
          </div>
        </div>

        <!-- Actions -->
        <div class="create-event__actions">
          <button
            type="button"
            class="create-event__cancel"
            (click)="overlayService.close()">
            {{ 'calendar.createEvent.cancel' | translate }}
          </button>
          <button
            type="submit"
            class="create-event__submit"
            [disabled]="!isValid() || saving()">
            @if (saving()) {
              <span class="create-event__spinner"></span>
            } @else {
              <span class="material-icons">check</span>
            }
            {{ 'calendar.createEvent.save' | translate }}
          </button>
        </div>
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
      box-sizing: border-box;

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

    .create-event__colors {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .create-event__color-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      .material-icons {
        font-size: 18px;
        color: white;
      }

      &--active {
        border-color: white;
        transform: scale(1.15);
      }

      &:hover:not(&--active) {
        transform: scale(1.1);
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

    .create-event__actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .create-event__cancel {
      flex: 1;
      padding: 14px;
      border-radius: 50px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: transparent;
      color: white;
      font-family: 'Montserrat', sans-serif;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: white;
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .create-event__submit {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px;
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

    .create-event__spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(0, 0, 0, 0.2);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarCreateEventOverlayComponent implements OnInit {
  protected readonly overlayService = inject(CalendarOverlayService);
  private readonly calendarEventService = inject(CalendarEventService);
  private readonly translate = inject(TranslateService);

  // Form fields
  eventName = '';
  eventLocation = '';
  eventDate = '';
  eventTime = '10:00';
  eventPhone = '';
  repetition = signal<RecurrenceFrequency>(RecurrenceFrequency.None);
  selectedColor = signal('#4A74F0');
  saving = signal(false);

  protected readonly colors = EVENT_COLORS;

  protected readonly repetitionOptions = [
    { value: RecurrenceFrequency.None, labelKey: 'calendar.createEvent.recurrenceOptions.none' },
    { value: RecurrenceFrequency.Daily, labelKey: 'calendar.createEvent.recurrenceOptions.daily' },
    { value: RecurrenceFrequency.Weekly, labelKey: 'calendar.createEvent.recurrenceOptions.weekly' },
    { value: RecurrenceFrequency.Monthly, labelKey: 'calendar.createEvent.recurrenceOptions.monthly' },
    { value: RecurrenceFrequency.Yearly, labelKey: 'calendar.createEvent.recurrenceOptions.yearly' },
  ];

  /** Overlay title: "Crea evento" or "Modifica evento" */
  protected readonly overlayTitle = computed(() => {
    const editId = this.overlayService.editEventId();
    return editId
      ? this.translate.instant('calendar.createEvent.editTitle')
      : this.translate.instant('calendar.createEvent.title');
  });

  /** Whether we're in edit mode */
  protected readonly isEditMode = computed(() => !!this.overlayService.editEventId());

  constructor() {
    // React to overlay opening to pre-fill form
    effect(() => {
      const isOpen = this.overlayService.isOpen();
      const overlayType = this.overlayService.overlayType();
      if (isOpen && overlayType === 'create-event') {
        this.initForm();
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  private async initForm(): Promise<void> {
    const editId = this.overlayService.editEventId();
    const selectedDate = this.overlayService.selectedDate();

    if (editId) {
      // Edit mode: load event data
      const event = await this.calendarEventService.getEvent(editId);
      if (event) {
        this.eventName = event.title;
        this.eventLocation = event.location ?? '';
        const d = new Date(event.startDate);
        this.eventDate = this.dateToString(d);
        this.eventTime = d.toTimeString().slice(0, 5);
        this.eventPhone = event.phone ?? '';
        this.repetition.set(fromRRule(event.recurrenceRule));
        this.selectedColor.set(event.color ?? '#4A74F0');
        return;
      }
    }

    // Create mode: reset form
    this.eventName = '';
    this.eventLocation = '';
    this.eventDate = selectedDate ? this.dateToString(selectedDate) : this.dateToString(new Date());
    this.eventTime = '10:00';
    this.eventPhone = '';
    this.repetition.set(RecurrenceFrequency.None);
    this.selectedColor.set('#4A74F0');
  }

  isValid(): boolean {
    return !!this.eventName.trim() && !!this.eventDate;
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid() || this.saving()) return;

    this.saving.set(true);

    try {
      const startDate = this.buildIsoDate();
      const payload: CalendarEventCreate = {
        title: this.eventName.trim(),
        location: this.eventLocation.trim() || null,
        startDate,
        endDate: startDate, // same as start for simple events
        phone: this.eventPhone.trim() || null,
        recurrenceRule: toRRule(this.repetition()),
        color: this.selectedColor(),
      };

      const editId = this.overlayService.editEventId();
      if (editId) {
        await this.calendarEventService.updateEvent(editId, payload);
      } else {
        await this.calendarEventService.createEvent(payload);
      }

      this.overlayService.close();
    } catch (err) {
      console.error('[CreateEventOverlay] save error:', err);
    } finally {
      this.saving.set(false);
    }
  }

  private buildIsoDate(): string {
    const [year, month, day] = this.eventDate.split('-').map(Number);
    const [hours, minutes] = (this.eventTime || '10:00').split(':').map(Number);
    const d = new Date(year, month - 1, day, hours, minutes);
    return d.toISOString();
  }

  private dateToString(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
