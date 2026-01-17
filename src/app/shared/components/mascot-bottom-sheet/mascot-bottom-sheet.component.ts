import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { takeWhile, tap, finalize } from 'rxjs/operators';

import { SpeechBubbleComponent } from '../speech-bubble/speech-bubble.component';
import { ANIMATION_DELAY } from '../../../core/config/constants/timing.constants';

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
  imports: [CommonModule, FormsModule, SpeechBubbleComponent],
  templateUrl: './mascot-bottom-sheet.component.html',
  styleUrls: ['./mascot-bottom-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MascotBottomSheetComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() suggestions: MascotSuggestion[] = [];
  @Input() aiMessage = '';

  @Output() closed = new EventEmitter<void>();
  @Output() suggestionAction = new EventEmitter<MascotSuggestion>();
  @Output() aiModeChange = new EventEmitter<boolean>();
  @Output() chatMessage = new EventEmitter<string>();

  isDragging = signal(false);
  dragY = signal(0);

  // Typewriter state
  displayedText = signal('');
  isTyping = signal(false);
  private typewriterSubscription?: Subscription;

  // Chat input
  chatInput = '';

  ngOnChanges(changes: SimpleChanges): void {
    const isOpenChange = changes['isOpen'];
    const aiMessageChange = changes['aiMessage'];

    // Se si chiude, stoppa subito
    if (isOpenChange && !isOpenChange.currentValue) {
      this.stopTypewriter();
      this.aiModeChange.emit(false);
      return;
    }

    // Se si apre, parti
    if (isOpenChange?.currentValue && this.aiMessage) {
      this.startTypewriter(this.aiMessage);
      this.aiModeChange.emit(true);
      return;
    }

    // Se cambia messaggio mentre è aperto, riparte
    if (aiMessageChange && this.isOpen && aiMessageChange.currentValue) {
      this.startTypewriter(aiMessageChange.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.stopTypewriter();
  }

  close(): void {
    this.stopTypewriter();
    this.chatInput = '';
    this.dragY.set(0);
    this.isDragging.set(false);
    this.aiModeChange.emit(false);
    this.closed.emit();
  }

  onChatSubmit(event: Event): void {
    event.preventDefault();
    const message = this.chatInput.trim();
    if (message) {
      this.chatMessage.emit(message);
      this.chatInput = '';
    }
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

  private startTypewriter(message: string): void {
    this.stopTypewriter();

    if (!message) return;

    this.displayedText.set('');
    this.isTyping.set(true);

    let index = 0;

    this.typewriterSubscription = interval(ANIMATION_DELAY.TYPEWRITER_CHAR_MS).pipe(
      takeWhile(() => index < message.length),
      tap(() => {
        this.displayedText.update(text => text + message[index]);
        index++;
      }),
      finalize(() => this.isTyping.set(false))
    ).subscribe();
  }

  private stopTypewriter(): void {
    this.typewriterSubscription?.unsubscribe();
    this.typewriterSubscription = undefined;
    this.isTyping.set(false);
  }
}
