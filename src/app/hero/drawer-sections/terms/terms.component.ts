import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {
  title = 'Termini di servizio';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
