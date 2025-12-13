import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  submitContactForm(data: ContactFormData): Observable<ContactFormResponse> {
    // Validazione base
    if (!data.name || !data.email || !data.subject || !data.message) {
      return throwError(() => new Error('Tutti i campi sono obbligatori'));
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return throwError(() => new Error('Email non valida'));
    }

    // Mock response - da sostituire con chiamata API reale
    const mockResponse: ContactFormResponse = {
      success: true,
      message: 'Messaggio inviato con successo! Ti risponderemo al più presto.',
      ticketId: `TICKET-${Date.now().toString(36).toUpperCase()}`
    };

    // Simula delay di rete
    return of(mockResponse).pipe(delay(1500));
  }

  getSubjectOptions(): string[] {
    return [
      'Supporto tecnico',
      'Segnalazione bug',
      'Richiesta funzionalità',
      'Domande generali',
      'Partnership',
      'Altro'
    ];
  }
}
