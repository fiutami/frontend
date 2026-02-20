import { Component, OnInit, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ContactPickerService, ContactResult } from '../../../core/services/contact-picker.service';

// Shell Drawer (sfondo blu solido, solo header + back, niente avatar/logo/mascot/tab bar)
import { TabPageShellDrawerComponent } from '../../../shared/components/tab-page-shell-drawer';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TabPageShellDrawerComponent,
  ],
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InviteComponent implements OnInit {
  private location = inject(Location);
  private translate = inject(TranslateService);
  private readonly contactPicker = inject(ContactPickerService);

  /** Translated page title */
  protected pageTitle = this.translate.instant('drawerInvite.title');

  isLoading = signal(false);
  hasError = signal(false);

  // Search
  readonly searchQuery = signal('');

  // Contact picker signals
  readonly contacts = signal<ContactResult[]>([]);
  readonly manualPhone = signal('');
  readonly manualName = signal('');

  // Filtered contacts based on search
  readonly filteredContacts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.contacts();
    if (!query) return list;
    return list.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query)
    );
  });
  readonly showConfirmDialog = signal(false);
  readonly selectedContact = signal<ContactResult | null>(null);
  readonly isContactPickerSupported = this.contactPicker.isSupported;

  readonly inviteMessage = 'Ciao! Ti invito a provare Fiutami, l\'app per gli amanti degli animali! Scaricala qui: https://fiutami.pet';

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.pageTitle = this.translate.instant('drawerInvite.title');
    });
  }

  ngOnInit(): void {
    // No server data needed - contacts are managed locally
  }

  goBack(): void {
    this.location.back();
  }

  retry(): void {
    this.hasError.set(false);
  }

  // ============================================================
  // Contact Picker Methods
  // ============================================================

  async importContacts(): Promise<void> {
    const picked = await this.contactPicker.pickContacts();
    if (picked.length > 0) {
      this.contacts.update(existing => [...existing, ...picked]);
    }
  }

  addManualContact(): void {
    const phone = this.manualPhone().trim();
    const name = this.manualName().trim() || 'Contatto';
    if (phone) {
      this.contacts.update(list => [...list, { name, phone }]);
      this.manualPhone.set('');
      this.manualName.set('');
    }
  }

  removeContact(index: number): void {
    this.contacts.update(list => list.filter((_, i) => i !== index));
  }

  confirmInvite(contact: ContactResult): void {
    this.selectedContact.set(contact);
    this.showConfirmDialog.set(true);
  }

  cancelInvite(): void {
    this.showConfirmDialog.set(false);
    this.selectedContact.set(null);
  }

  sendWhatsAppInvite(): void {
    const contact = this.selectedContact();
    if (!contact) return;

    const phone = contact.phone.replace(/[^\d+]/g, '');
    const text = encodeURIComponent(this.inviteMessage);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');

    this.showConfirmDialog.set(false);
    this.selectedContact.set(null);
  }
}
