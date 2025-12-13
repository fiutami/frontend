import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityService, ActivityItem } from '../../../core/services/activity.service';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
