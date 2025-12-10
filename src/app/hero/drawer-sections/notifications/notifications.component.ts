import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
  title = 'Notifiche';
  icon = '🔔';
  emptyMessage = 'Nessuna notifica';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
