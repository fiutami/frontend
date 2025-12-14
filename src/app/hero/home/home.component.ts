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
import { SearchBoxComponent } from '../../shared/components/search-box';
import { EventsWidgetComponent, EventItem } from '../../shared/components/events-widget';
import { PageBackgroundComponent } from '../../shared/components/page-background';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BottomTabBarComponent,
    SearchBoxComponent,
    EventsWidgetComponent,
    PageBackgroundComponent,
  ],
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
  upcomingEvents: EventItem[] = [];
  searchQuery = '';

  // Bottom tab bar configuration
  // Usa iconSrc per SVG custom, icon come fallback Material Icons
  tabs: TabItem[] = [
    { id: 'home', icon: 'home', iconSrc: 'assets/icons/nav/home.svg', activeIconSrc: 'assets/icons/nav/home-active.svg', route: '/home/main', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', iconSrc: 'assets/icons/nav/calendar.svg', activeIconSrc: 'assets/icons/nav/calendar-active.svg', route: '/home/calendar', label: 'Calendario' },
    { id: 'location', icon: 'place', iconSrc: 'assets/icons/nav/map.svg', activeIconSrc: 'assets/icons/nav/map-active.svg', route: '/home/map', label: 'Mappa' },
    { id: 'species', icon: 'pets', iconSrc: 'assets/icons/nav/species.svg', activeIconSrc: 'assets/icons/nav/species-active.svg', route: '/home/species', label: 'Specie' },
    { id: 'profile', icon: 'person', iconSrc: 'assets/icons/nav/profile.svg', activeIconSrc: 'assets/icons/nav/profile-active.svg', route: '/user/profile', label: 'Profilo' },
  ];

  ngOnInit(): void {
    // Load upcoming events from API
    this.loadUpcomingEvents();
  }

  openDrawer(): void {
    this.drawerService.open();
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    console.log('Search query:', query);
    // Implement search logic
  }

  onEventClick(event: EventItem): void {
    console.log('Event clicked:', event);
    // Navigate to event detail
  }

  onViewAllEvents(): void {
    // Navigate to calendar/events list
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
