import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Re-export for consumers
export interface MascotSuggestion {
  id: string;
  icon: string;
  title: string;
  description?: string;
  actionUrl?: string;
  type?: string;
  priority?: number;
}

@Component({
  selector: 'app-mascot-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mascot-bottom-sheet.component.html',
  styleUrls: ['./mascot-bottom-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MascotBottomSheetComponent {
  @Input() isOpen = false;
  @Input() suggestions: MascotSuggestion[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() suggestionAction = new EventEmitter<MascotSuggestion>();

  isDragging = signal(false);
  dragY = signal(0);

  close(): void {
    this.dragY.set(0);
    this.isDragging.set(false);
    this.closed.emit();
  }

  onBackdropClick(): void {
    this.close();
  }

  onSuggestionClick(s: MascotSuggestion): void {
    this.suggestionAction.emit(s);
  }

  onPointerDown(ev: PointerEvent): void {
    this.isDragging.set(true);
    this.dragY.set(0);
    (ev.target as HTMLElement)?.setPointerCapture?.(ev.pointerId);
  }

  onPointerMove(ev: PointerEvent): void {
    if (!this.isDragging()) return;
    const dy = Math.max(0, ev.movementY + this.dragY());
    this.dragY.set(dy);
  }

  onPointerUp(): void {
    if (!this.isDragging()) return;

    const dy = this.dragY();
    this.isDragging.set(false);

    if (dy > 80) {
      this.close();
      return;
    }

    this.dragY.set(0);
  }

  sheetTransform(): string {
    const dy = this.dragY();
    return dy > 0 ? `translateY(${dy}px)` : '';
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.close();
    }
  }
}
