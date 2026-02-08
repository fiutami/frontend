import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  // Form
  name = '';
  email = '';
  subject = '';
  message = '';

  sending = false;
  sent = false;
  error = '';

  subjects = [
    { value: 'support', label: 'contact.subjects.support' },
    { value: 'bug', label: 'contact.subjects.bug' },
    { value: 'feature', label: 'contact.subjects.feature' },
    { value: 'partnership', label: 'contact.subjects.partnership' },
    { value: 'other', label: 'contact.subjects.other' }
  ];

  constructor(private location: Location) {}

  submitForm() {
    if (!this.name || !this.email || !this.subject || !this.message) {
      this.error = 'Compila tutti i campi';
      return;
    }

    this.sending = true;
    this.error = '';

    // Per MVP: mailto o API
    const mailtoLink = `mailto:support@fiutami.pet?subject=${encodeURIComponent(this.subject)}&body=${encodeURIComponent(`Nome: ${this.name}\nEmail: ${this.email}\n\n${this.message}`)}`;

    window.location.href = mailtoLink;

    // Simula invio
    setTimeout(() => {
      this.sending = false;
      this.sent = true;
    }, 500);
  }

  goBack() {
    this.location.back();
  }
}
