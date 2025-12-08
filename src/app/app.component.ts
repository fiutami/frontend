import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <router-outlet></router-outlet>
    <app-drawer></app-drawer>
  `
})
export class AppComponent {}
