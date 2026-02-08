import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Badge variant options
 */
export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'neutral';

/**
 * Badge size options
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * IconBadgeComponent - Reusable Icon Badge
 *
 * A circular badge with an icon and label, commonly used for
 * category badges like "BANDA PELOSA", "FATTI BESTIALI", etc.
 *
 * @example
 * ```html
 * <app-icon-badge
 *   label="BANDA PELOSA"
 *   icon="paw"
 *   variant="primary"
 *   size="md">
 * </app-icon-badge>
 * ```
 */
@Component({
  selector: 'app-icon-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-badge.component.html',
  styleUrls: ['./icon-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBadgeComponent {
  /**
   * Label text displayed below the icon
   * @required
   */
  @Input({ required: true }) label!: string;

  /**
   * Icon name (for built-in icons)
   * Available: 'paw', 'document', 'camera', 'heart', 'star'
   */
  @Input() icon?: string;

  /**
   * Custom icon image source URL
   * Use this for custom icons not in the built-in set
   */
  @Input() iconSrc?: string;

  /**
   * Visual variant affecting colors
   * @default 'primary'
   */
  @Input() variant: BadgeVariant = 'primary';

  /**
   * Badge size
   * - 'sm': 48px icon, small text
   * - 'md': 64px icon, medium text
   * - 'lg': 80px icon, large text
   * @default 'md'
   */
  @Input() size: BadgeSize = 'md';

  /**
   * Whether the badge is circular or slightly rounded
   * @default true
   */
  @Input() circular = true;

  /**
   * Whether to show an outline style instead of filled
   * @default false
   */
  @Input() outlined = false;

  /**
   * Get CSS classes based on inputs
   */
  get badgeClasses(): Record<string, boolean> {
    return {
      'icon-badge': true,
      [`icon-badge--${this.variant}`]: true,
      [`icon-badge--${this.size}`]: true,
      'icon-badge--circular': this.circular,
      'icon-badge--outlined': this.outlined,
    };
  }

  /**
   * Check if using a built-in icon
   */
  get hasBuiltInIcon(): boolean {
    return !!this.icon && !this.iconSrc;
  }

  /**
   * Check if using a custom icon source
   */
  get hasCustomIcon(): boolean {
    return !!this.iconSrc;
  }

  /**
   * Get SVG path for built-in icons
   */
  getIconPath(iconName: string): string {
    const icons: Record<string, string> = {
      paw: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
      document: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
      camera: 'M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.67 0-5.09 1.51-6.27 3.89l1.77.88C8.34 9.03 10.08 8 12 8s3.66 1.03 4.5 2.77l1.77-.88C17.09 7.51 14.67 6 12 6z',
      heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
      star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
    };
    return icons[iconName] || icons['paw'];
  }
}
