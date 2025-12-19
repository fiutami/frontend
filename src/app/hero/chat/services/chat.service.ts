import { Injectable, signal } from '@angular/core';

export interface Conversation {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string | null;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  attachmentUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private conversations = signal<Conversation[]>([]);
  private currentUserId = 'me';

  // Mock data for MVP
  private mockConversations: Conversation[] = [
    {
      id: '1',
      recipientId: 'user1',
      recipientName: 'Luna (Maria)',
      recipientAvatar: null,
      lastMessage: 'Ci vediamo al parco domani?',
      lastMessageTime: new Date(Date.now() - 3600000),
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      recipientId: 'user2',
      recipientName: 'Micio (Giuseppe)',
      recipientAvatar: null,
      lastMessage: 'Grazie per il consiglio!',
      lastMessageTime: new Date(Date.now() - 86400000),
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '3',
      recipientId: 'user3',
      recipientName: 'Rocky (Anna)',
      recipientAvatar: null,
      lastMessage: 'Il mio cane è bellissimo!',
      lastMessageTime: new Date(Date.now() - 172800000),
      unreadCount: 1,
      isOnline: true
    },
    {
      id: '4',
      recipientId: 'user4',
      recipientName: 'Bella (Marco)',
      recipientAvatar: null,
      lastMessage: 'Perfetto, a dopo!',
      lastMessageTime: new Date(Date.now() - 259200000),
      unreadCount: 0,
      isOnline: false
    }
  ];

  constructor() {
    // Initialize with mock data
    this.loadConversations();
  }

  getConversations() {
    return this.conversations;
  }

  loadConversations(): void {
    // In a real app, this would fetch from API
    this.conversations.set(this.mockConversations);
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations().find(c => c.id === id);
  }

  getMessages(conversationId: string): Message[] {
    // Mock messages - in real app would fetch from API
    const mockMessages: Record<string, Message[]> = {
      '1': [
        {
          id: '1',
          conversationId: '1',
          senderId: 'user1',
          text: 'Are you still travelling?',
          timestamp: new Date(Date.now() - 7200000),
          isRead: true
        },
        {
          id: '2',
          conversationId: '1',
          senderId: 'me',
          text: 'Yes, i\'m at Istanbul..',
          timestamp: new Date(Date.now() - 6800000),
          isRead: true
        },
        {
          id: '3',
          conversationId: '1',
          senderId: 'user1',
          text: 'OoOo, Thats so Cool!',
          timestamp: new Date(Date.now() - 6400000),
          isRead: true
        },
        {
          id: '4',
          conversationId: '1',
          senderId: 'user1',
          text: 'Raining??',
          timestamp: new Date(Date.now() - 6000000),
          isRead: true
        },
        {
          id: '5',
          conversationId: '1',
          senderId: 'user1',
          text: 'Hi, Did you heared?',
          timestamp: new Date(Date.now() - 3700000),
          isRead: false
        },
        {
          id: '6',
          conversationId: '1',
          senderId: 'user1',
          text: 'Ci vediamo al parco domani?',
          timestamp: new Date(Date.now() - 3600000),
          isRead: false
        },
      ],
      '2': [
        {
          id: '1',
          conversationId: '2',
          senderId: 'me',
          text: 'Ciao! Hai trovato un buon veterinario?',
          timestamp: new Date(Date.now() - 90000000),
          isRead: true
        },
        {
          id: '2',
          conversationId: '2',
          senderId: 'user2',
          text: 'Sì, grazie! Il dott. Rossi è fantastico',
          timestamp: new Date(Date.now() - 87000000),
          isRead: true
        },
        {
          id: '3',
          conversationId: '2',
          senderId: 'user2',
          text: 'Grazie per il consiglio!',
          timestamp: new Date(Date.now() - 86400000),
          isRead: true
        },
      ],
    };

    return mockMessages[conversationId] || [];
  }

  sendMessage(conversationId: string, text: string): Message {
    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      senderId: this.currentUserId,
      text,
      timestamp: new Date(),
      isRead: false
    };

    // Update last message in conversation
    this.conversations.update(convs =>
      convs.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: text, lastMessageTime: new Date() }
          : c
      )
    );

    return newMessage;
  }

  markAsRead(conversationId: string): void {
    this.conversations.update(convs =>
      convs.map(c =>
        c.id === conversationId
          ? { ...c, unreadCount: 0 }
          : c
      )
    );
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (days === 1) {
      return 'Ieri';
    } else if (days < 7) {
      const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      return dayNames[date.getDay()];
    } else {
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  }
}
