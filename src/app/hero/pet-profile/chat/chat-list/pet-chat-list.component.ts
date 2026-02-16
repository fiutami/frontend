import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TabPageShellYellowComponent } from '../../../../shared/components/tab-page-shell-yellow/tab-page-shell-yellow.component';

export interface ChatConversation {
  id: string;
  petName: string;
  petSpecies: string;
  petAvatarUrl: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline: boolean;
  isBookmarked: boolean;
}

@Component({
  selector: 'app-pet-chat-list',
  standalone: true,
  imports: [CommonModule, TabPageShellYellowComponent],
  templateUrl: './pet-chat-list.component.html',
  styleUrls: ['./pet-chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetChatListComponent {
  private readonly router = inject(Router);

  /** Chat conversations list */
  conversations = signal<ChatConversation[]>([
    {
      id: 'conv-1',
      petName: 'Luna',
      petSpecies: 'Labrador Retriever',
      petAvatarUrl: 'assets/images/default-pet-avatar.png',
      lastMessage: 'Ci vediamo al parco domani alle 10?',
      timestamp: new Date(2026, 1, 16, 14, 23),
      unreadCount: 3,
      isOnline: true,
      isBookmarked: false,
    },
    {
      id: 'conv-2',
      petName: 'Max',
      petSpecies: 'Golden Retriever',
      petAvatarUrl: 'assets/images/default-pet-avatar.png',
      lastMessage: 'Grazie per la passeggiata di ieri!',
      timestamp: new Date(2026, 1, 16, 11, 5),
      unreadCount: 0,
      isOnline: true,
      isBookmarked: true,
    },
    {
      id: 'conv-3',
      petName: 'Bella',
      petSpecies: 'Beagle',
      petAvatarUrl: 'assets/images/default-pet-avatar.png',
      lastMessage: 'Ha adorato il nuovo giocattolo che gli hai regalato',
      timestamp: new Date(2026, 1, 15, 18, 42),
      unreadCount: 1,
      isOnline: false,
      isBookmarked: false,
    },
    {
      id: 'conv-4',
      petName: 'Rocky',
      petSpecies: 'Pastore Tedesco',
      petAvatarUrl: 'assets/images/default-pet-avatar.png',
      lastMessage: 'Conosci un buon veterinario in zona?',
      timestamp: new Date(2026, 1, 14, 9, 15),
      unreadCount: 0,
      isOnline: false,
      isBookmarked: false,
    },
    {
      id: 'conv-5',
      petName: 'Mia',
      petSpecies: 'Gatto Persiano',
      petAvatarUrl: 'assets/images/default-pet-avatar.png',
      lastMessage: 'Che tenero nella foto di oggi!',
      timestamp: new Date(2026, 1, 13, 20, 30),
      unreadCount: 0,
      isOnline: true,
      isBookmarked: true,
    },
  ]);

  /** Whether the list is empty */
  hasConversations = computed(() => this.conversations().length > 0);

  /** Navigate back */
  goBack(): void {
    this.router.navigate(['/home/pet-profile']);
  }

  /** Open a conversation */
  openConversation(conversationId: string): void {
    this.router.navigate(['/home/pet-profile/chat/messages'], {
      queryParams: { conversationId },
    });
  }

  /** Start a new message */
  newMessage(): void {
    this.router.navigate(['/home/pet-profile/chat/messages']);
  }

  /** Delete a conversation */
  deleteConversation(event: Event, conversationId: string): void {
    event.stopPropagation();
    this.conversations.update(convs =>
      convs.filter(c => c.id !== conversationId)
    );
  }

  /** Toggle bookmark on a conversation */
  toggleBookmark(event: Event, conversationId: string): void {
    event.stopPropagation();
    this.conversations.update(convs =>
      convs.map(c =>
        c.id === conversationId ? { ...c, isBookmarked: !c.isBookmarked } : c
      )
    );
  }

  /** Get avatar placeholder initial */
  getAvatarPlaceholder(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  /** Format timestamp to relative time */
  formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}g`;

    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    });
  }
}
