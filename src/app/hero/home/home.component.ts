import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DrawerService } from '../../shared/components/drawer';
import {
  BottomTabBarComponent,
  TabItem,
} from '../../shared/components/bottom-tab-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BottomTabBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private drawerService = inject(DrawerService);

  // Pet data - using signals for reactivity
  petName = signal('Thor');
  petAvatarUrl = signal<string | null>(null);
  userAvatarUrl = signal<string | null>(null);

  // Computed properties for avatar display
  showInitials = computed(() => !this.petAvatarUrl() && !this.userAvatarUrl());
  avatarUrl = computed(() => this.userAvatarUrl() || this.petAvatarUrl());
  initials = computed(() => this.getInitials(this.petName()));

  notificationCount = 2;
  upcomingEvents: { title: string; date: string }[] = [];

  // Bottom tab bar configuration
  tabs: TabItem[] = [
    { id: 'home', icon: 'home', route: '/home/main', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', route: '/calendar', label: 'Calendario' },
    { id: 'location', icon: 'place', route: '/map', label: 'Mappa' },
    { id: 'pet', icon: 'pets', route: '/home/pet-profile', label: 'Pet' },
    { id: 'profile', icon: 'person', route: '/user/profile', label: 'Profilo' },
  ];

  ngOnInit(): void {
    // Load upcoming events from API
    this.loadUpcomingEvents();
  }

  openDrawer(): void {
    this.drawerService.open();
  }

  onSearch(query: string): void {
    console.log('Search query:', query);
    // Implement search logic
  }

  navigateToCalendar(): void {
    // Navigate to calendar
  }

  private loadUpcomingEvents(): void {
    // Mock - replace with API call
    this.upcomingEvents = [
      // Empty for now - shows "Non c'è nessun evento in programma"
    ];
  }

  /**
   * Get initials from pet name for avatar fallback
   */
  private getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
