/**
 * Tab item interface
 */
export interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Display label (optional, for accessibility) */
  label?: string;
  /** Icon name (Material Icons) */
  icon?: string;
  /** Icon source URL (alternative to icon name) */
  iconSrc?: string;
  /** Active icon (different icon when selected) */
  activeIcon?: string;
  /** Active icon source URL */
  activeIconSrc?: string;
  /** Router link path */
  route?: string;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Badge count (for notifications) */
  badge?: number;
}

/**
 * Tab bar variant options
 */
export type TabBarVariant = 'solid' | 'floating' | 'transparent';

/**
 * Tab bar size options
 */
export type TabBarSize = 'sm' | 'md' | 'lg';
