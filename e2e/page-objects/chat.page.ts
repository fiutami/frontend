import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Chat Page Object
 * Covers: Chat list, conversations, and messaging
 */
export class ChatPage extends BasePage {
  // Chat List
  get chatList(): Locator {
    return this.page.locator('.chat-list, [data-testid="chat-list"]');
  }

  get conversationItems(): Locator {
    return this.page.locator('.conversation-item, [data-testid="conversation"], .chat-item');
  }

  get emptyState(): Locator {
    return this.page.locator('.empty-state, [data-testid="empty-state"], .chat-empty');
  }

  get searchInput(): Locator {
    return this.page.locator('.chat-search input, [data-testid="chat-search"]');
  }

  get newChatButton(): Locator {
    return this.page.locator('button').filter({ hasText: /nuovo|new|avvia/i });
  }

  // Conversation item details
  get conversationAvatar(): Locator {
    return this.page.locator('.conversation-item__avatar, .chat-avatar');
  }

  get conversationName(): Locator {
    return this.page.locator('.conversation-item__name, .chat-name');
  }

  get conversationLastMessage(): Locator {
    return this.page.locator('.conversation-item__last-message, .chat-preview');
  }

  get conversationTime(): Locator {
    return this.page.locator('.conversation-item__time, .chat-time');
  }

  get unreadBadge(): Locator {
    return this.page.locator('.conversation-item__unread, .unread-badge');
  }

  // Chat Screen
  get chatHeader(): Locator {
    return this.page.locator('.chat-header, [data-testid="chat-header"]');
  }

  get chatRecipientName(): Locator {
    return this.page.locator('.chat-header__name, .recipient-name');
  }

  get chatRecipientStatus(): Locator {
    return this.page.locator('.chat-header__status, .recipient-status');
  }

  get backButton(): Locator {
    return this.page.locator('.chat-header button, button').filter({ hasText: /←|back|indietro|arrow_back/i }).first();
  }

  get moreOptionsButton(): Locator {
    return this.page.locator('.chat-header button').filter({ hasText: /⋮|more|opzioni/i });
  }

  // Messages
  get messagesContainer(): Locator {
    return this.page.locator('.messages-container, .chat-messages, [data-testid="messages"]');
  }

  get messageBubbles(): Locator {
    return this.page.locator('.message-bubble, .message, [data-testid="message"]');
  }

  get sentMessages(): Locator {
    return this.page.locator('.message--sent, .message-bubble--sent, [data-testid="sent-message"]');
  }

  get receivedMessages(): Locator {
    return this.page.locator('.message--received, .message-bubble--received, [data-testid="received-message"]');
  }

  get messageText(): Locator {
    return this.page.locator('.message__text, .message-content');
  }

  get messageTime(): Locator {
    return this.page.locator('.message__time, .message-timestamp');
  }

  get messageStatus(): Locator {
    return this.page.locator('.message__status, .message-status');
  }

  // Input area
  get messageInput(): Locator {
    return this.page.locator('.message-input input, .message-input textarea, [data-testid="message-input"], input[placeholder*="messaggio"], textarea[placeholder*="messaggio"]').first();
  }

  get sendButton(): Locator {
    return this.page.locator('.send-button, button').filter({ hasText: /invia|send|→|arrow_forward/i }).first();
  }

  get attachButton(): Locator {
    return this.page.locator('button').filter({ hasText: /allega|attach|📎/i });
  }

  get emojiButton(): Locator {
    return this.page.locator('button').filter({ hasText: /emoji|😀/i });
  }

  // Typing indicator
  get typingIndicator(): Locator {
    return this.page.locator('.typing-indicator, [data-testid="typing"]');
  }

  // Date separators
  get dateSeparators(): Locator {
    return this.page.locator('.date-separator, .message-date');
  }

  // Navigation methods
  async goto(): Promise<void> {
    await this.page.goto('/chat');
    await this.waitForLoadingToFinish();
  }

  async gotoConversation(id: string): Promise<void> {
    await this.page.goto(`/chat/${id}`);
    await this.waitForLoadingToFinish();
  }

  // List actions
  async openConversation(index: number = 0): Promise<void> {
    const conversations = await this.conversationItems.all();
    if (conversations[index]) {
      await conversations[index].click();
    }
  }

  async openConversationByName(name: string): Promise<void> {
    await this.conversationItems.filter({ hasText: name }).click();
  }

  async searchConversations(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async startNewChat(): Promise<void> {
    await this.newChatButton.click();
  }

  // Messaging actions
  async sendMessage(text: string): Promise<void> {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  async typeMessage(text: string): Promise<void> {
    await this.messageInput.fill(text);
  }

  async clearMessageInput(): Promise<void> {
    await this.messageInput.clear();
  }

  // Navigation
  async goBackToList(): Promise<void> {
    await this.backButton.click();
  }

  // Scroll actions
  async scrollToBottom(): Promise<void> {
    await this.messagesContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
  }

  async scrollToTop(): Promise<void> {
    await this.messagesContainer.evaluate(el => {
      el.scrollTop = 0;
    });
  }

  // Wait helpers
  async waitForMessages(): Promise<void> {
    await this.messageBubbles.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  }

  async waitForNewMessage(): Promise<void> {
    const currentCount = await this.messageBubbles.count();
    await this.page.waitForFunction(
      (count) => document.querySelectorAll('.message-bubble, .message').length > count,
      currentCount,
      { timeout: 5000 }
    ).catch(() => {});
  }

  // Message count
  async getMessageCount(): Promise<number> {
    return await this.messageBubbles.count();
  }

  async getUnreadCount(): Promise<number> {
    return await this.unreadBadge.count();
  }
}
