import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { Conversation } from '../models/chat.models';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit, OnDestroy {
  searchQuery = '';
  conversations: Conversation[] = [];
  allConversations: Conversation[] = [];
  loading = true;
  error = false;

  // Mock recent contacts for avatar row
  recentContacts = [
    { id: '1', name: 'Ariana', avatar: 'assets/images/avatars/avatar1.jpg' },
    { id: '2', name: 'Jenny', avatar: 'assets/images/avatars/avatar2.jpg' },
    { id: '3', name: 'Jame', avatar: 'assets/images/avatars/avatar3.jpg' },
    { id: '4', name: 'Nalli', avatar: 'assets/images/avatars/avatar4.jpg' },
    { id: '5', name: 'Ken', avatar: 'assets/images/avatars/avatar5.jpg' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadConversations(): void {
    this.loading = true;
    this.error = false;

    this.chatService.getConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversations) => {
          this.allConversations = conversations;
          this.conversations = conversations;
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
  }

  get isEmpty(): boolean {
    return !this.loading && this.conversations.length === 0;
  }

  get todayConversations(): Conversation[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.conversations.filter(c => {
      if (!c.lastMessageTime) return false;
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
      if (!c.lastMessageTime) return false;
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
      if (!c.lastMessageTime) return false;
      const msgDate = new Date(c.lastMessageTime);
      msgDate.setHours(0, 0, 0, 0);
      return msgDate.getTime() < yesterday.getTime();
    });
  }

  formatTime(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) return 'ora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  openConversation(conversationId: string): void {
    this.router.navigate(['/chat', conversationId]);
  }

  startNewMessage(): void {
    this.router.navigate(['/user/friends']);
  }

  findFriends(): void {
    this.router.navigate(['/home']);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.conversations = this.allConversations.filter(c =>
        c.recipientName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.conversations = this.allConversations;
    }
  }
}
