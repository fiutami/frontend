import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, fromEvent, debounceTime, startWith, takeUntil } from 'rxjs';
import { SavedService, SavedItem, SavedTab } from '../../../core/services/saved.service';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'foldable-folded' | 'foldable-unfolded';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'saved-page' }
})
export class SavedComponent implements OnInit, OnDestroy {
  private location = inject(Location);
  private router = inject(Router);
  private savedService = inject(SavedService);
  private destroy$ = new Subject<void>();

  title = 'Preferiti';

  // State signals
  savedItems = signal<SavedItem[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  activeTab = signal<SavedTab>('all');
  savedCount = signal(0);

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

  // Tab configuration
  tabOptions: { id: SavedTab; label: string; icon: string }[] = [
    { id: 'all', label: 'Tutti', icon: 'bookmark' },
    { id: 'pets', label: 'Pets', icon: 'pets' },
    { id: 'events', label: 'Eventi', icon: 'event' },
    { id: 'places', label: 'Luoghi', icon: 'place' }
  ];


  ngOnInit(): void {
    this.loadSavedItems();
    this.loadSavedCount();

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
