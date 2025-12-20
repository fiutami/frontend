import { Injectable, signal, computed } from '@angular/core';

export type UserAreaSection = 'account' | 'profile' | 'security' | 'settings';
export type UserAreaSubSection =
  | 'notifications'
  | 'activity'
  | 'saved'
  | 'friends'
  | 'blocked'
  | 'invite'
  | 'subscription'
  | 'privacy'
  | 'terms'
  | 'contact';

export interface UserAreaState {
  isOpen: boolean;
  section: UserAreaSection;
  subSection: UserAreaSubSection | null;
}

/**
 * Service to manage User Area Modal open/close state and navigation.
 * Uses signals for reactive state management.
 */
@Injectable({ providedIn: 'root' })
export class UserAreaModalService {
  // State signals
  private _isOpen = signal(false);
  private _section = signal<UserAreaSection>('account');
  private _subSection = signal<UserAreaSubSection | null>(null);

  // Public computed signals
  readonly isOpen = this._isOpen.asReadonly();
  readonly section = this._section.asReadonly();
  readonly subSection = this._subSection.asReadonly();

  // Combined state for convenience
  readonly state = computed<UserAreaState>(() => ({
    isOpen: this._isOpen(),
    section: this._section(),
    subSection: this._subSection(),
  }));

  /**
   * Open the user area modal
   * @param section - Initial section to display (default: 'account')
   * @param subSection - Optional sub-section to display
   */
  open(section: UserAreaSection = 'account', subSection: UserAreaSubSection | null = null): void {
    this._section.set(section);
    this._subSection.set(subSection);
    this._isOpen.set(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close the user area modal
   */
  close(): void {
    this._isOpen.set(false);
    this._subSection.set(null);
    // Restore body scroll
    document.body.style.overflow = '';
  }

  /**
   * Toggle the modal open/closed state
   */
  toggle(): void {
    if (this._isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Navigate to a specific section within the modal
   */
  navigateToSection(section: UserAreaSection): void {
    this._section.set(section);
    this._subSection.set(null);
  }

  /**
   * Navigate to a specific sub-section
   */
  navigateToSubSection(subSection: UserAreaSubSection): void {
    this._subSection.set(subSection);
  }

  /**
   * Go back from sub-section to main section view
   */
  goBack(): void {
    if (this._subSection()) {
      this._subSection.set(null);
    } else {
      this.close();
    }
  }

  /**
   * Open to a specific quick-access section (shortcuts)
   */
  openNotifications(): void {
    this.open('account', 'notifications');
  }

  openSaved(): void {
    this.open('account', 'saved');
  }

  openActivity(): void {
    this.open('account', 'activity');
  }

  openSettings(): void {
    this.open('settings');
  }

  openProfile(): void {
    this.open('profile');
  }

  openSecurity(): void {
    this.open('security');
  }
}
