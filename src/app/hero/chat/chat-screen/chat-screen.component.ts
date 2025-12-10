import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface Message {
  id: number;
  text: string;
  sent: boolean; // true = sent by user, false = received
  time: string;
}

@Component({
  selector: 'app-chat-screen',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './chat-screen.component.html',
  styleUrls: ['./chat-screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatScreenComponent implements OnInit, AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  conversationId = signal<string>('');
  conversationName = signal<string>('');
  messageInput = signal<string>('');

  // Mock messages data
  messages = signal<Message[]>([]);

  // Mock conversations map for names
  private conversationsMap: Record<string, string> = {
    '1': 'Marco',
    '2': 'Sara',
    '3': 'Luca',
    '4': 'Giulia',
  };

  // Mock messages per conversation
  private messagesMap: Record<string, Message[]> = {
    '1': [
      {
        id: 1,
        text: 'Ciao! Come sta il tuo cagnolino?',
        sent: false,
        time: '10:28',
      },
      {
        id: 2,
        text: 'Benissimo! Oggi siamo andati al parco',
        sent: true,
        time: '10:29',
      },
      {
        id: 3,
        text: 'Ci vediamo al parco?',
        sent: false,
        time: '10:30',
      },
    ],
    '2': [
      {
        id: 1,
        text: 'Ciao Sara! Hai trovato un buon veterinario?',
        sent: true,
        time: '09:15',
      },
      {
        id: 2,
        text: 'Sì, grazie! Il dott. Rossi è fantastico',
        sent: false,
        time: '09:20',
      },
      {
        id: 3,
        text: 'Grazie per i consigli!',
        sent: false,
        time: '09:25',
      },
    ],
    '3': [
      {
        id: 1,
        text: 'Ciao Luca!',
        sent: true,
        time: 'Ieri',
      },
      {
        id: 2,
        text: 'Il mio cane è bellissimo!',
        sent: false,
        time: 'Ieri',
      },
    ],
    '4': [
      {
        id: 1,
        text: 'Ci vediamo domani per la passeggiata?',
        sent: true,
        time: 'Lunedì',
      },
      {
        id: 2,
        text: 'Perfetto, a dopo!',
        sent: false,
        time: 'Lunedì',
      },
    ],
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('conversationId');
    if (id) {
      this.conversationId.set(id);
      this.conversationName.set(this.conversationsMap[id] || 'Utente');
      this.messages.set(this.messagesMap[id] || []);
    } else {
      // No conversation ID, redirect back to list
      this.router.navigate(['/home/chat']);
    }
  }

  ngAfterViewInit(): void {
    // Scroll to bottom after view init
    this.scrollToBottom();
  }

  goBack(): void {
    this.router.navigate(['/home/chat']);
  }

  sendMessage(): void {
    const text = this.messageInput().trim();
    if (!text) return;

    // Add new message
    const newMessage: Message = {
      id: this.messages().length + 1,
      text: text,
      sent: true,
      time: new Date().toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    this.messages.update((msgs) => [...msgs, newMessage]);
    this.messageInput.set('');

    // Scroll to bottom after sending
    setTimeout(() => this.scrollToBottom(), 100);

    // Mock auto-reply after 2 seconds
    setTimeout(() => this.sendAutoReply(), 2000);
  }

  private sendAutoReply(): void {
    const replies = [
      'Interessante!',
      'Certo, d\'accordo!',
      'Che bello!',
      'Perfetto!',
      'Ci vediamo presto!',
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    const autoMessage: Message = {
      id: this.messages().length + 1,
      text: randomReply,
      sent: false,
      time: new Date().toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    this.messages.update((msgs) => [...msgs, autoMessage]);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  onInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
