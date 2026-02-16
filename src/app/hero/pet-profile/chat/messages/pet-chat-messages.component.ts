import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, Subscription } from 'rxjs';
import { TabPageShellYellowComponent } from '../../../../shared/components/tab-page-shell-yellow/tab-page-shell-yellow.component';
import { ChatService } from '../../../../chat/services/chat.service';
import { Message } from '../../../../chat/models/chat.models';

@Component({
  selector: 'app-pet-chat-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, TabPageShellYellowComponent],
  templateUrl: './pet-chat-messages.component.html',
  styleUrls: ['./pet-chat-messages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetChatMessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly chatService = inject(ChatService);
  private readonly destroy$ = new Subject<void>();
  private pollSubscription?: Subscription;

  /** Current conversation ID */
  conversationId = '';

  /** Messages from API */
  messages = signal<Message[]>([]);

  /** Input field */
  messageInput = signal('');

  /** Loading state */
  isLoading = signal(true);

  /** Sending state */
  isSending = signal(false);

  /** Whether to scroll to bottom on next view check */
  private shouldScrollToBottom = true;

  ngOnInit(): void {
    this.conversationId =
      this.route.snapshot.queryParamMap.get('conversationId') || '';

    if (this.conversationId) {
      this.loadMessages();
      this.startPolling();
      this.chatService
        .markAsRead(this.conversationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    } else {
      this.isLoading.set(false);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Load initial messages */
  private loadMessages(): void {
    this.isLoading.set(true);
    this.chatService
      .getMessages(this.conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          this.messages.set(messages);
          this.isLoading.set(false);
          this.shouldScrollToBottom = true;
        },
        error: (err) => {
          console.error('Failed to load messages:', err);
          this.isLoading.set(false);
        },
      });
  }

  /** Start polling for new messages */
  private startPolling(): void {
    this.pollSubscription = this.chatService
      .pollMessages(this.conversationId, () => this.getLastMessageTime())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newMessages) => {
          const existingIds = new Set(this.messages().map((m) => m.id));
          const toAdd = newMessages.filter((m) => !existingIds.has(m.id));
          if (toAdd.length > 0) {
            this.messages.update((msgs) => [...msgs, ...toAdd]);
            this.shouldScrollToBottom = true;
            this.chatService
              .markAsRead(this.conversationId)
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          }
        },
      });
  }

  /** Stop polling */
  private stopPolling(): void {
    this.pollSubscription?.unsubscribe();
  }

  /** Get timestamp of last message for polling */
  private getLastMessageTime(): Date | undefined {
    const msgs = this.messages();
    if (msgs.length === 0) return undefined;
    const last = msgs[msgs.length - 1];
    return typeof last.createdAt === 'string'
      ? new Date(last.createdAt)
      : last.createdAt;
  }

  /** Send a message */
  sendMessage(): void {
    const text = this.messageInput().trim();
    if (!text || !this.conversationId) return;

    this.isSending.set(true);
    this.messageInput.set('');

    this.chatService
      .sendMessage(this.conversationId, { text })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sentMessage) => {
          this.messages.update((msgs) => [...msgs, sentMessage]);
          this.isSending.set(false);
          this.shouldScrollToBottom = true;
        },
        error: (err) => {
          console.error('Failed to send message:', err);
          this.messageInput.set(text); // Restore input on failure
          this.isSending.set(false);
        },
      });
  }

  /** Handle Enter key */
  onInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /** Format timestamp */
  formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /** Navigate back to chat list */
  goBack(): void {
    this.router.navigate(['/home/pet-profile/chat/list']);
  }

  /** Scroll to bottom of messages */
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }
}
