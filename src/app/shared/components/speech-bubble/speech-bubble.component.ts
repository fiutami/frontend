import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tail position options for the speech bubble
 */
export type TailPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'right'
  | 'none';

/**
 * Visual variant of the speech bubble
 */
export type BubbleVariant = 'default' | 'ai' | 'user' | 'ai-info';

/**
 * SpeechBubbleComponent - Reusable Speech Bubble
 *
 * A chat-style speech bubble with configurable tail position and variants.
 * Uses content projection for flexible message content.
 *
 * @example
 * ```html
 * <app-speech-bubble tailPosition="bottom-left" variant="ai">
 *   Ciao! Come posso aiutarti?
 * </app-speech-bubble>
 * ```
 */
@Component({
  selector: 'app-speech-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './speech-bubble.component.html',
  styleUrls: ['./speech-bubble.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeechBubbleComponent {
  /**
   * Position of the speech bubble tail/pointer
   * @default 'bottom-left'
   */
  @Input() tailPosition: TailPosition = 'bottom-left';

  /**
   * Visual variant affecting colors and styling
   * - 'default': White background
   * - 'ai': Cream/yellow background for AI messages
   * - 'user': White background for user messages
   * - 'ai-info': Blue background for AI info/intro messages
   * @default 'default'
   */
  @Input() variant: BubbleVariant = 'default';

  /**
   * Optional maximum width for the bubble
   * Accepts CSS width values (e.g., '300px', '80%')
   */
  @Input() maxWidth?: string;

  /**
   * Whether to show a subtle animation on appearance
   * @default false
   */
  @Input() animated = false;

  /**
   * Get CSS classes based on inputs
   */
  get bubbleClasses(): Record<string, boolean> {
    return {
      'speech-bubble': true,
      [`speech-bubble--${this.variant}`]: true,
      [`speech-bubble--tail-${this.tailPosition}`]: this.tailPosition !== 'none',
      'speech-bubble--no-tail': this.tailPosition === 'none',
      'speech-bubble--animated': this.animated,
    };
  }

  /**
   * Get inline styles for maxWidth
   */
  get bubbleStyles(): Record<string, string | undefined> {
    return {
      'max-width': this.maxWidth,
    };
  }
}
