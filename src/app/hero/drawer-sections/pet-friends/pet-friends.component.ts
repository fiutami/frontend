import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-pet-friends',
  standalone: true,
  templateUrl: './pet-friends.component.html',
  styleUrls: ['./pet-friends.component.scss']
})
export class PetFriendsComponent {
  title = 'Amici Pets';
  icon = '🐾';
  emptyMessage = 'Nessun amico pet ancora';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
