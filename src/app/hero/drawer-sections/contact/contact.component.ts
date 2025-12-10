import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  title = 'Contattaci';
  email = '';
  message = '';
  submitted = false;

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    if (this.email && this.message) {
      console.log('Contact form submitted:', { email: this.email, message: this.message });
      this.submitted = true;
      // Reset form after 3 seconds
      setTimeout(() => {
        this.email = '';
        this.message = '';
        this.submitted = false;
      }, 3000);
    }
  }
}
