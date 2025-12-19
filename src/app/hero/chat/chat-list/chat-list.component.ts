import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DrawerService } from '../../../shared/components/drawer';
import {
  BottomTabBarComponent,
  TabItem,
} from '../../../shared/components/bottom-tab-bar';
import { ChatService, Conversation } from '../services/chat.service';

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

  conversations = this.chatService.getConversations();
  hasConversations = computed(() => this.conversations().length > 0);

  // Bottom tab bar configuration
  tabs: TabItem[] = [
    { id: 'home', icon: 'home', route: '/home/main', label: 'Home' },
    {
      id: 'calendar',
      icon: 'calendar_today',
      route: '/calendar',
      label: 'Calendario',
    },
    { id: 'location', icon: 'place', route: '/map', label: 'Mappa' },
    { id: 'pet', icon: 'pets', route: '/home/pet-profile', label: 'Pet' },
    { id: 'profile', icon: 'person', route: '/user/profile', label: 'Profilo' },
  ];

  ngOnInit(): void {
    this.chatService.loadConversations();
  }

  openDrawer(): void {
    this.drawerService.open();
  }

  goBack(): void {
    this.router.navigate(['/home/main']);
  }

  openConversation(conversationId: string): void {
    this.chatService.markAsRead(conversationId);
    this.router.navigate(['/home/chat', conversationId]);
  }

  getAvatarPlaceholder(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  formatTime(date: Date): string {
    return this.chatService.formatTime(date);
  }

  findFriends(): void {
    this.router.navigate(['/home/friends']);
  }
}
