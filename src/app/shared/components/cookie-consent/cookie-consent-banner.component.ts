import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConsentService } from '../../../core/services/consent.service';

@Component({
  selector: 'app-cookie-consent-banner',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    @if (!hasConsent()) {
      <div class="cookie-banner" role="dialog" aria-label="Cookie Consent">
        @if (!showCustomize()) {
          <!-- Default view -->
          <div class="cookie-banner__content">
            <div class="cookie-banner__icon">
              <span class="material-icons">cookie</span>
            </div>
            <div class="cookie-banner__text">
              <h3 class="cookie-banner__title">{{ 'gdpr.cookies.title' | translate }}</h3>
              <p class="cookie-banner__desc">{{ 'gdpr.cookies.description' | translate }}</p>
            </div>
          </div>
          <div class="cookie-banner__actions">
            <button class="cookie-banner__btn cookie-banner__btn--outline" (click)="onNecessaryOnly()" type="button">
              {{ 'gdpr.cookies.necessaryOnly' | translate }}
            </button>
            <button class="cookie-banner__btn cookie-banner__btn--link" (click)="showCustomize.set(true)" type="button">
              {{ 'gdpr.cookies.customize' | translate }}
            </button>
            <button class="cookie-banner__btn cookie-banner__btn--primary" (click)="onAcceptAll()" type="button">
              {{ 'gdpr.cookies.acceptAll' | translate }}
            </button>
          </div>
        } @else {
          <!-- Customize view -->
          <div class="cookie-banner__content">
            <h3 class="cookie-banner__title">{{ 'gdpr.cookies.customizeTitle' | translate }}</h3>
          </div>
          <div class="cookie-banner__options">
            <label class="cookie-banner__option">
              <input type="checkbox" checked disabled>
              <span class="cookie-banner__option-label">{{ 'gdpr.cookies.necessary' | translate }}</span>
              <span class="cookie-banner__option-desc">{{ 'gdpr.cookies.necessaryDesc' | translate }}</span>
            </label>
            <label class="cookie-banner__option">
              <input type="checkbox" [(ngModel)]="functionalEnabled">
              <span class="cookie-banner__option-label">{{ 'gdpr.cookies.functional' | translate }}</span>
              <span class="cookie-banner__option-desc">{{ 'gdpr.cookies.functionalDesc' | translate }}</span>
            </label>
            <label class="cookie-banner__option">
              <input type="checkbox" [(ngModel)]="analyticsEnabled">
              <span class="cookie-banner__option-label">{{ 'gdpr.cookies.analytics' | translate }}</span>
              <span class="cookie-banner__option-desc">{{ 'gdpr.cookies.analyticsDesc' | translate }}</span>
            </label>
          </div>
          <div class="cookie-banner__actions">
            <button class="cookie-banner__btn cookie-banner__btn--outline" (click)="showCustomize.set(false)" type="button">
              {{ 'common.back' | translate }}
            </button>
            <button class="cookie-banner__btn cookie-banner__btn--primary" (click)="onSavePreferences()" type="button">
              {{ 'common.save' | translate }}
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .cookie-banner { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #eee; box-shadow: 0 -4px 20px rgba(0,0,0,0.1); padding: 20px 16px; z-index: 1000; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

    .cookie-banner__content { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
    .cookie-banner__icon .material-icons { font-size: 32px; color: #F2B830; }
    .cookie-banner__title { font-size: 16px; font-weight: 600; margin: 0 0 4px; }
    .cookie-banner__desc { font-size: 14px; color: #666; margin: 0; line-height: 1.4; }

    .cookie-banner__actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .cookie-banner__btn { padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
    .cookie-banner__btn--primary { background: #F2B830; color: #1a1a1a; flex: 1; }
    .cookie-banner__btn--outline { background: transparent; border: 1px solid #ddd; color: #333; }
    .cookie-banner__btn--link { background: transparent; color: #666; text-decoration: underline; }

    .cookie-banner__options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .cookie-banner__option { display: grid; grid-template-columns: 20px 1fr; gap: 4px 8px; align-items: start; }
    .cookie-banner__option input { margin-top: 2px; }
    .cookie-banner__option-label { font-size: 14px; font-weight: 500; }
    .cookie-banner__option-desc { grid-column: 2; font-size: 12px; color: #888; }

    @media (min-width: 768px) {
      .cookie-banner { max-width: 600px; left: 50%; transform: translateX(-50%); border-radius: 16px 16px 0 0; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieConsentBannerComponent {
  private readonly consentService = inject(ConsentService);

  hasConsent = this.consentService.hasCookieConsent.bind(this.consentService);
  showCustomize = signal(false);
  functionalEnabled = true;
  analyticsEnabled = false;

  onAcceptAll(): void {
    this.consentService.acceptAllCookies();
  }

  onNecessaryOnly(): void {
    this.consentService.acceptNecessaryOnly();
  }

  onSavePreferences(): void {
    this.consentService.setCookieConsent(this.functionalEnabled, this.analyticsEnabled);
  }
}
