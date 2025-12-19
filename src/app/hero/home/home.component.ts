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
import { DrawerService } from '../../shared/components/drawer';
import {
  BottomTabBarComponent,
  TabItem,
} from '../../shared/components/bottom-tab-bar';
import { SearchBoxComponent } from '../../shared/components/search-box';
import { EventsWidgetComponent, EventItem } from '../../shared/components/events-widget';
import { PageBackgroundComponent } from '../../shared/components/page-background';
import { AuthService } from '../../core/services/auth.service';
import { PetService } from '../../core/services/pet.service';
import { DashboardService, Suggestion } from './dashboard.service';
import { SpeciesQuestionnaireService } from '../species-questionnaire/species-questionnaire.service';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  route: string;
}

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
  private router = inject(Router);
  private authService = inject(AuthService);
  private petService = inject(PetService);
  private dashboardService = inject(DashboardService);
  private questionnaireService = inject(SpeciesQuestionnaireService);

  // User data
  userName = signal('');
  userAvatarUrl = signal<string | null>(null);

  // Pet data (Path A)
  petName = signal('');
  petSpecies = signal('');
  petBreed = signal('');
  petAge = signal('');
  petWeight = signal<number | null>(null);
  petPhotoUrl = signal<string | null>(null);
  petId = signal<string | null>(null);

  // Prototype data (Path B)
  prototypeSpecies = signal('');
  prototypeEmoji = signal('');
  prototypeCompatibility = signal(0);
  prototypeSpeciesId = signal<string | null>(null);

  // Path detection
  isPathA = signal(false);
  isPathB = signal(false);

  // AI Suggestions
  suggestions = signal<Suggestion[]>([]);

  // Mascot state
  mascotMessage = signal('Ciao! Cosa vuoi fare oggi?');
  showMascotBubble = signal(true);

  // Loading state
  isLoading = signal(true);

  // Computed properties for avatar display
  showInitials = computed(() => !this.petPhotoUrl() && !this.userAvatarUrl());
  avatarUrl = computed(() => this.userAvatarUrl() || this.petPhotoUrl());
  initials = computed(() => this.getInitials(this.petName() || this.userName()));

  notificationCount = 2;
  upcomingEvents: EventItem[] = [];
  searchQuery = '';

  // Quick actions
  quickActions: QuickAction[] = [
    { id: 'calendar', icon: 'calendar_today', label: 'Calendario', route: '/home/calendar' },
    { id: 'map', icon: 'place', label: 'Mappa', route: '/home/map' },
    { id: 'gallery', icon: 'photo_library', label: 'Galleria', route: '/home/pet-profile' },
    { id: 'breeds', icon: 'pets', label: 'Razze', route: '/home/breeds' },
  ];

  // Bottom tab bar configuration
  tabs: TabItem[] = [
    { id: 'home', icon: 'home', iconSrc: 'assets/icons/nav/home.svg', activeIconSrc: 'assets/icons/nav/home-active.svg', route: '/home/main', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', iconSrc: 'assets/icons/nav/calendar.svg', activeIconSrc: 'assets/icons/nav/calendar-active.svg', route: '/home/calendar', label: 'Calendario' },
    { id: 'location', icon: 'place', iconSrc: 'assets/icons/nav/map.svg', activeIconSrc: 'assets/icons/nav/map-active.svg', route: '/home/map', label: 'Mappa' },
    { id: 'species', icon: 'pets', iconSrc: 'assets/icons/nav/species.svg', activeIconSrc: 'assets/icons/nav/species-active.svg', route: '/home/species', label: 'Specie' },
    { id: 'profile', icon: 'person', iconSrc: 'assets/icons/nav/profile.svg', activeIconSrc: 'assets/icons/nav/profile-active.svg', route: '/user/profile', label: 'Profilo' },
  ];

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadUpcomingEvents();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    // Load user data
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName.set(user.firstName || 'Utente');
    }

    // Load dashboard through service
    this.dashboardService.loadDashboard().subscribe({
      next: (data) => {
        // Set user data
        this.userName.set(data.user.name);

        // Check path
        if (data.pet) {
          // Path A - has pet
          this.isPathA.set(true);
          this.isPathB.set(false);
          this.petId.set(data.pet.id);
          this.petName.set(data.pet.name);
          this.petSpecies.set(data.pet.species);
          this.petBreed.set(data.pet.breed || '');
          this.petAge.set(data.pet.age);
          this.petWeight.set(data.pet.weight || null);
          this.petPhotoUrl.set(data.pet.photoUrl);

          // Update quick actions for Path A
          this.quickActions = [
            { id: 'calendar', icon: 'calendar_today', label: 'Calendario', route: '/home/calendar' },
            { id: 'map', icon: 'place', label: 'Mappa', route: '/home/map' },
            { id: 'gallery', icon: 'photo_library', label: 'Galleria', route: `/home/pet-profile/${data.pet.id}/gallery` },
            { id: 'breeds', icon: 'pets', label: 'Razze', route: '/home/breeds' },
          ];

          // Mascot message for pet owners
          this.mascotMessage.set(`Come sta ${data.pet.name} oggi?`);

        } else if (data.prototype) {
          // Path B - has prototype
          this.isPathA.set(false);
          this.isPathB.set(true);
          this.prototypeSpecies.set(data.prototype.speciesName);
          this.prototypeEmoji.set(this.dashboardService.getSpeciesEmoji(data.prototype.speciesCode));
          this.prototypeCompatibility.set(data.prototype.compatibility);
          this.prototypeSpeciesId.set(data.prototype.speciesId);

          // Mascot message for potential owners
          this.mascotMessage.set('Pronto a trovare il tuo compagno?');

        } else {
          // Unknown path
          this.isPathA.set(false);
          this.isPathB.set(false);
          this.mascotMessage.set('Inizia la tua avventura!');
        }

        // Set suggestions
        this.suggestions.set(data.suggestions);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
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
    this.router.navigate(['/home/calendar'], {
      queryParams: { eventId: event.id }
    });
  }

  onViewAllEvents(): void {
    this.router.navigate(['/home/calendar']);
  }

  navigateToCalendar(): void {
    this.router.navigate(['/home/calendar']);
  }

  navigateToPetProfile(): void {
    const id = this.petId();
    if (id) {
      this.router.navigate(['/home/pet-profile', id]);
    } else {
      this.router.navigate(['/home/pet-profile']);
    }
  }

  navigateToBreedDetails(): void {
    const speciesId = this.prototypeSpeciesId();
    if (speciesId) {
      this.router.navigate(['/home/breeds', speciesId]);
    } else {
      this.router.navigate(['/home/breeds']);
    }
  }

  navigateToRegisterPet(): void {
    this.router.navigate(['/home/pet-register']);
  }

  navigateToQuickAction(action: QuickAction): void {
    this.router.navigate([action.route]);
  }

  onSuggestionClick(suggestion: Suggestion): void {
    if (suggestion.actionUrl) {
      this.router.navigate([suggestion.actionUrl]);
    }
  }

  toggleMascotBubble(): void {
    this.showMascotBubble.update(v => !v);
  }

  closeMascotBubble(): void {
    this.showMascotBubble.set(false);
  }

  getSuggestionTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'walk': 'directions_walk',
      'health': 'vaccines',
      'event': 'event',
      'discovery': 'explore',
      'tip': 'lightbulb'
    };
    return iconMap[type] || 'info';
  }

  private loadUpcomingEvents(): void {
    // Mock - replace with API call
    this.upcomingEvents = [];
  }

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
