/**
 * OptionCardComponent - Single selectable option
 *
 * Renders differently based on visualization type:
 * - radio: Compact inline option
 * - squares: Square button with icon
 * - cards: Full card with description
 *
 * @version 1.1
 */

import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  HostListener,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuestionOption, QuestionVisualization } from '../../models/question.models';

@Component({
  selector: 'app-option-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './option-card.component.html',
  styleUrls: ['./option-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionCardComponent {
  /** The option data */
  option = input.required<QuestionOption>();

  /** Pre-translated label */
  label = input.required<string>();

  /** Pre-translated description (optional) */
  description = input<string | null>(null);

  /** Visualization type */
  visualization = input<QuestionVisualization>('cards');

  /** Whether this option is currently selected */
  isSelected = input<boolean>(false);

  /** Emitted when option is clicked */
  selected = output<void>();

  /** Host class based on visualization */
  @HostBinding('class')
  protected get hostClass(): string {
    return `option-card option-${this.visualization()}`;
  }

  /** Host selected state */
  @HostBinding('class.selected')
  protected get selectedClass(): boolean {
    return this.isSelected();
  }

  /** Handle click */
  @HostListener('click')
  protected onClick(): void {
    this.selected.emit();
  }

  /** Handle keyboard enter/space */
  @HostListener('keydown.enter')
  @HostListener('keydown.space', ['$event'])
  protected onKeydown(event?: KeyboardEvent): void {
    if (event) {
      event.preventDefault();
    }
    this.selected.emit();
  }

  /** Icon to display (if any) */
  protected icon = computed(() => {
    return this.option().icon ?? null;
  });

  /** Whether icon is an emoji (starts with emoji unicode) */
  protected isEmoji = computed(() => {
    const icon = this.icon();
    if (!icon) return false;
    // Simple check: emoji typically have higher code points
    return icon.codePointAt(0)! > 255;
  });

  /** Tab index for keyboard navigation */
  @HostBinding('attr.tabindex')
  protected tabIndex = 0;

  /** ARIA role */
  @HostBinding('attr.role')
  protected role = 'button';

  /** ARIA pressed state */
  @HostBinding('attr.aria-pressed')
  protected get ariaPressed(): string {
    return this.isSelected() ? 'true' : 'false';
  }
}
