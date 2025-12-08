import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service to manage drawer open/close state.
 * Can be used as modal overlay or with routing.
 */
@Injectable({ providedIn: 'root' })
export class DrawerService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);

  /** Observable of drawer open state */
  get isOpen$(): Observable<boolean> {
    return this.isOpenSubject.asObservable();
  }

  /** Current drawer open state */
  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }

  /** Open the drawer */
  open(): void {
    this.isOpenSubject.next(true);
    // Prevent body scroll when drawer is open
    document.body.style.overflow = 'hidden';
  }

  /** Close the drawer */
  close(): void {
    this.isOpenSubject.next(false);
    // Restore body scroll
    document.body.style.overflow = '';
  }

  /** Toggle drawer state */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}
