import { Component, inject, signal, effect, DestroyRef } from "@angular/core";
import { Router } from "@angular/router";
import { LanguageService } from "./core/i18n/language.service";

@Component({
  selector: "app-root",
  styleUrls: ["./app.component.scss"],
  template: `
    <router-outlet></router-outlet>
    <app-drawer></app-drawer>
    <app-user-area-modal></app-user-area-modal>
    <app-cookie-consent-banner></app-cookie-consent-banner>

    @if (isLandscapeLocked()) {
      <div class="landscape-lock-overlay"
           role="dialog"
           aria-modal="true"
           [attr.aria-label]="'common.rotateDevice' | translate">
        <img src="assets/icons/rotate-phone.svg" width="64" height="64" alt="">
        <p>{{ 'common.rotateDevice' | translate }}</p>
      </div>
    }
  `
})
export class AppComponent {
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private static readonly LANDSCAPE_LOCK_MAX_HEIGHT = 500;
  private static readonly LANDSCAPE_EXEMPT_ROUTES = ['/home/chat/'];

  isLandscapeLocked = signal(false);

  constructor() {
    if (typeof window === 'undefined') return;

    const query = window.matchMedia(
      `(orientation: landscape) and (max-height: ${AppComponent.LANDSCAPE_LOCK_MAX_HEIGHT}px)`
    );

    this.updateLandscapeLock(query.matches);

    const handler = (e: MediaQueryListEvent) => {
      this.updateLandscapeLock(e.matches);
    };

    query.addEventListener('change', handler);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', handler));

    effect(() => {
      document.body.style.overflow = this.isLandscapeLocked() ? 'hidden' : '';
    });
  }

  private updateLandscapeLock(isLandscape: boolean): void {
    const url = this.router.url;
    const isExempt = AppComponent.LANDSCAPE_EXEMPT_ROUTES.some(r => url.startsWith(r));
    this.isLandscapeLocked.set(isLandscape && !isExempt);
  }
}
