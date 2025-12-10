import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-blocked-users',
  standalone: true,
  templateUrl: './blocked-users.component.html',
  styleUrls: ['./blocked-users.component.scss']
})
export class BlockedUsersComponent {
  title = 'Utenti Bloccati';
  icon = '🚫';
  emptyMessage = 'Nessun utente bloccato';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
