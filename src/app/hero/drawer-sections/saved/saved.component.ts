import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SavedService, SavedItem, SavedTab } from '../../../core/services/saved.service';
import { BottomTabBarComponent, TabItem } from '../../../shared/components/bottom-tab-bar';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule, RouterModule, BottomTabBarComponent],
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'saved-page' }
})
export class SavedComponent implements OnInit {
  private location = inject(Location);
  private router = inject(Router);
  private savedService = inject(SavedService);

  title = 'Preferiti';

  // State signals
  savedItems = signal<SavedItem[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  activeTab = signal<SavedTab>('all');
  savedCount = signal(0);

  // Tab configuration
  tabOptions: { id: SavedTab; label: string; icon: string }[] = [
    { id: 'all', label: 'Tutti', icon: 'bookmark' },
    { id: 'pets', label: 'Pets', icon: 'pets' },
    { id: 'events', label: 'Eventi', icon: 'event' },
    { id: 'places', label: 'Luoghi', icon: 'place' }
  ];

  // Bottom tab bar config
  tabs: TabItem[] = [
    { id: 'home', icon: 'home', route: '/home/main', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', route: '/home/calendar', label: 'Calendario' },
    { id: 'location', icon: 'place', route: '/home/map', label: 'Mappa' },
    { id: 'pet', icon: 'pets', route: '/home/pet-profile', label: 'Pet' },
    { id: 'profile', icon: 'person', route: '/user/profile', label: 'Profilo' },
  ];

  ngOnInit(): void {
    this.loadSavedItems();
    this.loadSavedCount();
  }

  goBack(): void {
    this.location.back();
  }

  selectTab(tab: SavedTab): void {
    if (this.activeTab() !== tab) {
      this.activeTab.set(tab);
      this.loadSavedItems();
    }
  }

  loadSavedItems(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.savedService.getSavedItems(this.activeTab()).subscribe({
      next: (data) => {
        this.savedItems.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  loadSavedCount(): void {
    this.savedService.getSavedCount().subscribe(count => {
      this.savedCount.set(count);
    });
  }

  formatTime(date: Date): string {
    return this.savedService.formatRelativeTime(date);
  }

  onItemClick(item: SavedItem): void {
    if (item.actionUrl) {
      this.router.navigate([item.actionUrl]);
    }
  }

  onRemoveItem(event: Event, item: SavedItem): void {
    event.stopPropagation();

    this.savedService.removeSavedItem(item.id).subscribe({
      next: () => {
        this.savedItems.update(list =>
          list.filter(i => i.id !== item.id)
        );
        this.savedCount.update(count => Math.max(0, count - 1));
      }
    });
  }

  getItemTypeClass(type: SavedItem['type']): string {
    const classMap: Record<SavedItem['type'], string> = {
      pet: 'saved-item--pet',
      event: 'saved-item--event',
      place: 'saved-item--place',
      post: 'saved-item--post',
      user: 'saved-item--user'
    };
    return classMap[type] || '';
  }

  retry(): void {
    this.loadSavedItems();
  }
}
