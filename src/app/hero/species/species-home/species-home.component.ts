import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default/tab-page-shell-default.component';
import { SectionNavigatorComponent, SectionItem } from '../../../shared/components/section-navigator';
import { SpeciesGridComponent } from '../species-grid';
import { SpeciesSpecialComponent } from '../species-special';
import { YourBreedComponent } from '../your-breed';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-species-home',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TabPageShellDefaultComponent,
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
}
