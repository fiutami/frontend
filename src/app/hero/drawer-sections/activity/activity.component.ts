import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-activity',
  standalone: true,
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
  title = 'La tua attività';
  icon = '📊';
  emptyMessage = 'Nessuna attività recente';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
