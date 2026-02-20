import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SavedService, SavedItem, SavedTab } from '../../../core/services/saved.service';

interface SavedGroup {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
}

// Shell Drawer (sfondo blu solido, solo header + back, niente avatar/logo/mascot/tab bar)
import { TabPageShellDrawerComponent } from '../../../shared/components/tab-page-shell-drawer';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, TabPageShellDrawerComponent],
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavedComponent implements OnInit, OnDestroy {
  private location = inject(Location);
  private router = inject(Router);
  private savedService = inject(SavedService);
  private translate = inject(TranslateService);
  private destroy$ = new Subject<void>();

  /** Translated page title */
  protected pageTitle = this.translate.instant('drawerSaved.title');

  // State signals
  savedItems = signal<SavedItem[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  activeTab = signal<SavedTab>('all');
  savedCount = signal(0);

  // Category view signals
  currentView = signal<'categories' | 'detail'>('categories');
  selectedCategory = signal<string>('');
  showCreateGroup = signal(false);
  newGroupName = signal('');

  // User-created groups (persisted in localStorage)
  userGroups = signal<SavedGroup[]>([]);

  // Categories data
  readonly categories = signal([
    { id: 'places', icon: 'place', nameKey: 'drawerSaved.places', count: 0 },
    { id: 'vets', icon: 'local_hospital', nameKey: 'drawerSaved.vets', count: 0 },
    { id: 'trainers', icon: 'fitness_center', nameKey: 'drawerSaved.trainers', count: 0 },
    { id: 'friends', icon: 'people', nameKey: 'drawerSaved.friends', count: 0 },
    { id: 'shops', icon: 'store', nameKey: 'drawerSaved.shops', count: 0 },
    { id: 'petSitters', icon: 'pets', nameKey: 'drawerSaved.petSitters', count: 0 },
    { id: 'events', icon: 'event', nameKey: 'drawerSaved.events', count: 0 },
    { id: 'pets', icon: 'favorite', nameKey: 'drawerSaved.pets', count: 0 },
  ]);

  // Tab configuration
  tabOptions: { id: SavedTab; labelKey: string; icon: string }[] = [
    { id: 'all', labelKey: 'drawerSaved.tabs.all', icon: 'bookmark' },
    { id: 'pets', labelKey: 'drawerSaved.tabs.pets', icon: 'pets' },
    { id: 'events', labelKey: 'drawerSaved.tabs.events', icon: 'event' },
    { id: 'places', labelKey: 'drawerSaved.tabs.places', icon: 'place' }
  ];

  constructor() {
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageTitle = this.translate.instant('drawerSaved.title');
      });
  }

  ngOnInit(): void {
    this.loadUserGroups();
    this.loadSavedItems();
    this.loadSavedCount();
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

  selectCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
    this.currentView.set('detail');
  }

  backToCategories(): void {
    this.currentView.set('categories');
    this.selectedCategory.set('');
  }

  openCreateGroup(): void {
    this.showCreateGroup.set(true);
    this.newGroupName.set('');
  }

  closeCreateGroup(): void {
    this.showCreateGroup.set(false);
  }

  loadUserGroups(): void {
    try {
      const stored = localStorage.getItem('fiutami_saved_groups');
      if (stored) {
        this.userGroups.set(JSON.parse(stored));
      }
    } catch {
      // ignore corrupt data
    }
  }

  private persistGroups(groups: SavedGroup[]): void {
    localStorage.setItem('fiutami_saved_groups', JSON.stringify(groups));
    this.userGroups.set(groups);
  }

  createGroup(): void {
    const name = this.newGroupName().trim();
    if (!name) return;
    const group: SavedGroup = {
      id: crypto.randomUUID(),
      name,
      icon: 'folder',
      createdAt: new Date().toISOString(),
    };
    this.persistGroups([...this.userGroups(), group]);
    this.closeCreateGroup();
  }

  deleteGroup(groupId: string): void {
    this.persistGroups(this.userGroups().filter(g => g.id !== groupId));
  }

  get selectedCategoryName(): string {
    const cat = this.categories().find(c => c.id === this.selectedCategory());
    return cat?.nameKey || '';
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
