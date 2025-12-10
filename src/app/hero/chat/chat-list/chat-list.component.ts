import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DrawerService } from '../../../shared/components/drawer';
import {
  BottomTabBarComponent,
  TabItem,
} from '../../../shared/components/bottom-tab-bar';

export interface Conversation {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage: string;
  time: string;
  unread: number;
}

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

  // Mock conversations data
  conversations: Conversation[] = [
    {
      id: '1',
      name: 'Marco',
      avatar: null,
      lastMessage: 'Ci vediamo al parco?',
      time: '10:30',
      unread: 2,
    },
    {
      id: '2',
      name: 'Sara',
      avatar: null,
      lastMessage: 'Grazie per i consigli!',
      time: 'Ieri',
      unread: 0,
    },
    {
      id: '3',
      name: 'Luca',
      avatar: null,
      lastMessage: 'Il mio cane è bellissimo!',
      time: 'Ieri',
      unread: 1,
    },
    {
      id: '4',
      name: 'Giulia',
      avatar: null,
      lastMessage: 'Perfetto, a dopo!',
      time: 'Lunedì',
      unread: 0,
    },
  ];

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
    // Load conversations from API in real implementation
  }

  openDrawer(): void {
    this.drawerService.open();
  }

  goBack(): void {
    this.router.navigate(['/home/main']);
  }

  openConversation(conversationId: string): void {
    this.router.navigate(['/home/chat', conversationId]);
  }

  getAvatarPlaceholder(name: string): string {
    // Return first letter of name for placeholder
    return name.charAt(0).toUpperCase();
  }
}
