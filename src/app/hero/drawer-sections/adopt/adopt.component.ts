import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-adopt',
  standalone: true,
  templateUrl: './adopt.component.html',
  styleUrls: ['./adopt.component.scss']
})
export class AdoptComponent {
  title = 'Adottare';
  icon = '🐕';
  emptyMessage = 'Coming soon...';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
