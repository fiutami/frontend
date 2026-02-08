import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TabItem, TabBarVariant, TabBarSize } from './bottom-tab-bar.models';

/**
 * BottomTabBarComponent - Bottom Navigation Tab Bar
 *
 * A fixed bottom navigation bar for mobile app navigation.
 * Supports router integration, badges, and multiple visual variants.
 *
 * @example
 * ```html
 * <app-bottom-tab-bar
 *   [tabs]="[
 *     { id: 'home', icon: 'home', route: '/home' },
 *     { id: 'calendar', icon: 'calendar_today', route: '/calendar' },
 *     { id: 'location', icon: 'place', route: '/location' },
 *     { id: 'pet', icon: 'pets', route: '/pet' },
 *     { id: 'profile', icon: 'person', route: '/profile' }
 *   ]"
 *   [activeTabId]="'home'"
 *   (tabChange)="onTabChange($event)">
 * </app-bottom-tab-bar>
 * ```
 */
@Component({
  selector: 'app-bottom-tab-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-tab-bar.component.html',
  styleUrls: ['./bottom-tab-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomTabBarComponent {
  private readonly router = inject(Router);

  /**
   * Array of tab items to display
   * @required
   */
  @Input({ required: true }) tabs: TabItem[] = [];

  /**
   * Currently active tab ID
   */
  @Input() activeTabId?: string;

  /**
   * Visual variant
   * @default 'solid'
   */
  @Input() variant: TabBarVariant = 'solid';

  /**
   * Size variant
   * @default 'md'
   */
  @Input() size: TabBarSize = 'md';

  /**
   * Whether to show labels under icons
   * @default false
   */
  @Input() showLabels = false;

  /**
   * Whether to use router navigation
   * @default true
   */
  @Input() useRouter = true;

  /**
   * Safe area bottom padding (for devices with notch)
   * @default true
   */
  @Input() safeArea = true;

  /**
   * Whether to hide the tab bar (AI mode)
   * @default false
   */
  @Input() hidden = false;

  /**
   * Emits when a tab is clicked
   */
  @Output() tabChange = new EventEmitter<TabItem>();

  /**
   * Get CSS classes for the container
   */
  get containerClasses(): Record<string, boolean> {
    return {
      'bottom-tab-bar': true,
      [`bottom-tab-bar--${this.variant}`]: true,
      [`bottom-tab-bar--${this.size}`]: true,
      'bottom-tab-bar--with-labels': this.showLabels,
      'bottom-tab-bar--safe-area': this.safeArea,
      'bottom-tab-bar--hidden': this.hidden,
    };
  }

  /**
   * Check if a tab is active
   */
  isActive(tab: TabItem): boolean {
    if (this.activeTabId) {
      return tab.id === this.activeTabId;
    }
    if (tab.route && this.useRouter) {
      return this.router.isActive(tab.route, {
        paths: 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      });
    }
    return false;
  }

  /**
   * Get CSS classes for a tab item
   */
  getTabClasses(tab: TabItem): Record<string, boolean> {
    return {
      'bottom-tab-bar__tab': true,
      'bottom-tab-bar__tab--active': this.isActive(tab),
      'bottom-tab-bar__tab--disabled': !!tab.disabled,
    };
  }

  /**
   * Get the icon to display (active or default)
   */
  getIcon(tab: TabItem): string | undefined {
    if (this.isActive(tab) && tab.activeIcon) {
      return tab.activeIcon;
    }
    return tab.icon;
  }

  /**
   * Get the icon source URL (active or default)
   */
  getIconSrc(tab: TabItem): string | undefined {
    if (this.isActive(tab) && tab.activeIconSrc) {
      return tab.activeIconSrc;
    }
    return tab.iconSrc;
  }

  /**
   * Handle tab click
   * Always navigates to the tab route, forcing a page reload/re-init
   * (onSameUrlNavigation: 'reload' in router config handles same-route navigation)
   */
  onTabClick(tab: TabItem, event: Event): void {
    if (tab.disabled) {
      event.preventDefault();
      return;
    }

    this.tabChange.emit(tab);

    if (this.useRouter && tab.route) {
      // Always navigate - router's onSameUrlNavigation: 'reload' handles the reload
      this.router.navigate([tab.route]);
    }
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent, tab: TabItem, index: number): void {
    const enabledTabs = this.tabs.filter((t) => !t.disabled);
    const currentEnabledIndex = enabledTabs.findIndex((t) => t.id === tab.id);

    let targetIndex = -1;

    switch (event.key) {
      case 'ArrowLeft':
        targetIndex =
          currentEnabledIndex > 0
            ? currentEnabledIndex - 1
            : enabledTabs.length - 1;
        break;
      case 'ArrowRight':
        targetIndex =
          currentEnabledIndex < enabledTabs.length - 1
            ? currentEnabledIndex + 1
            : 0;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = enabledTabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        this.onTabClick(tab, event);
        return;
      default:
        return;
    }

    event.preventDefault();

    if (targetIndex >= 0) {
      const targetTab = enabledTabs[targetIndex];
      const targetElement = document.querySelector(
        `[data-tab-id="${targetTab.id}"]`
      ) as HTMLElement;
      targetElement?.focus();
    }
  }

  /**
   * Track tabs by ID
   */
  trackByTabId(_index: number, tab: TabItem): string {
    return tab.id;
  }
}
