import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, startWith } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversation, Message, SendMessageDto } from '../models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  private pollingInterval = 5000; // 5 seconds

  constructor(private http: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  getMessages(conversationId: string, after?: Date): Observable<Message[]> {
    let url = `${this.apiUrl}/conversations/${conversationId}/messages`;
    if (after) {
      url += `?after=${after.toISOString()}`;
    }
    return this.http.get<Message[]>(url);
  }

  // POLLING: returns Observable that emits every 5 seconds
  pollMessages(conversationId: string, getLastMessageTime: () => Date | undefined): Observable<Message[]> {
    return interval(this.pollingInterval).pipe(
      startWith(0),
      switchMap(() => this.getMessages(conversationId, getLastMessageTime()))
    );
  }

  sendMessage(conversationId: string, dto: SendMessageDto): Observable<Message> {
    return this.http.post<Message>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      dto
    );
  }

  markAsRead(conversationId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/conversations/${conversationId}/read`,
      {}
    );
  }

  createConversation(recipientId: string): Observable<Conversation> {
    return this.http.post<Conversation>(
      `${this.apiUrl}/conversations`,
      { recipientId }
    );
  }
}
