import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface ActivityItem {
  id: string;
  type: 'login' | 'pet_add' | 'pet_update' | 'profile_update' | 'event_create' | 'friend_add' | 'like' | 'comment';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  metadata?: {
    petName?: string;
    petId?: string;
    eventName?: string;
    friendName?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  getActivities(): Observable<ActivityItem[]> {
    // Mock data - da sostituire con chiamata API reale
    const mockActivities: ActivityItem[] = [
      {
        id: 'mock_act_1',
        type: 'pet_add',
        title: 'Nuovo pet aggiunto',
        description: 'Hai aggiunto Thor alla tua famiglia',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min fa
        icon: 'pets',
        metadata: { petName: 'Thor', petId: 'pet_1' }
      },
      {
        id: 'mock_act_2',
        type: 'profile_update',
        title: 'Profilo aggiornato',
        description: 'Hai modificato le tue informazioni personali',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 ore fa
        icon: 'person'
      },
      {
        id: 'mock_act_3',
        type: 'event_create',
        title: 'Evento creato',
        description: 'Hai creato l\'evento "Passeggiata al parco"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 giorno fa
        icon: 'event',
        metadata: { eventName: 'Passeggiata al parco' }
      },
      {
        id: 'mock_act_4',
        type: 'login',
        title: 'Accesso effettuato',
        description: 'Hai effettuato l\'accesso da un nuovo dispositivo',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 giorni fa
        icon: 'login'
      },
      {
        id: 'mock_act_5',
        type: 'friend_add',
        title: 'Nuovo amico',
        description: 'Hai aggiunto Marco come amico',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 giorni fa
        icon: 'person_add',
        metadata: { friendName: 'Marco' }
      },
      {
        id: 'mock_act_6',
        type: 'pet_update',
        title: 'Scheda pet aggiornata',
        description: 'Hai aggiornato le informazioni di Thor',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 giorni fa
        icon: 'edit',
        metadata: { petName: 'Thor', petId: 'pet_1' }
      }
    ];

    // Simula delay di rete
    return of(mockActivities).pipe(delay(500));
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
}
