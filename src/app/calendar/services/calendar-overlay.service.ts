import { Injectable, signal, computed } from '@angular/core';

export type CalendarOverlayType =
  | 'saved'
  | 'month'
  | 'notifications'
  | 'create-event'
  | 'events-list'
  | 'birthdays'
  | 'day-events'
  | null;

export type CalendarFilterIcon = 'saved' | 'month' | 'notifications' | null;
export type CalendarActionButton = 'create' | 'events' | 'birthdays' | null;

export interface CalendarOverlayState {
  isOpen: boolean;
  overlayType: CalendarOverlayType;
  activeFilter: CalendarFilterIcon;
  activeAction: CalendarActionButton;
}

/**
 * Service to manage Calendar overlay state.
 * Uses signals for reactive state management.
 * Pattern based on UserAreaModalService.
 */
@Injectable({ providedIn: 'root' })
export class CalendarOverlayService {
  // State signals
  private _isOpen = signal(false);
  private _overlayType = signal<CalendarOverlayType>(null);
  private _activeFilter = signal<CalendarFilterIcon>(null);
  private _activeAction = signal<CalendarActionButton>(null);

  // Public readonly signals
  readonly isOpen = this._isOpen.asReadonly();
  readonly overlayType = this._overlayType.asReadonly();
  readonly activeFilter = this._activeFilter.asReadonly();
  readonly activeAction = this._activeAction.asReadonly();

  // Combined state for convenience
  readonly state = computed<CalendarOverlayState>(() => ({
    isOpen: this._isOpen(),
    overlayType: this._overlayType(),
    activeFilter: this._activeFilter(),
    activeAction: this._activeAction(),
  }));

  // Notification badge count
  private _notificationCount = signal(3); // Mock value
  readonly notificationCount = this._notificationCount.asReadonly();

  // Context for overlays: selected date and edit event ID
  private _selectedDate = signal<Date | null>(null);
  readonly selectedDate = this._selectedDate.asReadonly();

  private _editEventId = signal<string | null>(null);
  readonly editEventId = this._editEventId.asReadonly();

  /**
   * Open Salvati overlay (saved events, birthdays, recurring, reminders)
   */
  openSaved(): void {
    this.openOverlay('saved', 'saved', null);
  }

  /**
   * Open Month mini-calendar overlay
   */
  openMonth(): void {
    this.openOverlay('month', 'month', null);
  }

  /**
   * Open Notifications overlay
   */
  openNotifications(): void {
    this.openOverlay('notifications', 'notifications', null);
  }

  /**
   * Open Create Event overlay.
   * Optionally pass a date to pre-fill and/or an eventId for edit mode.
   */
  openCreateEvent(date?: Date, editEventId?: string): void {
    this._selectedDate.set(date ?? null);
    this._editEventId.set(editEventId ?? null);
    this.openOverlay('create-event', null, 'create');
  }

  /**
   * Open Day Events overlay for a specific date
   */
  openDayEvents(date: Date): void {
    this._selectedDate.set(date);
    this.openOverlay('day-events', null, null);
  }

  /**
   * Open Events list overlay (public events in Italy)
   */
  openEvents(): void {
    this.openOverlay('events-list', null, 'events');
  }

  /**
   * Open Birthdays overlay
   */
  openBirthdays(): void {
    this.openOverlay('birthdays', null, 'birthdays');
  }

  /**
   * Close the overlay
   */
  close(): void {
    this._isOpen.set(false);
    this._overlayType.set(null);
    this._activeFilter.set(null);
    this._activeAction.set(null);
    this._selectedDate.set(null);
    this._editEventId.set(null);
    // Restore body scroll
    document.body.style.overflow = '';
  }

  /**
   * Toggle a filter icon overlay
   */
  toggleFilter(filter: CalendarFilterIcon): void {
    if (this._activeFilter() === filter && this._isOpen()) {
      this.close();
    } else {
      switch (filter) {
        case 'saved':
          this.openSaved();
          break;
        case 'month':
          this.openMonth();
          break;
        case 'notifications':
          this.openNotifications();
          break;
      }
    }
  }

  /**
   * Toggle an action button overlay
   */
  toggleAction(action: CalendarActionButton): void {
    if (this._activeAction() === action && this._isOpen()) {
      this.close();
    } else {
      switch (action) {
        case 'create':
          this.openCreateEvent();
          break;
        case 'events':
          this.openEvents();
          break;
        case 'birthdays':
          this.openBirthdays();
          break;
      }
    }
  }

  /**
   * Set notification count (for badge)
   */
  setNotificationCount(count: number): void {
    this._notificationCount.set(count);
  }

  /**
   * Private helper to open overlay with correct state
   */
  private openOverlay(
    type: CalendarOverlayType,
    filter: CalendarFilterIcon,
    action: CalendarActionButton
  ): void {
    this._overlayType.set(type);
    this._activeFilter.set(filter);
    this._activeAction.set(action);
    this._isOpen.set(true);
    // Prevent body scroll when overlay is open
    document.body.style.overflow = 'hidden';
  }
}
