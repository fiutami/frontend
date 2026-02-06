import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DrawerService } from '../../shared/components/drawer';
import { SearchBoxComponent } from '../../shared/components/search-box';
import { SharedModule } from '../../shared/shared.module';

import { AuthService } from '../../core/services/auth.service';
import { NotificationsService } from '../../core/services/notifications.service';

import { DashboardService, Suggestion } from './dashboard.service';

import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { MascotBottomSheetComponent } from '../../shared/components/mascot-bottom-sheet/mascot-bottom-sheet.component';
import { TabPageShellFiutoComponent } from '../../shared/components/tab-page-shell-fiuto/tab-page-shell-fiuto.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    TabPageShellFiutoComponent,
    SearchBoxComponent,
    NotificationBellComponent,
    MascotBottomSheetComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private drawerService = inject(DrawerService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private notificationsService = inject(NotificationsService);

  // User data
  userName = signal('');
  userAvatarUrl = signal<string | null>(null);

  // Pet data (Path A)
  petName = signal('');
  petId = signal<string | null>(null);

  // Prototype data (Path B)
  prototypeSpecies = signal('');
  prototypeEmoji = signal('');
  prototypeCompatibility = signal(0);
  prototypeSpeciesId = signal<string | null>(null);

  // Path detection
  isPathA = signal(false);
  isPathB = signal(false);

  // Loading state
  isLoading = signal(true);

  // Computed properties for avatar display
  showInitials = computed(() => !this.userAvatarUrl());
  avatarUrl = computed(() => this.userAvatarUrl());
  initials = computed(() => this.getInitials(this.userName()));

  searchQuery = '';

  // Notification bell
  unreadNotifications = signal(0);

  // Mascot bottom sheet / AI Mode
  showMascotSheet = signal(false);
  mascotSuggestions = signal<Suggestion[]>([]);
  isAiModeActive = signal(false);

  
  ngOnInit(): void {
    this.loadDashboardData();
    this.loadUnreadNotificationsCount();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    // Load user data
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName.set(user.firstName || 'Utente');
    }

    // Load dashboard through service
    this.dashboardService.loadDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

          } else if (data.prototype) {
            // Path B - has prototype
            this.isPathA.set(false);
            this.isPathB.set(true);
            this.prototypeSpecies.set(data.prototype.speciesName);
            this.prototypeEmoji.set(this.dashboardService.getSpeciesEmoji(data.prototype.speciesCode));
            this.prototypeCompatibility.set(data.prototype.compatibility);
            this.prototypeSpeciesId.set(data.prototype.speciesId);

          } else {
            // Unknown path
            this.isPathA.set(false);
            this.isPathB.set(false);
          }

          // Set suggestions for mascot bottom sheet
          this.mascotSuggestions.set(data.suggestions || []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  private loadUnreadNotificationsCount(): void {
    this.notificationsService.getUnreadCount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((count) => this.unreadNotifications.set(count ?? 0));
  }

  openDrawer(): void {
    this.drawerService.open();
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    console.log('Search query:', query);
    // Navigate to search results or implement search logic
  }

  // Mascot bottom sheet methods
  onMascotClick(): void {
    this.showMascotSheet.set(true);
  }

  closeMascotSheet(): void {
    this.showMascotSheet.set(false);
    // TODO: Call returnToPeek() on shell's mascot-peek when sheet closes
  }

  onMascotSuggestionClick(suggestion: { actionUrl?: string }): void {
    if (suggestion?.actionUrl) {
      this.router.navigate([suggestion.actionUrl]);
    }
    this.closeMascotSheet();
  }

  onAiModeChange(active: boolean): void {
    this.isAiModeActive.set(active);
  }

  onChatMessage(message: string): void {
    console.log('Chat message to Fiuto:', message);
    // TODO: Implement AI chat logic - send to backend and get response
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
