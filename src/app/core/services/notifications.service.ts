import { Injectable } from '@angular/core';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export type NotificationType = 'general' | 'security' | 'nearby' | 'friend' | 'pet' | 'event' | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  icon: string;
  actionUrl?: string;
  metadata?: {
    petName?: string;
    petId?: string;
    friendName?: string;
    eventName?: string;
    distance?: string;
  };
}

export type NotificationTab = 'all' | 'general' | 'security' | 'nearby';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private unreadCount$ = new BehaviorSubject<number>(0);

  getNotifications(tab: NotificationTab = 'all'): Observable<NotificationItem[]> {
    // Mock data
    const mockNotifications: NotificationItem[] = [
      {
        id: 'mock_notif_1',
        type: 'friend',
        title: 'Nuova richiesta di amicizia',
        message: 'Marco vuole aggiungerti come amico',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false,
        icon: 'person_add',
        metadata: { friendName: 'Marco' }
      },
      {
        id: 'mock_notif_2',
        type: 'nearby',
        title: 'Pet nelle vicinanze',
        message: 'Luna, un Golden Retriever, è a 500m da te',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isRead: false,
        icon: 'location_on',
        metadata: { petName: 'Luna', distance: '500m' }
      },
      {
        id: 'mock_notif_3',
        type: 'event',
        title: 'Evento domani',
        message: 'Passeggiata al parco inizia alle 10:00',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: false,
        icon: 'event',
        metadata: { eventName: 'Passeggiata al parco' }
      },
      {
        id: 'mock_notif_4',
        type: 'security',
        title: 'Nuovo accesso rilevato',
        message: 'Accesso effettuato da un nuovo dispositivo',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isRead: true,
        icon: 'security'
      },
      {
        id: 'mock_notif_5',
        type: 'pet',
        title: 'Promemoria vaccino',
        message: 'Il vaccino di Thor scade tra 7 giorni',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        isRead: true,
        icon: 'vaccines',
        metadata: { petName: 'Thor', petId: 'pet_1' }
      },
      {
        id: 'mock_notif_6',
        type: 'general',
        title: 'Benvenuto su FiutaMi!',
        message: 'Completa il tuo profilo per iniziare',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        isRead: true,
        icon: 'info'
      },
      {
        id: 'mock_notif_7',
        type: 'system',
        title: 'Aggiornamento disponibile',
        message: 'Nuove funzionalità sono disponibili',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        isRead: true,
        icon: 'system_update'
      }
    ];

    // Calculate unread count
    const unread = mockNotifications.filter(n => !n.isRead).length;
    this.unreadCount$.next(unread);

    return of(mockNotifications).pipe(
      delay(400),
      map(notifications => {
        if (tab === 'all') return notifications;

        const typeMap: Record<NotificationTab, NotificationType[]> = {
          all: [],
          general: ['general', 'friend', 'pet', 'event', 'system'],
          security: ['security'],
          nearby: ['nearby']
        };

        return notifications.filter(n => typeMap[tab].includes(n.type));
      })
    );
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  markAsRead(notificationId: string): Observable<boolean> {
    // Mock - in realtà chiamerebbe API
    console.log('Marking as read:', notificationId);
    return of(true).pipe(delay(200));
  }

  markAllAsRead(): Observable<boolean> {
    console.log('Marking all as read');
    this.unreadCount$.next(0);
    return of(true).pipe(delay(300));
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
      month: 'short'
    });
  }
}
