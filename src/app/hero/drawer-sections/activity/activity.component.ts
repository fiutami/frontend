import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityService, ActivityItem } from '../../../core/services/activity.service';
import { BottomTabBarComponent, TabItem } from '../../../shared/components/bottom-tab-bar';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterModule, BottomTabBarComponent],
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityComponent implements OnInit {
  private location = inject(Location);
  private activityService = inject(ActivityService);

  title = 'La tua attività';

  // State signals
  activities = signal<ActivityItem[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

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
