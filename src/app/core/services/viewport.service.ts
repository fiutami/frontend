import { Injectable, PLATFORM_ID, inject, signal, computed, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  BREAKPOINTS,
  FOLDABLE_DETECTION,
  DeviceType,
  getDeviceType,
  isPortrait
} from '../config/constants/breakpoints.constants';
import { DEBOUNCE_TIME } from '../config/constants/timing.constants';

export interface ViewportState {
  width: number;
  height: number;
  deviceType: DeviceType;
  isPortrait: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isFoldable: boolean;
  isDesktop: boolean;
}

/**
 * ViewportService - Centralized responsive/viewport detection
 *
 * Replaces duplicated viewport detection logic across components:
 * - saved.component.ts
 * - activity.component.ts
 * - notifications.component.ts
 * - drawer.component.ts
 *
 * Usage:
 * ```typescript
 * private viewport = inject(ViewportService);
 *
 * ngOnInit() {
 *   if (this.viewport.isFoldable()) {
 *     // Handle foldable device
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ViewportService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  // Internal state signals
  private readonly widthSignal = signal(0);
  private readonly heightSignal = signal(0);

  // Computed device type
  readonly deviceType = computed(() =>
    getDeviceType(this.widthSignal(), this.heightSignal())
  );

  // Convenience computed signals
  readonly isMobile = computed(() => this.deviceType() === 'mobile');
  readonly isTablet = computed(() => this.deviceType() === 'tablet');
  readonly isFoldable = computed(() => this.deviceType() === 'foldable');
  readonly isDesktop = computed(() => this.deviceType() === 'desktop');
  readonly isPortrait = computed(() => isPortrait(this.widthSignal(), this.heightSignal()));

  // Full state for components that need all values
  readonly state = computed<ViewportState>(() => ({
    width: this.widthSignal(),
    height: this.heightSignal(),
    deviceType: this.deviceType(),
    isPortrait: this.isPortrait(),
    isMobile: this.isMobile(),
    isTablet: this.isTablet(),
    isFoldable: this.isFoldable(),
    isDesktop: this.isDesktop(),
  }));

  constructor() {
    if (this.isBrowser()) {
      this.updateDimensions();
      window.addEventListener('resize', this.onResize);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser()) {
      window.removeEventListener('resize', this.onResize);
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
    }
  }

  /**
   * Check if a specific breakpoint is active (viewport >= breakpoint)
   */
  isBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
    return this.widthSignal() >= BREAKPOINTS[breakpoint];
  }

  /**
   * Check if viewport is within a specific range
   */
  isWithinRange(min: number, max: number): boolean {
    const width = this.widthSignal();
    return width >= min && width <= max;
  }

  /**
   * Check specifically for Galaxy Fold
   */
  isGalaxyFold(): boolean {
    const width = this.widthSignal();
    const { GALAXY_FOLD } = FOLDABLE_DETECTION;
    return width >= GALAXY_FOLD.WIDTH_MIN && width <= GALAXY_FOLD.WIDTH_MAX;
  }

  /**
   * Get viewport width
   */
  getWidth(): number {
    return this.widthSignal();
  }

  /**
   * Get viewport height
   */
  getHeight(): number {
    return this.heightSignal();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readonly onResize = (): void => {
    // Debounce resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      this.updateDimensions();
    }, DEBOUNCE_TIME.RESIZE);
  };

  private updateDimensions(): void {
    if (this.isBrowser()) {
      this.widthSignal.set(window.innerWidth);
      this.heightSignal.set(window.innerHeight);
    }
  }
}
