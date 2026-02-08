import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Il nuovo componente da testare
import { TabPageShellDefaultComponent } from '../../components/tab-page-shell-default';

// Componenti per simulare contenuto calendar
import { CalendarDateDisplayComponent } from '../../../calendar/components/calendar-date-display/calendar-date-display.component';
import { QuickActionsRowComponent, QuickActionItem } from '../../components/quick-actions-row/quick-actions-row.component';
import { ActionChipsRowComponent, ActionChip } from '../../components/action-chips-row/action-chips-row.component';

/**
 * Pagina di TEST per TabPageShellDefault
 *
 * URL: /test/shell-default
 * Simula il layout del calendar per verificare il componente.
 */
@Component({
  selector: 'app-test-shell-default',
  standalone: true,
  imports: [
    CommonModule,
    TabPageShellDefaultComponent,
    CalendarDateDisplayComponent,
    QuickActionsRowComponent,
    ActionChipsRowComponent,
  ],
  template: `
    <app-tab-page-shell-default
      title="Test Shell"
      activeTabId="calendar"
      [avatarMode]="'pet'"
      [showBack]="true"
      (backClicked)="onBack()">

      <!-- Slot Branding Extra: Data (dentro blu) -->
      <app-calendar-date-display shellBrandingExtra [date]="currentDate()" />

      <!-- Slot Sticky Content: Quick Actions + Chips -->
      <ng-container shellStickyContent>
        <app-quick-actions-row
          class="quick-actions--on-yellow"
          [items]="quickActionItems" />

        <app-action-chips-row [chips]="actionChips" />

        <p class="test-description">In che mese andiamo a mettere il naso?</p>
      </ng-container>

      <!-- Main Content: Griglia mesi simulata -->
      <div class="test-year-nav">
        <button class="test-year-nav__btn">
          <span class="material-icons">chevron_left</span>
        </button>
        <span class="test-year-nav__year">2026</span>
        <button class="test-year-nav__btn">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>

      <div class="test-grid">
        @for (month of months; track month) {
          <button class="test-month-btn" [class.test-month-btn--current]="month === 'FEBBRAIO'">
            {{ month }}
          </button>
        }
      </div>

    </app-tab-page-shell-default>
  `,
  styles: [`
    .test-description {
      margin: 0;
      padding: var(--sp-3) var(--sp-4);
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      color: #71757a;
      text-align: center;
    }

    .test-year-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-6);
      padding: var(--sp-4);

      &__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        background-color: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: var(--radius-icon);
        cursor: pointer;
        color: var(--white);

        .material-icons {
          font-size: 20px;
          color: #aaa;
        }
      }

      &__year {
        font-family: var(--font-body);
        font-size: 24px;
        font-weight: 700;
        color: var(--white);
        min-width: 80px;
        text-align: center;
      }
    }

    .test-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(130px, 160px));
      gap: clamp(16px, 3vw, 22px) clamp(24px, 6vw, 44px);
      padding: 0 var(--sp-4);
      justify-content: center;
    }

    .test-month-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 52px;
      background-color: var(--blue-1);
      border: 1px solid var(--white);
      border-radius: 22px;
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 700;
      color: var(--white);
      text-transform: uppercase;

      &--current {
        background-color: var(--yellow-cta);
        color: var(--text);
        border-color: var(--yellow-cta);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestShellDefaultComponent {
  currentDate = signal(new Date());

  quickActionItems: QuickActionItem[] = [
    { id: 'notifications', icon: 'notifications', badge: 3, ariaLabel: 'Notifiche' },
    { id: 'month', icon: 'calendar_today', ariaLabel: 'Calendario mese' },
    { id: 'saved', icon: 'bookmark', ariaLabel: 'Salvati' },
  ];

  actionChips: ActionChip[] = [
    { id: 'birthdays', label: 'Compleanni in vista', variant: 'yellow' },
    { id: 'events-list', label: 'Eventi', variant: 'yellow' },
    { id: 'create-event', label: 'Crea Evento', variant: 'yellow' },
  ];

  months = [
    'GENNAIO', 'LUGLIO',
    'FEBBRAIO', 'AGOSTO',
    'MARZO', 'SETTEMBRE',
    'APRILE', 'OTTOBRE',
    'MAGGIO', 'NOVEMBRE',
    'GIUGNO', 'DICEMBRE'
  ];

  constructor(private router: Router) {}

  onBack(): void {
    this.router.navigate(['/home/main']);
  }
}
