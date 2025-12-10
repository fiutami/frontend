import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-lost-pets',
  standalone: true,
  templateUrl: './lost-pets.component.html',
  styleUrls: ['./lost-pets.component.scss']
})
export class LostPetsComponent {
  title = 'Animali Smarriti';
  icon = '🔍';
  emptyMessage = 'Nessun animale segnalato';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
