import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, fromEvent, debounceTime, startWith, takeUntil } from 'rxjs';
import { ActivityService, ActivityItem } from '../../../core/services/activity.service';
import { BottomTabBarComponent, TabItem } from '../../../shared/components/bottom-tab-bar';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'foldable-folded' | 'foldable-unfolded';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterModule, BottomTabBarComponent],
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityComponent implements OnInit, OnDestroy {
  private location = inject(Location);
  private activityService = inject(ActivityService);
  private destroy$ = new Subject<void>();

  title = 'La tua attività';

  // State signals
  activities = signal<ActivityItem[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  // Viewport detection
  private windowWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 375);
  private windowHeight = signal(typeof window !== 'undefined' ? window.innerHeight : 667);

  viewportSize = computed<ViewportSize>(() => {
    const width = this.windowWidth();
    const height = this.windowHeight();
    const aspectRatio = width / height;

    if (width >= 700 && width <= 800 && height >= 500 && height <= 730) {
      return aspectRatio > 1 ? 'foldable-folded' : 'foldable-unfolded';
    }
    if (width >= 717 && width <= 720 && height >= 500 && height <= 520) {
      return 'foldable-folded';
    }
    if (width >= 1400 && width <= 1500 && height >= 700 && height <= 800) {
      return 'foldable-unfolded';
    }
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  // Bottom tab bar config
  tabs: TabItem[] = [
    { id: 'home', icon: 'home', route: '/home/main', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', route: '/home/calendar', label: 'Calendario' },
    { id: 'location', icon: 'place', route: '/home/map', label: 'Mappa' },
    { id: 'pet', icon: 'pets', route: '/home/pet-profile', label: 'Pet' },
    { id: 'profile', icon: 'person', route: '/user/profile', label: 'Profilo' },
  ];

  ngOnInit(): void {
    this.loadActivities();

    // Viewport resize listener
    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize')
        .pipe(debounceTime(100), startWith(null), takeUntil(this.destroy$))
        .subscribe(() => {
          this.windowWidth.set(window.innerWidth);
          this.windowHeight.set(window.innerHeight);
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.location.back();
  }

  loadActivities(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.activityService.getActivities().subscribe({
      next: (data) => {
        this.activities.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  formatTime(date: Date): string {
    return this.activityService.formatRelativeTime(date);
  }

  getActivityTypeClass(type: ActivityItem['type']): string {
    const classMap: Record<ActivityItem['type'], string> = {
      login: 'activity--login',
      pet_add: 'activity--pet',
      pet_update: 'activity--pet',
      profile_update: 'activity--profile',
      event_create: 'activity--event',
      friend_add: 'activity--friend',
      like: 'activity--like',
      comment: 'activity--comment'
    };
    return classMap[type] || '';
  }

  retry(): void {
    this.loadActivities();
  }
}
