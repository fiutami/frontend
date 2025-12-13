import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export type InviteMethod = 'whatsapp' | 'sms' | 'email' | 'copy' | 'share';
export type InviteStatus = 'pending' | 'accepted' | 'expired';

export interface InviteOption {
  id: InviteMethod;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface PendingInvite {
  id: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  method: InviteMethod;
  sentAt: Date;
  status: InviteStatus;
  expiresAt?: Date;
}

export interface InviteStats {
  totalSent: number;
  accepted: number;
  pending: number;
  expired: number;
}

@Injectable({
  providedIn: 'root'
})
export class InviteService {
  private inviteCode = 'FIUTAMI2024';
  private inviteLink = 'https://fiutami.app/invite/FIUTAMI2024';

  getInviteOptions(): InviteOption[] {
    return [
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: 'chat',
        color: '#25D366',
        description: 'Condividi su WhatsApp'
      },
      {
        id: 'sms',
        label: 'SMS',
        icon: 'sms',
        color: '#4A90E2',
        description: 'Invia un messaggio SMS'
      },
      {
        id: 'email',
        label: 'Email',
        icon: 'email',
        color: '#EA4335',
        description: 'Invia un\'email'
      },
      {
        id: 'copy',
        label: 'Copia Link',
        icon: 'content_copy',
        color: '#607D8B',
        description: 'Copia il link negli appunti'
      },
      {
        id: 'share',
        label: 'Altro',
        icon: 'share',
        color: '#9C27B0',
        description: 'Altre opzioni di condivisione'
      }
    ];
  }

  getPendingInvites(): Observable<PendingInvite[]> {
    // Mock data - da sostituire con chiamata API reale
    const mockInvites: PendingInvite[] = [
      {
        id: 'inv_1',
        recipientName: 'Maria Rossi',
        recipientEmail: 'maria.rossi@email.com',
        method: 'email',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 ore fa
        status: 'pending',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) // 5 giorni
      },
      {
        id: 'inv_2',
        recipientName: 'Luca Bianchi',
        recipientPhone: '+39 333 1234567',
        method: 'whatsapp',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 giorno fa
        status: 'accepted'
      },
      {
        id: 'inv_3',
        recipientName: 'Anna Verdi',
        recipientPhone: '+39 347 9876543',
        method: 'sms',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 giorni fa
        status: 'pending',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4) // 4 giorni
      },
      {
        id: 'inv_4',
        recipientEmail: 'test@email.com',
        method: 'email',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 giorni fa
        status: 'expired'
      }
    ];

    // Simula delay di rete
    return of(mockInvites).pipe(delay(400));
  }

  getInviteStats(): Observable<InviteStats> {
    const mockStats: InviteStats = {
      totalSent: 12,
      accepted: 5,
      pending: 4,
      expired: 3
    };

    return of(mockStats).pipe(delay(300));
  }

  getInviteCode(): string {
    return this.inviteCode;
  }

  getInviteLink(): string {
    return this.inviteLink;
  }

  getInviteMessage(): string {
    return `Ciao! Ti invito a provare FiutaMi, l'app per gli amanti degli animali. Usa il mio codice invito ${this.inviteCode} per registrarti e ottenere vantaggi esclusivi! ${this.inviteLink}`;
  }

  sendInvite(method: InviteMethod, recipient?: string): Observable<boolean> {
    // Simula invio invito
    console.log(`Sending invite via ${method} to ${recipient || 'share sheet'}`);
    return of(true).pipe(delay(500));
  }

  copyToClipboard(text: string): Promise<boolean> {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => false);
  }

  getMethodIcon(method: InviteMethod): string {
    const iconMap: Record<InviteMethod, string> = {
      whatsapp: 'chat',
      sms: 'sms',
      email: 'email',
      copy: 'content_copy',
      share: 'share'
    };
    return iconMap[method] || 'share';
  }

  getMethodLabel(method: InviteMethod): string {
    const labelMap: Record<InviteMethod, string> = {
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      email: 'Email',
      copy: 'Link copiato',
      share: 'Condiviso'
    };
    return labelMap[method] || 'Altro';
  }

  getStatusLabel(status: InviteStatus): string {
    const labelMap: Record<InviteStatus, string> = {
      pending: 'In attesa',
      accepted: 'Accettato',
      expired: 'Scaduto'
    };
    return labelMap[status] || '';
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;

    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  formatExpiresIn(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Scaduto';
    if (diffDays === 1) return 'Scade domani';
    if (diffDays < 7) return `Scade tra ${diffDays} giorni`;

    return `Scade il ${date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}`;
  }
}
