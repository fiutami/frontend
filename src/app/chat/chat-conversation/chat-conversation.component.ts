import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Message, Conversation } from '../models/chat.models';

@Component({
  selector: 'app-chat-conversation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './chat-conversation.component.html',
  styleUrls: ['./chat-conversation.component.scss']
})
export class ChatConversationComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  conversationId: string = '';
  newMessage: string = '';
  messages: Message[] = [];
  recipient: Partial<Conversation> = {};
  isTyping: boolean = false;
  private shouldScrollToBottom = true;

  // Mock messages
  mockMessages: Message[] = [
    {
      id: '1',
      conversationId: '1',
      senderId: 'other',
      text: 'Are you still travelling?',
      timestamp: new Date(Date.now() - 86400000 * 2),
      isRead: true,
      isMine: false
    },
    {
      id: '2',
      conversationId: '1',
      senderId: 'other',
      text: 'OoOo, Thats so Cool!',
      timestamp: new Date(Date.now() - 86400000 * 2),
      isRead: true,
      isMine: false
    },
    {
      id: '3',
      conversationId: '1',
      senderId: 'other',
      text: 'Raining??',
      timestamp: new Date(Date.now() - 86400000 * 2),
      isRead: true,
      isMine: false
    },
    {
      id: '4',
      conversationId: '1',
      senderId: 'me',
      text: 'Yes, i\'m at Istanbul..',
      timestamp: new Date(Date.now() - 86400000 * 2),
      isRead: true,
      isMine: true
    },
    {
      id: '5',
      conversationId: '1',
      senderId: 'other',
      text: 'Hi, Did you heared?',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
      isMine: false
    },
    {
      id: '6',
      conversationId: '1',
      senderId: 'other',
      text: 'Ok!',
      timestamp: new Date(Date.now() - 1800000),
      isRead: true,
      isMine: false
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.conversationId = this.route.snapshot.paramMap.get('id') || '';
    this.loadConversation();
    this.loadMessages();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
  }

  loadConversation(): void {
    // TODO: Replace with API call
    this.recipient = {
      recipientName: 'Smith Mathew',
      recipientAvatar: 'assets/images/avatars/avatar1.jpg',
      isOnline: true
    };
  }

  loadMessages(): void {
    // TODO: Replace with API call
    this.messages = this.mockMessages;
    this.shouldScrollToBottom = true;
  }

  goBack(): void {
    this.router.navigate(['/chat']);
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      conversationId: this.conversationId,
      senderId: 'me',
      text: this.newMessage.trim(),
      timestamp: new Date(),
      isRead: false,
      isMine: true
    };

    this.messages.push(message);
    this.newMessage = '';
    this.shouldScrollToBottom = true;
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

  formatMessageDate(date: Date): string {
    const today = new Date();
    const msgDate = new Date(date);

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

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;

    const currentDate = new Date(this.messages[index].timestamp).toDateString();
    const prevDate = new Date(this.messages[index - 1].timestamp).toDateString();

    return currentDate !== prevDate;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
        this.shouldScrollToBottom = false;
      }
    } catch (err) {
      // Handle error silently
    }
  }
}
