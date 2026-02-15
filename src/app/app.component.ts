import { Component, inject } from "@angular/core";
import { LanguageService } from "./core/i18n/language.service";

@Component({
  selector: "app-root",
  template: `
    <router-outlet></router-outlet>
    <app-drawer></app-drawer>
    <app-user-area-modal></app-user-area-modal>
    <app-cookie-consent-banner></app-cookie-consent-banner>
  `
})
export class AppComponent {
  private languageService = inject(LanguageService);
}
