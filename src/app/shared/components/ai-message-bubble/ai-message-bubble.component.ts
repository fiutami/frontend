import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeechBubbleComponent } from '../speech-bubble/speech-bubble.component';

/**
 * AiMessageBubbleComponent - AI Message with Mascot
 *
 * A specialized speech bubble for AI messages, with optional mascot display.
 * Uses SpeechBubbleComponent internally with AI-specific styling.
 *
 * @example
 * ```html
 * <app-ai-message-bubble
 *   message="Ciao! Come posso aiutarti oggi?"
 *   [showMascot]="true"
 *   mascotPosition="right">
 * </app-ai-message-bubble>
 * ```
 */
@Component({
  selector: 'app-ai-message-bubble',
  standalone: true,
  imports: [CommonModule, SpeechBubbleComponent],
  templateUrl: './ai-message-bubble.component.html',
  styleUrls: ['./ai-message-bubble.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiMessageBubbleComponent {
  /**
   * The AI message to display
   * @required
   */
  @Input({ required: true }) message!: string;

  /**
   * Whether to show the AI mascot
   * @default false
   */
  @Input() showMascot = false;

  /**
   * Position of the mascot relative to the bubble
   * @default 'right'
   */
  @Input() mascotPosition: 'left' | 'right' = 'right';

  /**
   * Whether to animate the bubble appearance
   * @default true
   */
  @Input() animated = true;

  /**
   * Whether to show typing indicator instead of message
   * @default false
   */
  @Input() typing = false;

  /**
   * Custom mascot image source
   * @default 'assets/images/ai-mascot-dog.png'
   */
  @Input() mascotSrc = 'assets/images/ai-mascot-dog.png';

  /**
   * Maximum width of the bubble
   */
  @Input() maxWidth = '320px';

  /**
   * Get tail position based on mascot position
   */
  get tailPosition(): 'left' | 'right' {
    // Tail points toward the mascot
    return this.mascotPosition === 'right' ? 'right' : 'left';
  }

  /**
   * Get container CSS classes
   */
  get containerClasses(): Record<string, boolean> {
    return {
      'ai-message': true,
      [`ai-message--mascot-${this.mascotPosition}`]: this.showMascot,
      'ai-message--typing': this.typing,
    };
  }
}
