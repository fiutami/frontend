import { Injectable, signal } from '@angular/core';

export interface ContactResult {
  name: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class ContactPickerService {
  readonly isSupported = signal(
    typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window
  );

  async pickContacts(): Promise<ContactResult[]> {
    if (!this.isSupported()) {
      return [];
    }

    try {
      const contacts = await (navigator as any).contacts.select(
        ['name', 'tel'],
        { multiple: true }
      );

      return contacts
        .filter((c: any) => c.tel?.length > 0)
        .map((c: any) => ({
          name: c.name?.[0] || 'Sconosciuto',
          phone: c.tel[0],
        }));
    } catch (err) {
      console.error('Contact picker error:', err);
      return [];
    }
  }
}
