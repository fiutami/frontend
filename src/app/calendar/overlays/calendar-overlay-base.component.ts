import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-calendar-overlay-base',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop with blur -->
    <div
      class="calendar-overlay-backdrop"
      [@fadeBackdrop]="animationState"
      (click)="onBackdropClick($event)"
      [attr.aria-hidden]="!isOpen">

      <!-- Overlay Container -->
      <aside
        class="calendar-overlay"
        [@slideUp]="animationState"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title"
        (click)="$event.stopPropagation()">

        <!-- Header -->
        <header class="calendar-overlay__header">
          <button
            type="button"
            class="calendar-overlay__close-btn"
            (click)="onClose()"
            aria-label="Chiudi">
            <span class="material-icons">close</span>
          </button>

          <h2 class="calendar-overlay__title">{{ title }}</h2>

          <div class="calendar-overlay__header-spacer"></div>
        </header>

        <!-- Content (projected) -->
        <main class="calendar-overlay__content">
          <ng-content></ng-content>
        </main>

      </aside>
    </div>
  `,
  styles: [`
    .calendar-overlay-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .calendar-overlay {
      width: 100%;
      max-width: 430px;
      max-height: 85vh;
      background: linear-gradient(180deg, #4A74F0 0%, #3B5EC4 100%);
      border-radius: 24px 24px 0 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
    }

    .calendar-overlay__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .calendar-overlay__close-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.15);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
      }

      .material-icons {
        font-size: 24px;
      }
    }

    .calendar-overlay__title {
      font-family: 'Montserrat', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: white;
      margin: 0;
      text-align: center;
      flex: 1;
    }

    .calendar-overlay__header-spacer {
      width: 40px;
    }

    .calendar-overlay__content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      color: white;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideUp', [
      state('closed', style({
        transform: 'translateY(100%)',
        opacity: 0
      })),
      state('open', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('closed => open', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')),
      transition('open => closed', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
    trigger('fadeBackdrop', [
      state('closed', style({ opacity: 0, visibility: 'hidden' })),
      state('open', style({ opacity: 1, visibility: 'visible' })),
      transition('closed <=> open', animate('200ms ease-out')),
    ]),
  ],
})
export class CalendarOverlayBaseComponent {
  @Input() title = '';
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  get animationState(): string {
    return this.isOpen ? 'open' : 'closed';
  }

  onClose(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('calendar-overlay-backdrop')) {
      this.onClose();
    }
  }
}
