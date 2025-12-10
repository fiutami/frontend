import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent {
  title = 'Abbonamenti';
  icon = '⭐';
  emptyMessage = 'Piano Free attivo';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
