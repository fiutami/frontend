import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DrawerService } from '../../../shared/components/drawer';
import { BottomTabBarComponent } from '../../../shared/components/bottom-tab-bar';
import { MAIN_TAB_BAR_CONFIG } from '../../../core/config/tab-bar.config';
import { ChatService } from '../../../chat/services/chat.service';
import { Conversation } from '../../../chat/models/chat.models';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, RouterModule, BottomTabBarComponent],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent implements OnInit {
  private drawerService = inject(DrawerService);
  private router = inject(Router);
  private chatService = inject(ChatService);

  conversations = signal<Conversation[]>([]);
  hasConversations = computed(() => this.conversations().length > 0);

  // Bottom tab bar - configurazione centralizzata
  tabs = MAIN_TAB_BAR_CONFIG;

  ngOnInit(): void {
    this.loadConversations();
  }

  private loadConversations(): void {
    this.chatService.getConversations().subscribe(convs => {
      this.conversations.set(convs);
    });
  }

  openDrawer(): void {
    this.drawerService.open();
  }

  goBack(): void {
    this.router.navigate(['/home/main']);
  }

  openConversation(conversationId: string): void {
    this.chatService.markAsRead(conversationId).subscribe();
    this.router.navigate(['/home/chat', conversationId]);
  }

  getAvatarPlaceholder(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  formatTime(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}g`;

    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  }

  findFriends(): void {
    this.router.navigate(['/home/friends']);
  }
}
