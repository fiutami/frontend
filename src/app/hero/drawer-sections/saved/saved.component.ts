import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-saved',
  standalone: true,
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent {
  title = 'Preferiti';
  icon = '💾';
  emptyMessage = 'Nessun elemento salvato';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
