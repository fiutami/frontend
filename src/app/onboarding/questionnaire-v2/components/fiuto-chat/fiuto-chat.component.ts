/**
 * Fiuto Chat Component
 *
 * Floating chat bubble for AI assistance during questionnaire.
 * Context-aware: knows current question and previous answers.
 *
 * @version 1.1
 */

import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  input,
  ElementRef,
  ViewChild,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FiutoAiService, ChatContext, ChatMessage } from '../../engine/fiuto-ai.service';
import { UserPreferenceProfile } from '../../models/profile.models';

@Component({
  selector: 'app-fiuto-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './fiuto-chat.component.html',
  styleUrl: './fiuto-chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiutoChatComponent implements AfterViewChecked {
  private readonly fiutoAi = inject(FiutoAiService);

  // Inputs
  currentQuestionId = input<string | undefined>();
  currentQuestionText = input<string | undefined>();
  userProfile = input<Partial<UserPreferenceProfile>>({});
  phase = input<'questionnaire' | 'results' | 'general'>('questionnaire');

  // State
  readonly isOpen = signal(false);
  readonly inputText = signal('');
  readonly hasUnread = signal(false);

  // From service
  readonly messages = this.fiutoAi.messages;
  readonly isTyping = this.fiutoAi.isTyping;
  readonly error = this.fiutoAi.error;

  // Computed
  readonly visibleMessages = computed(() =>
    this.messages().filter(m => m.role !== 'system')
  );

  readonly hasMessages = computed(() => this.visibleMessages().length > 0);

  // Quick suggestions based on phase
  readonly quickSuggestions = computed(() => {
    const p = this.phase();
    if (p === 'questionnaire') {
      return [
        { text: 'Non capisco questa domanda', icon: '❓' },
        { text: 'Qual è la differenza tra le opzioni?', icon: '🔄' },
        { text: 'Perché mi chiedi questo?', icon: '💭' }
      ];
    }
    if (p === 'results') {
      return [
        { text: 'Perché questa razza?', icon: '🐕' },
        { text: 'Quali sono i contro?', icon: '⚖️' },
        { text: 'Alternative simili?', icon: '🔍' }
      ];
    }
    return [
      { text: 'Come funziona il quiz?', icon: '📝' },
      { text: 'Che animale mi consigli?', icon: '🐾' }
    ];
  });

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  private shouldScrollToBottom = false;

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.messagesContainer) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.hasUnread.set(false);
      // Show welcome message if first open
      if (!this.hasMessages()) {
        this.fiutoAi.addSystemMessage(this.getWelcomeMessage());
      }
    }
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  async sendMessage(): Promise<void> {
    const text = this.inputText().trim();
    if (!text || this.isTyping()) return;

    this.inputText.set('');
    this.shouldScrollToBottom = true;

    const context: ChatContext = {
      currentQuestionId: this.currentQuestionId(),
      currentQuestionText: this.currentQuestionText(),
      userProfile: this.userProfile(),
      conversationPhase: this.phase()
    };

    await this.fiutoAi.sendMessage(text, context);
    this.shouldScrollToBottom = true;
  }

  async sendQuickMessage(suggestion: { text: string }): Promise<void> {
    this.inputText.set(suggestion.text);
    await this.sendMessage();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.fiutoAi.clearHistory();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  private getWelcomeMessage(): string {
    const p = this.phase();
    if (p === 'questionnaire') {
      return 'Ciao! Sono Fiuto 🐕 Sono qui per aiutarti durante il questionario. ' +
        'Se hai dubbi su una domanda, chiedimi pure!';
    }
    if (p === 'results') {
      return 'Ecco i tuoi risultati! Se vuoi capire meglio perché ti suggeriamo ' +
        'queste razze, sono qui per spiegarti. 🎯';
    }
    return 'Ciao! Sono Fiuto, il tuo assistente per trovare l\'animale perfetto! 🐾';
  }

  trackByMessageId(_: number, message: ChatMessage): string {
    return message.id;
  }
}
