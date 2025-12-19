export interface Conversation {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  isMine: boolean;
}
