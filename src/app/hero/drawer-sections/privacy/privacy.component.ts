import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent {
  title = 'Privacy Policy';

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
