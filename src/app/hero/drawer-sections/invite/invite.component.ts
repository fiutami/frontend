import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { InviteService, InviteOption, PendingInvite, InviteStats, InviteMethod, InviteStatus } from '../../../core/services/invite.service';
import { BottomTabBarComponent } from '../../../shared/components/bottom-tab-bar/bottom-tab-bar.component';
import { TabItem } from '../../../shared/components/bottom-tab-bar/bottom-tab-bar.models';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [CommonModule, BottomTabBarComponent],
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InviteComponent implements OnInit {
  private location = inject(Location);
  private inviteService = inject(InviteService);

  inviteOptions = signal<InviteOption[]>([]);
  pendingInvites = signal<PendingInvite[]>([]);
  stats = signal<InviteStats | null>(null);
  isLoading = signal(true);
  hasError = signal(false);
  codeCopied = signal(false);
  linkCopied = signal(false);

  inviteCode: string = '';
  inviteLink: string = '';

  tabs: TabItem[] = [
    { id: 'home', icon: 'home', label: 'Home', route: '/home' },
    { id: 'explore', icon: 'explore', label: 'Esplora', route: '/explore' },
    { id: 'add', icon: 'add_circle', label: 'Aggiungi', route: '/add' },
    { id: 'messages', icon: 'chat', label: 'Messaggi', route: '/messages' },
    { id: 'profile', icon: 'person', label: 'Profilo', route: '/profile' }
  ];

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
        window.open(`mailto:?subject=${encodeURIComponent('Ti invito su FiutaMi!')}&body=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'copy':
        this.copyLink();
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: 'FiutaMi - Invito',
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
    return invite.recipientName || invite.recipientEmail || invite.recipientPhone || 'Contatto';
  }

  resendInvite(invite: PendingInvite): void {
    console.log('Resending invite:', invite.id);
    this.inviteService.sendInvite(invite.method).subscribe();
  }
}
