import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TabPageShellYellowComponent } from '../../../../shared/components/tab-page-shell-yellow/tab-page-shell-yellow.component';

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  isMine: boolean;
  senderName: string;
  senderAvatar: string;
}

@Component({
  selector: 'app-pet-chat-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, TabPageShellYellowComponent],
  templateUrl: './pet-chat-messages.component.html',
  styleUrls: ['./pet-chat-messages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetChatMessagesComponent implements AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private readonly router = inject(Router);

  messageInput = signal('');
  isTyping = signal(false);

  messages = signal<ChatMessage[]>([
    {
      id: '1',
      text: 'Ciao! Come sta Luna oggi?',
      timestamp: new Date(2026, 1, 16, 9, 30),
      isMine: true,
      senderName: 'Tu',
      senderAvatar: '',
    },
    {
      id: '2',
      text: 'Benissimo! Siamo al parco, vieni?',
      timestamp: new Date(2026, 1, 16, 9, 32),
      isMine: false,
      senderName: 'Marco',
      senderAvatar: 'assets/images/default-pet-avatar.png',
    },
    {
      id: '3',
      text: 'Arrivo tra 10 minuti!',
      timestamp: new Date(2026, 1, 16, 9, 33),
      isMine: true,
      senderName: 'Tu',
      senderAvatar: '',
    },
    {
      id: '4',
      text: 'Perfetto, siamo vicino alla fontana',
      timestamp: new Date(2026, 1, 16, 9, 35),
      isMine: false,
      senderName: 'Marco',
      senderAvatar: 'assets/images/default-pet-avatar.png',
    },
    {
      id: '5',
      text: 'Luna è contentissima di vedervi!',
      timestamp: new Date(2026, 1, 16, 9, 45),
      isMine: false,
      senderName: 'Marco',
      senderAvatar: 'assets/images/default-pet-avatar.png',
    },
    {
      id: '6',
      text: 'Anche Rocky non sta nella pelliccia!',
      timestamp: new Date(2026, 1, 16, 9, 46),
      isMine: true,
      senderName: 'Tu',
      senderAvatar: '',
    },
  ]);

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  goBack(): void {
    this.router.navigate(['/home/pet-profile']);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  sendMessage(): void {
    const text = this.messageInput().trim();
    if (!text) return;

    const newMessage: ChatMessage = {
      id: String(this.messages().length + 1),
      text,
      timestamp: new Date(),
      isMine: true,
      senderName: 'Tu',
      senderAvatar: '',
    };

    this.messages.update(msgs => [...msgs, newMessage]);
    this.messageInput.set('');

    setTimeout(() => this.scrollToBottom(), 100);

    // Simulate typing indicator and auto-reply
    this.isTyping.set(true);
    setTimeout(() => {
      this.isTyping.set(false);
      this.sendAutoReply();
    }, 2000);
  }

  onInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private sendAutoReply(): void {
    const replies = [
      'Che bello!',
      'Perfetto, ci vediamo!',
      'Luna ti manda un abbraccio!',
      'Fantastico!',
      'A dopo!',
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    const autoMessage: ChatMessage = {
      id: String(this.messages().length + 1),
      text: randomReply,
      timestamp: new Date(),
      isMine: false,
      senderName: 'Marco',
      senderAvatar: 'assets/images/default-pet-avatar.png',
    };

    this.messages.update(msgs => [...msgs, autoMessage]);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }
}
