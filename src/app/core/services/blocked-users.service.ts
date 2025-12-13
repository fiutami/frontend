import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';

export interface BlockedUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  blockedAt: Date;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlockedUsersService {

  private mockBlockedUsers: BlockedUser[] = [
    {
      id: 'user_1',
      username: 'mario_rossi',
      displayName: 'Mario Rossi',
      avatarUrl: 'assets/images/avatars/avatar-1.png',
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      reason: 'Spam'
    },
    {
      id: 'user_2',
      username: 'luigi_bianchi',
      displayName: 'Luigi Bianchi',
      avatarUrl: 'assets/images/avatars/avatar-2.png',
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      reason: 'Comportamento inappropriato'
    },
    {
      id: 'user_3',
      username: 'anna_verdi',
      displayName: 'Anna Verdi',
      avatarUrl: 'assets/images/avatars/avatar-3.png',
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
    },
    {
      id: 'user_4',
      username: 'franco_neri',
      displayName: 'Franco Neri',
      avatarUrl: 'assets/images/avatars/avatar-4.png',
      blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      reason: 'Molestie'
    }
  ];

  getBlockedUsers(): Observable<BlockedUser[]> {
    return of([...this.mockBlockedUsers]).pipe(delay(500));
  }

  unblockUser(userId: string): Observable<boolean> {
    // Simula rimozione utente dalla lista
    const index = this.mockBlockedUsers.findIndex(u => u.id === userId);
    if (index > -1) {
      this.mockBlockedUsers.splice(index, 1);
    }
    return of(true).pipe(delay(400));
  }

  blockUser(userId: string, reason?: string): Observable<boolean> {
    console.log('User blocked:', { userId, reason });
    return of(true).pipe(delay(400));
  }

  formatBlockedDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Oggi';
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mesi fa`;

    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
