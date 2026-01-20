import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { BottomTabBarComponent } from '../../../shared/components/bottom-tab-bar';
import { MascotPeekComponent } from '../../../shared/components/mascot-peek';
import { MascotBottomSheetComponent } from '../../../shared/components/mascot-bottom-sheet';
import { AvatarButtonComponent } from '../../../shared/components/avatar-button';
import { MAIN_TAB_BAR_CONFIG } from '../../../core/config/tab-bar.config';
import { PageBackgroundComponent } from '../../../shared/components/page-background';
import { SectionNavigatorComponent, SectionItem } from '../../../shared/components/section-navigator';
import { SpeciesGridComponent } from '../species-grid';
import { SpeciesSpecialComponent } from '../species-special';
import { YourBreedComponent } from '../your-breed';
import { SharedModule } from '../../../shared/shared.module';
import { TabItem } from '../../../shared/components/bottom-tab-bar/bottom-tab-bar.models';

@Component({
  selector: 'app-species-home',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    BottomTabBarComponent,
    PageBackgroundComponent,
    MascotPeekComponent,
    MascotBottomSheetComponent,
    AvatarButtonComponent,
    SectionNavigatorComponent,
    SpeciesGridComponent,
    SpeciesSpecialComponent,
    YourBreedComponent,
  ],
  templateUrl: './species-home.component.html',
  styleUrls: ['./species-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesHomeComponent {
  private readonly location = inject(Location);

  @ViewChild('mascotPeek') mascotPeek!: MascotPeekComponent;

  // Mascot sheet state
  showMascotSheet = signal(false);

  // Section navigation
  readonly sections: SectionItem[] = [
    { id: 'species', title: 'Specie' },
    { id: 'special', title: 'Specie speciale' },
    { id: 'your-breed', title: 'La tua razza' },
  ];
  readonly currentSectionIndex = signal(0);

  // Swipe tracking
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly swipeThreshold = 50;

  // Bottom tab bar
  tabs = MAIN_TAB_BAR_CONFIG;

  // Navigation
  goBack(): void {
    this.location.back();
  }

  // Section navigation
  onSectionChange(index: number): void {
    this.currentSectionIndex.set(index);
  }

  nextSection(): void {
    const current = this.currentSectionIndex();
    if (current < this.sections.length - 1) {
      this.currentSectionIndex.set(current + 1);
    }
  }

  prevSection(): void {
    const current = this.currentSectionIndex();
    if (current > 0) {
      this.currentSectionIndex.set(current - 1);
    }
  }

  // Tab bar handler - reset to index 0 when clicking species tab
  onTabClicked(tab: TabItem): void {
    if (tab.id === 'species') {
      this.currentSectionIndex.set(0);
    }
  }

  // Swipe gesture handlers
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipeGesture();
  }

  private handleSwipeGesture(): void {
    const swipeDistance = this.touchEndX - this.touchStartX;

    if (Math.abs(swipeDistance) > this.swipeThreshold) {
      if (swipeDistance < 0) {
        // Swipe left - next section
        this.nextSection();
      } else {
        // Swipe right - previous section
        this.prevSection();
      }
    }
  }

  // HammerJS swipe handlers (if enabled)
  @HostListener('swipeleft')
  onSwipeLeft(): void {
    this.nextSection();
  }

  @HostListener('swiperight')
  onSwipeRight(): void {
    this.prevSection();
  }

  // Mascot methods
  onMascotClick(): void {
    this.showMascotSheet.set(true);
  }

  closeMascotSheet(): void {
    this.showMascotSheet.set(false);
    this.mascotPeek?.returnToPeek();
  }
}
