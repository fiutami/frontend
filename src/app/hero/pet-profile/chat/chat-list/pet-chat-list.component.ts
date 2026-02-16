import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TabPageShellYellowComponent } from '../../../../shared/components/tab-page-shell-yellow/tab-page-shell-yellow.component';
import { ChatService } from '../../../../chat/services/chat.service';
import { Conversation } from '../../../../chat/models/chat.models';

@Component({
  selector: 'app-pet-chat-list',
  standalone: true,
  imports: [CommonModule, TabPageShellYellowComponent],
  templateUrl: './pet-chat-list.component.html',
  styleUrls: ['./pet-chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetChatListComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly chatService = inject(ChatService);
  private readonly destroy$ = new Subject<void>();

  /** Conversations from API */
  conversations = signal<Conversation[]>([]);

  /** Loading state */
  isLoading = signal(true);

  /** Error state */
  errorMessage = signal<string | null>(null);

  /** Whether the list has conversations */
  hasConversations = computed(() => this.conversations().length > 0);

  ngOnInit(): void {
    this.loadConversations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Load conversations from API */
  private loadConversations(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.chatService
      .getConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversations) => {
          this.conversations.set(conversations);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load conversations:', err);
          this.errorMessage.set('Impossibile caricare le conversazioni');
          this.isLoading.set(false);
        },
      });
  }

  /** Navigate back */
  goBack(): void {
    this.router.navigate(['/home/pet-profile']);
  }

  /** Open a conversation */
  openConversation(conversationId: string): void {
    this.chatService
      .markAsRead(conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.router.navigate(['/home/pet-profile/chat/messages'], {
      queryParams: { conversationId },
    });
  }

  /** Start a new message */
  newMessage(): void {
    this.router.navigate(['/home/pet-profile/chat/messages']);
  }

  /** Delete a conversation (local only for now) */
  deleteConversation(event: Event, conversationId: string): void {
    event.stopPropagation();
    this.conversations.update((convs) =>
      convs.filter((c) => c.id !== conversationId)
    );
  }

  /** Format timestamp to relative time */
  formatTime(date: Date | string | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}g`;

    return d.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    });
  }
}
