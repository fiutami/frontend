import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SpeechBubbleComponent } from '../speech-bubble/speech-bubble.component';

/**
 * Mascot Peek Component
 *
 * Shows Fiuto mascot peeking from the right edge of the tab bar.
 * - Hidden state: Only nose with floating hearts visible
 * - Draggable left to reveal full mascot
 * - Spring physics animations
 * - Tapping opens mascot bottom sheet
 */
@Component({
  selector: 'app-mascot-peek',
  standalone: true,
  imports: [CommonModule, TranslateModule, SpeechBubbleComponent],
  templateUrl: './mascot-peek.component.html',
  styleUrls: ['./mascot-peek.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MascotPeekComponent implements OnDestroy {
  @ViewChild('mascotContainer') mascotContainer!: ElementRef<HTMLDivElement>;

  @Input() hidden = false;
  @Output() mascotTapped = new EventEmitter<void>();

  // Drag state
  private isDragging = false;
  private startX = 0;
  private dragDistance = 0;

  // Position state (negative = pulled out from right)
  readonly dragOffset = signal(0);
  readonly isExpanded = signal(false);
  readonly animatingToSheet = signal(false);
  readonly atSheetPosition = signal(false); // Stays at sheet position

  // Animation frame ID for cleanup
  private animationFrameId: number | null = null;

  // Spring physics constants
  private readonly SPRING_STIFFNESS = 300;
  private readonly SPRING_DAMPING = 25;
  private readonly SPRING_MASS = 1;

  // Thresholds
  private readonly EXPAND_THRESHOLD = -60; // Pull 60px to expand
  private readonly MAX_DRAG = -120; // Maximum pull distance

  // Spring animation state
  private velocity = 0;
  private targetOffset = 0;

  // Computed styles
  readonly transformStyle = computed(() => {
    const offset = this.dragOffset();
    return `translateX(${offset}px)`;
  });

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  // Touch/Mouse event handlers
  onDragStart(event: TouchEvent | MouseEvent): void {
    this.isDragging = true;
    this.dragDistance = 0;

    const clientX = this.getClientX(event);
    this.startX = clientX - this.dragOffset();

    // Stop any running spring animation
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDragMove(event: TouchEvent | MouseEvent): void {
    if (!this.isDragging) return;

    const clientX = this.getClientX(event);
    let newOffset = clientX - this.startX;

    // Track total drag distance for tap detection
    this.dragDistance = Math.abs(newOffset - this.dragOffset());

    // Clamp the offset
    newOffset = Math.min(0, Math.max(this.MAX_DRAG, newOffset));

    this.dragOffset.set(newOffset);
  }

  @HostListener('document:mouseup', ['$event'])
  @HostListener('document:touchend', ['$event'])
  onDragEnd(event: TouchEvent | MouseEvent): void {
    if (!this.isDragging) return;
    this.isDragging = false;

    const offset = this.dragOffset();

    // Determine target position based on threshold
    if (offset < this.EXPAND_THRESHOLD) {
      // Expand fully
      this.targetOffset = this.MAX_DRAG;
      this.isExpanded.set(true);
    } else {
      // Snap back to peek position
      this.targetOffset = 0;
      this.isExpanded.set(false);
    }

    // Start spring animation
    this.velocity = 0;
    this.animateSpring();
  }

  // Spring physics animation
  private animateSpring(): void {
    const animate = () => {
      const currentOffset = this.dragOffset();
      const displacement = currentOffset - this.targetOffset;

      // Spring force: F = -kx - bv
      const springForce = -this.SPRING_STIFFNESS * displacement;
      const dampingForce = -this.SPRING_DAMPING * this.velocity;
      const acceleration = (springForce + dampingForce) / this.SPRING_MASS;

      this.velocity += acceleration * 0.016; // ~60fps
      const newOffset = currentOffset + this.velocity * 0.016;

      this.dragOffset.set(newOffset);

      // Check if animation should stop
      const isSettled = Math.abs(displacement) < 0.5 && Math.abs(this.velocity) < 0.5;

      if (!isSettled) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.dragOffset.set(this.targetOffset);
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  // Handle tap on mascot
  onMascotTap(event: MouseEvent | TouchEvent): void {
    // Only trigger tap if not dragging significantly (< 10px movement)
    if (this.dragDistance < 10 && !this.atSheetPosition()) {
      // If expanded (bubble visible), emit mascotTapped and collapse
      if (this.isExpanded()) {
        this.mascotTapped.emit();
        this.collapse();
        return;
      }

      // If NOT expanded, expand to show bubble (first click)
      this.targetOffset = this.MAX_DRAG;
      this.isExpanded.set(true);
      this.velocity = 0;
      this.animateSpring();
    }
  }

  // Return mascot to peek position (called when sheet closes)
  returnToPeek(): void {
    this.atSheetPosition.set(false);
  }

  // Utility to get clientX from touch or mouse event
  private getClientX(event: TouchEvent | MouseEvent): number {
    if ('touches' in event) {
      return event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX ?? 0;
    }
    return event.clientX;
  }

  // Public method to collapse mascot
  collapse(): void {
    this.targetOffset = 0;
    this.isExpanded.set(false);
    this.velocity = 0;
    this.animateSpring();
  }
}
