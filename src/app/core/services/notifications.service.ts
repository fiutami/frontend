import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  private readonly apiUrl = `${environment.apiUrl}/notification`;
  private unreadCount$ = new BehaviorSubject<number>(0);

  // Signals for loading and error states
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  private getMockNotifications(): NotificationItem[] {
    return [
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
  }

  getNotifications(tab: NotificationTab = 'all'): Observable<NotificationItem[]> {
    this.loading.set(true);
    this.error.set(null);

    const url = tab === 'all' ? this.apiUrl : `${this.apiUrl}?type=${tab}`;

    return this.http.get<NotificationItem[]>(url).pipe(
      tap(notifications => {
        // Calculate unread count
        const unread = notifications.filter(n => !n.isRead).length;
        this.unreadCount$.next(unread);
        this.loading.set(false);
      }),
      catchError(err => {
        console.warn('API failed, using fallback:', err);
        this.error.set('Failed to load notifications from server, using cached data');
        this.loading.set(false);

        const mockNotifications = this.getMockNotifications();
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
      })
    );
  }

  getUnreadCount(): Observable<number> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<number>(`${this.apiUrl}/unread-count`).pipe(
      tap(count => {
        this.unreadCount$.next(count);
        this.loading.set(false);
      }),
      catchError(err => {
        console.warn('API failed for unread count, using fallback:', err);
        this.loading.set(false);
        return this.unreadCount$.asObservable();
      })
    );
  }

  markAsRead(notificationId: string): Observable<boolean> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<boolean>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        this.loading.set(false);
        // Decrement unread count
        const current = this.unreadCount$.value;
        if (current > 0) {
          this.unreadCount$.next(current - 1);
        }
      }),
      catchError(err => {
        console.warn('API failed to mark as read:', err);
        this.error.set('Failed to mark notification as read');
        this.loading.set(false);
        // Fallback to mock behavior
        return of(true).pipe(delay(200));
      })
    );
  }

  markAllAsRead(): Observable<boolean> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<boolean>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        this.loading.set(false);
        this.unreadCount$.next(0);
      }),
      catchError(err => {
        console.warn('API failed to mark all as read:', err);
        this.error.set('Failed to mark all notifications as read');
        this.loading.set(false);
        // Fallback to mock behavior
        this.unreadCount$.next(0);
        return of(true).pipe(delay(300));
      })
    );
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
