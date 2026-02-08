import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface Contact {
  id: string;
  name: string;
  avatarUrl: string;
  phone?: string;
  email?: string;
  invited: boolean;
}

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {
  searchQuery = '';
  isSelecting = false;
  selectedContacts: Set<string> = new Set();
  copiedCode = false;

  // TODO: Fetch referral code from backend API
  referralCode = 'FIDO2024';
  invitesSent = 0;
  pointsEarned = 0;
  pointsPerInvite = 50;

  contacts: Contact[] = [
    { id: '1', name: 'Marco Esperti', avatarUrl: 'assets/images/contacts/marco.jpg', invited: false },
    { id: '2', name: 'Massimo', avatarUrl: 'assets/images/contacts/massimo.jpg', invited: true },
    { id: '3', name: 'Rosanna Giudici', avatarUrl: 'assets/images/contacts/rosanna.jpg', invited: false },
    { id: '4', name: 'Sara Vernici', avatarUrl: 'assets/images/contacts/sara.jpg', invited: false },
    { id: '5', name: 'Sandro', avatarUrl: 'assets/images/contacts/sandro.jpg', invited: false },
    { id: '6', name: 'Silvia Capelli', avatarUrl: 'assets/images/contacts/silvia.jpg', invited: false },
    { id: '7', name: 'Susanna', avatarUrl: 'assets/images/contacts/susanna.jpg', invited: false }
  ];

  get filteredContacts(): Contact[] {
    if (!this.searchQuery.trim()) {
      return this.contacts;
    }
    const query = this.searchQuery.toLowerCase();
    return this.contacts.filter(c =>
      c.name.toLowerCase().includes(query)
    );
  }

  get inviteUrl(): string {
    return `${environment.appUrl}/invite/${this.referralCode}`;
  }

  get inviteText(): string {
    return `Unisciti a FIUTAMI! Usa il mio codice ${this.referralCode} per iscriverti. ${this.inviteUrl}`;
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load referral info from backend
  }

  goBack(): void {
    this.router.navigate(['/user/dashboard']);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
  }

  toggleSelecting(): void {
    this.isSelecting = !this.isSelecting;
    if (!this.isSelecting) {
      this.selectedContacts.clear();
    }
  }

  toggleContactSelection(contact: Contact): void {
    if (contact.invited) return;

    if (this.selectedContacts.has(contact.id)) {
      this.selectedContacts.delete(contact.id);
    } else {
      this.selectedContacts.add(contact.id);
    }
  }

  isContactSelected(contact: Contact): boolean {
    return this.selectedContacts.has(contact.id);
  }

  onContactClick(contact: Contact): void {
    if (this.isSelecting) {
      this.toggleContactSelection(contact);
    }
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.referralCode).then(() => {
      this.copiedCode = true;
      setTimeout(() => {
        this.copiedCode = false;
      }, 2000);
    });
  }

  shareVia(platform: 'whatsapp' | 'telegram' | 'email' | 'native'): void {
    const text = this.inviteText;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(this.inviteUrl)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent('Unisciti a FIUTAMI!')}&body=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: 'FIUTAMI - Invita amici',
            text: text,
            url: this.inviteUrl
          });
        }
        break;
    }
  }

  sendInvites(): void {
    const selectedIds = Array.from(this.selectedContacts);
    console.log('Sending invites to:', selectedIds);

    // Mark as invited
    this.contacts = this.contacts.map(c => {
      if (selectedIds.includes(c.id)) {
        return { ...c, invited: true };
      }
      return c;
    });

    this.invitesSent += selectedIds.length;
    this.selectedContacts.clear();
    this.isSelecting = false;
  }
}
