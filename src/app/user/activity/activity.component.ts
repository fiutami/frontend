import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

interface Activity {
  id: string;
  type: 'promo' | 'event' | 'friend' | 'pet';
  title: string;
  description: string;
  timestamp: Date;
  imageUrl?: string;
}

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  activities: Activity[] = [];
  isLoading = false;
  petName = 'Silvestro';

  constructor(private location: Location) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  private loadActivities(): void {
    // TODO: Load from API
    // For MVP, keep empty to show empty state
    this.activities = [];
  }

  goBack(): void {
    this.location.back();
  }

  get hasActivities(): boolean {
    return this.activities.length > 0;
  }
}
