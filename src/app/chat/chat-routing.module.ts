import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';

const routes: Routes = [
  {
    path: '',
    component: ChatListComponent
  },
  {
    path: ':id',
    component: ChatConversationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
