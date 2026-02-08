import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';

@NgModule({
  imports: [
    CommonModule,
    ChatRoutingModule,
    ChatListComponent,
    ChatConversationComponent
  ]
})
export class ChatModule { }
