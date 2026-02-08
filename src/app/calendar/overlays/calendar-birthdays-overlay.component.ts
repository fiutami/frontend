import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarOverlayBaseComponent } from './calendar-overlay-base.component';
import { CalendarOverlayService } from '../services/calendar-overlay.service';

interface PetBirthday {
  id: string;
  petName: string;
  ownerName: string;
  birthDate: Date;
  age: number;
  species: 'dog' | 'cat' | 'other';
  avatarUrl?: string;
  isFriend: boolean; // true = direct friend, false = friend of friend
}

@Component({
  selector: 'app-calendar-birthdays-overlay',
  standalone: true,
  imports: [CommonModule, CalendarOverlayBaseComponent],
  template: `
    <app-calendar-overlay-base
      title="Compleanni in vista"
      [isOpen]="overlayService.isOpen()"
      (closed)="overlayService.close()">

      <div class="birthdays-overlay">
        <!-- Section: This Week -->
        @if (thisWeekBirthdays.length > 0) {
          <section class="birthdays-overlay__section">
            <h3 class="birthdays-overlay__section-title">Questa settimana</h3>
            <div class="birthdays-overlay__list">
              @for (birthday of thisWeekBirthdays; track birthday.id) {
                <ng-container *ngTemplateOutlet="birthdayCard; context: { $implicit: birthday }"></ng-container>
              }
            </div>
          </section>
        }

        <!-- Section: This Month -->
        @if (thisMonthBirthdays.length > 0) {
          <section class="birthdays-overlay__section">
            <h3 class="birthdays-overlay__section-title">Questo mese</h3>
            <div class="birthdays-overlay__list">
              @for (birthday of thisMonthBirthdays; track birthday.id) {
                <ng-container *ngTemplateOutlet="birthdayCard; context: { $implicit: birthday }"></ng-container>
              }
            </div>
          </section>
        }

        <!-- Section: Upcoming -->
        @if (upcomingBirthdays.length > 0) {
          <section class="birthdays-overlay__section">
            <h3 class="birthdays-overlay__section-title">Prossimamente</h3>
            <div class="birthdays-overlay__list">
              @for (birthday of upcomingBirthdays; track birthday.id) {
                <ng-container *ngTemplateOutlet="birthdayCard; context: { $implicit: birthday }"></ng-container>
              }
            </div>
          </section>
        }

        <!-- Empty State -->
        @if (allBirthdays.length === 0) {
          <div class="birthdays-overlay__empty">
            <span class="material-icons">cake</span>
            <p>Nessun compleanno in programma</p>
          </div>
        }

        <!-- Birthday Card Template -->
        <ng-template #birthdayCard let-birthday>
          <div class="birthdays-overlay__card">
            <div class="birthdays-overlay__avatar">
              @if (birthday.avatarUrl) {
                <img [src]="birthday.avatarUrl" [alt]="birthday.petName">
              } @else {
                <span class="material-icons">{{ getSpeciesIcon(birthday.species) }}</span>
              }
            </div>
            <div class="birthdays-overlay__info">
              <h4 class="birthdays-overlay__name">{{ birthday.petName }}</h4>
              <p class="birthdays-overlay__details">
                {{ birthday.age + 1 }} anni
                <span class="birthdays-overlay__separator">•</span>
                {{ birthday.isFriend ? 'Amico' : 'Amico di amico' }}
              </p>
              <p class="birthdays-overlay__owner">di {{ birthday.ownerName }}</p>
            </div>
            <div class="birthdays-overlay__date">
              <span class="birthdays-overlay__day">{{ getDayNumber(birthday.birthDate) }}</span>
              <span class="birthdays-overlay__month">{{ getMonthShort(birthday.birthDate) }}</span>
            </div>
          </div>
        </ng-template>
      </div>

    </app-calendar-overlay-base>
  `,
  styles: [`
    @import 'src/styles/tokens-figma';

    .birthdays-overlay {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .birthdays-overlay__section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .birthdays-overlay__section-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.7;
    }

    .birthdays-overlay__list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .birthdays-overlay__card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
    }

    .birthdays-overlay__avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
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
        font-size: 28px;
        color: $color-cta-primary;
      }
    }

    .birthdays-overlay__info {
      flex: 1;
      min-width: 0;
    }

    .birthdays-overlay__name {
      margin: 0 0 2px;
      font-size: 16px;
      font-weight: 600;
    }

    .birthdays-overlay__details {
      margin: 0;
      font-size: 13px;
      opacity: 0.8;
    }

    .birthdays-overlay__separator {
      margin: 0 6px;
    }

    .birthdays-overlay__owner {
      margin: 2px 0 0;
      font-size: 12px;
      opacity: 0.6;
    }

    .birthdays-overlay__date {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background: $color-cta-primary;
      color: $color-text-dark;
      flex-shrink: 0;
    }

    .birthdays-overlay__day {
      font-size: 18px;
      font-weight: 700;
      line-height: 1;
    }

    .birthdays-overlay__month {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .birthdays-overlay__empty {
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
export class CalendarBirthdaysOverlayComponent {
  overlayService = inject(CalendarOverlayService);

  // Mock data
  allBirthdays: PetBirthday[] = [
    {
      id: '1',
      petName: 'Luna',
      ownerName: 'Marco',
      birthDate: this.getDateInDays(2),
      age: 2,
      species: 'dog',
      isFriend: true,
    },
    {
      id: '2',
      petName: 'Micio',
      ownerName: 'Sara',
      birthDate: this.getDateInDays(5),
      age: 4,
      species: 'cat',
      isFriend: true,
    },
    {
      id: '3',
      petName: 'Rocky',
      ownerName: 'Luca',
      birthDate: this.getDateInDays(15),
      age: 6,
      species: 'dog',
      isFriend: false,
    },
    {
      id: '4',
      petName: 'Pallina',
      ownerName: 'Giulia',
      birthDate: this.getDateInDays(45),
      age: 3,
      species: 'cat',
      isFriend: true,
    },
  ];

  private getDateInDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  get thisWeekBirthdays(): PetBirthday[] {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return this.allBirthdays.filter(b => b.birthDate <= weekEnd);
  }

  get thisMonthBirthdays(): PetBirthday[] {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return this.allBirthdays.filter(b => b.birthDate > weekEnd && b.birthDate <= monthEnd);
  }

  get upcomingBirthdays(): PetBirthday[] {
    const now = new Date();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return this.allBirthdays.filter(b => b.birthDate > monthEnd);
  }

  getSpeciesIcon(species: 'dog' | 'cat' | 'other'): string {
    switch (species) {
      case 'dog':
        return 'pets';
      case 'cat':
        return 'pets';
      default:
        return 'cruelty_free';
    }
  }

  getDayNumber(date: Date): number {
    return date.getDate();
  }

  getMonthShort(date: Date): string {
    return date.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase();
  }
}
