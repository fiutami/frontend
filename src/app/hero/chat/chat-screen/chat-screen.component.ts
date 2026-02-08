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
  attachmentUrl?: string;
}

export interface ConversationInfo {
  name: string;
  avatar: string | null;
  isOnline: boolean;
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
  recipientAvatar = signal<string | null>(null);
  isOnline = signal<boolean>(true);
  isTyping = signal<boolean>(false);
  messageInput = signal<string>('');

  // Mock messages data
  messages = signal<Message[]>([]);

  // Mock conversations map for names
  private conversationsMap: Record<string, ConversationInfo> = {
    '1': { name: 'Marco', avatar: null, isOnline: true },
    '2': { name: 'Sara', avatar: null, isOnline: false },
    '3': { name: 'Luca', avatar: null, isOnline: true },
    '4': { name: 'Giulia', avatar: null, isOnline: false },
  };

  // Mock messages per conversation
  private messagesMap: Record<string, Message[]> = {
    '1': [
      {
        id: 1,
        text: 'Are you still travelling?',
        sent: false,
        time: '10:20',
      },
      {
        id: 2,
        text: 'Yes, i\'m at Istanbul..',
        sent: true,
        time: '10:25',
      },
      {
        id: 3,
        text: 'OoOo, Thats so Cool!',
        sent: false,
        time: '10:26',
      },
      {
        id: 4,
        text: 'Raining??',
        sent: false,
        time: '10:27',
      },
      {
        id: 5,
        text: 'Hi, Did you heared?',
        sent: false,
        time: '14:30',
      },
      {
        id: 6,
        text: 'Ok!',
        sent: false,
        time: '14:35',
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
      const info = this.conversationsMap[id];
      if (info) {
        this.conversationName.set(info.name);
        this.recipientAvatar.set(info.avatar);
        this.isOnline.set(info.isOnline);
      } else {
        this.conversationName.set('Utente');
      }
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

  getDateLabel(): string {
    // Return a formatted date label
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const today = new Date();
    const dayName = days[today.getDay()];
    return `${dayName} ${today.getFullYear()}`;
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

    // Show typing indicator and mock auto-reply
    this.isTyping.set(true);
    setTimeout(() => {
      this.isTyping.set(false);
      this.sendAutoReply();
    }, 2000);
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
