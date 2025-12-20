import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <router-outlet></router-outlet>
    <app-drawer></app-drawer>
    <app-user-area-modal></app-user-area-modal>
  `
})
export class AppComponent {}
