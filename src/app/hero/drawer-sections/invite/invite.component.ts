import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InviteService, InviteOption, PendingInvite, InviteStats, InviteMethod, InviteStatus } from '../../../core/services/invite.service';
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
  private inviteService = inject(InviteService);
  private translate = inject(TranslateService);
  private readonly contactPicker = inject(ContactPickerService);

  /** Translated page title */
  protected pageTitle = this.translate.instant('drawerInvite.title');

  inviteOptions = signal<InviteOption[]>([]);
  pendingInvites = signal<PendingInvite[]>([]);
  stats = signal<InviteStats | null>(null);
  isLoading = signal(true);
  hasError = signal(false);
  codeCopied = signal(false);
  linkCopied = signal(false);

  // Contact picker signals
  readonly contacts = signal<ContactResult[]>([]);
  readonly manualPhone = signal('');
  readonly manualName = signal('');
  readonly showConfirmDialog = signal(false);
  readonly selectedContact = signal<ContactResult | null>(null);
  readonly isContactPickerSupported = this.contactPicker.isSupported;

  readonly inviteMessage = 'Ciao! Ti invito a provare Fiutami, l\'app per gli amanti degli animali! Scaricala qui: https://fiutami.pet';

  inviteCode: string = '';
  inviteLink: string = '';

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.pageTitle = this.translate.instant('drawerInvite.title');
    });
  }

  ngOnInit(): void {
    this.inviteCode = this.inviteService.getInviteCode();
    this.inviteLink = this.inviteService.getInviteLink();
    this.inviteOptions.set(this.inviteService.getInviteOptions());
    this.loadData();
  }

  goBack(): void {
    this.location.back();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.inviteService.getPendingInvites().subscribe({
      next: (invites) => {
        this.pendingInvites.set(invites);
      },
      error: () => {
        this.hasError.set(true);
      }
    });

    this.inviteService.getInviteStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  retry(): void {
    this.loadData();
  }

  async copyCode(): Promise<void> {
    const success = await this.inviteService.copyToClipboard(this.inviteCode);
    if (success) {
      this.codeCopied.set(true);
      setTimeout(() => this.codeCopied.set(false), 2000);
    }
  }

  async copyLink(): Promise<void> {
    const success = await this.inviteService.copyToClipboard(this.inviteLink);
    if (success) {
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    }
  }

  shareVia(option: InviteOption): void {
    const message = this.inviteService.getInviteMessage();

    switch (option.id) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(this.translate.instant('drawerInvite.emailSubject'))}&body=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'copy':
        this.copyLink();
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: this.translate.instant('drawerInvite.shareTitle'),
            text: message,
            url: this.inviteLink
          }).catch(() => {});
        }
        break;
    }

    this.inviteService.sendInvite(option.id).subscribe();
  }

  getMethodIcon(method: InviteMethod): string {
    return this.inviteService.getMethodIcon(method);
  }

  getMethodLabel(method: InviteMethod): string {
    return this.inviteService.getMethodLabel(method);
  }

  getStatusLabel(status: InviteStatus): string {
    return this.inviteService.getStatusLabel(status);
  }

  getStatusClass(status: InviteStatus): string {
    return `status--${status}`;
  }

  formatRelativeTime(date: Date): string {
    return this.inviteService.formatRelativeTime(date);
  }

  formatExpiresIn(date: Date | undefined): string {
    if (!date) return '';
    return this.inviteService.formatExpiresIn(date);
  }

  getRecipientDisplay(invite: PendingInvite): string {
    return invite.recipientName || invite.recipientEmail || invite.recipientPhone || this.translate.instant('drawerInvite.contactFallback');
  }

  resendInvite(invite: PendingInvite): void {
    console.log('Resending invite:', invite.id);
    this.inviteService.sendInvite(invite.method).subscribe();
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
