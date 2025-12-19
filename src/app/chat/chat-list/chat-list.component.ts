import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Conversation } from '../models/chat.models';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit {
  searchQuery = '';
  conversations: Conversation[] = [];

  // Mock recent contacts for avatar row
  recentContacts = [
    { id: '1', name: 'Ariana', avatar: 'assets/images/avatars/avatar1.jpg' },
    { id: '2', name: 'Jenny', avatar: 'assets/images/avatars/avatar2.jpg' },
    { id: '3', name: 'Jame', avatar: 'assets/images/avatars/avatar3.jpg' },
    { id: '4', name: 'Nalli', avatar: 'assets/images/avatars/avatar4.jpg' },
    { id: '5', name: 'Ken', avatar: 'assets/images/avatars/avatar5.jpg' },
  ];

  // Mock conversations
  mockConversations: Conversation[] = [
    {
      id: '1',
      recipientId: 'user1',
      recipientName: 'Luna & Maria',
      recipientAvatar: 'assets/images/avatars/avatar1.jpg',
      lastMessage: 'Ci vediamo al parco domani?',
      lastMessageTime: new Date(),
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      recipientId: 'user2',
      recipientName: 'Micio & Giuseppe',
      recipientAvatar: 'assets/images/avatars/avatar2.jpg',
      lastMessage: 'Grazie per il consiglio!',
      lastMessageTime: new Date(Date.now() - 3600000),
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '3',
      recipientId: 'user3',
      recipientName: 'Rocky & Anna',
      recipientAvatar: 'assets/images/avatars/avatar3.jpg',
      lastMessage: 'Il veterinario ha detto che sta meglio',
      lastMessageTime: new Date(Date.now() - 86400000),
      unreadCount: 0,
      isOnline: true
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    // TODO: Replace with API call
    this.conversations = this.mockConversations;
  }

  get isEmpty(): boolean {
    return this.conversations.length === 0;
  }

  get todayConversations(): Conversation[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.conversations.filter(c => {
      const msgDate = new Date(c.lastMessageTime);
      msgDate.setHours(0, 0, 0, 0);
      return msgDate.getTime() === today.getTime();
    });
  }

  get yesterdayConversations(): Conversation[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return this.conversations.filter(c => {
      const msgDate = new Date(c.lastMessageTime);
      msgDate.setHours(0, 0, 0, 0);
      return msgDate.getTime() === yesterday.getTime();
    });
  }

  get olderConversations(): Conversation[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return this.conversations.filter(c => {
      const msgDate = new Date(c.lastMessageTime);
      msgDate.setHours(0, 0, 0, 0);
      return msgDate.getTime() < yesterday.getTime();
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  openConversation(conversationId: string): void {
    this.router.navigate(['/chat', conversationId]);
  }

  startNewMessage(): void {
    // TODO: Implement new message flow
    console.log('Start new message');
  }

  findFriends(): void {
    this.router.navigate(['/home']);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.conversations = this.mockConversations.filter(c =>
        c.recipientName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.conversations = this.mockConversations;
    }
  }
}
