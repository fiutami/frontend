import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Message, Conversation } from '../models/chat.models';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat-conversation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './chat-conversation.component.html',
  styleUrls: ['./chat-conversation.component.scss']
})
export class ChatConversationComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  conversationId = '';
  newMessage = '';
  messages: Message[] = [];
  recipient: Partial<Conversation> = {};
  isTyping = false;
  loading = true;
  sending = false;

  private destroy$ = new Subject<void>();
  private pollSubscription?: Subscription;
  private shouldScrollToBottom = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.conversationId = this.route.snapshot.paramMap.get('id') || '';
    this.loadMessages();
    this.startPolling();
    this.markAsRead();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopPolling();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadMessages(): void {
    this.loading = true;
    this.chatService.getMessages(this.conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          this.messages = messages;
          this.loading = false;
          this.shouldScrollToBottom = true;
          // Extract recipient info from first message if available
          if (messages.length > 0) {
            const otherMessage = messages.find(m => !m.isMine);
            if (otherMessage) {
              this.recipient = {
                recipientName: 'Chat',
                isOnline: true
              };
            }
          }
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  // POLLING every 5 seconds for new messages
  startPolling(): void {
    this.pollSubscription = this.chatService
      .pollMessages(this.conversationId, () => this.getLastMessageTime())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newMessages) => {
          if (newMessages.length > 0) {
            // Add only new messages
            const existingIds = new Set(this.messages.map(m => m.id));
            const toAdd = newMessages.filter(m => !existingIds.has(m.id));
            if (toAdd.length > 0) {
              this.messages.push(...toAdd);
              this.shouldScrollToBottom = true;
              this.markAsRead();
            }
          }
        }
      });
  }

  stopPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  getLastMessageTime(): Date | undefined {
    if (this.messages.length === 0) return undefined;
    const last = this.messages[this.messages.length - 1];
    return new Date(last.createdAt);
  }

  markAsRead(): void {
    this.chatService.markAsRead(this.conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  goBack(): void {
    this.router.navigate(['/chat']);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.sending) return;

    this.sending = true;
    const text = this.newMessage.trim();
    this.newMessage = '';

    this.chatService.sendMessage(this.conversationId, { text })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          this.messages.push(message);
          this.shouldScrollToBottom = true;
          this.sending = false;
        },
        error: () => {
          this.newMessage = text; // Restore on error
          this.sending = false;
        }
      });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  attachFile(): void {
    // TODO: Implement file attachment
    console.log('Attach file');
  }

  openCamera(): void {
    // TODO: Implement camera
    console.log('Open camera');
  }

  recordVoice(): void {
    // TODO: Implement voice recording
    console.log('Record voice');
  }

  openMenu(): void {
    // TODO: Implement menu options
    console.log('Open menu');
  }

  openCall(): void {
    // TODO: Implement call
    console.log('Open call');
  }

  formatMessageDate(date: Date | string): string {
    const msgDate = new Date(date);
    const today = new Date();

    if (msgDate.toDateString() === today.toDateString()) {
      return 'Oggi';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Ieri';
    }

    return msgDate.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;

    const currentDate = new Date(this.messages[index].createdAt).toDateString();
    const prevDate = new Date(this.messages[index - 1].createdAt).toDateString();

    return currentDate !== prevDate;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // Handle error silently
    }
  }
}
