import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-invite',
  standalone: true,
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent {
  title = 'Invita Amici';
  icon = '📨';
  emptyMessage = 'Invita i tuoi amici!';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
