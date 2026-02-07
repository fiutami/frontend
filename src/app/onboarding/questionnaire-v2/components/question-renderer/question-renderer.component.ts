/**
 * QuestionRendererComponent - Dynamic question display
 *
 * Renders a question with its options based on visualization type:
 * - radio: Simple radio buttons
 * - squares: Grid of square options
 * - cards: Large cards with descriptions
 * - slider: Range slider (future)
 *
 * @version 1.1
 */

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Question, QuestionOption, QuestionVisualization } from '../../models/question.models';
import { OptionCardComponent } from '../option-card/option-card.component';

@Component({
  selector: 'app-question-renderer',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OptionCardComponent
  ],
  templateUrl: './question-renderer.component.html',
  styleUrls: ['./question-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionRendererComponent {
  private readonly translateService = inject(TranslateService);

  /** The question to render */
  question = input.required<Question>();

  /** Pre-translated question text */
  questionText = input<string>('');

  /** Pre-translated hint text */
  hintText = input<string | null>(null);

  /** Emitted when an option is selected */
  optionSelected = output<QuestionOption>();

  /** Visualization type (default: cards) */
  protected visualization = computed<QuestionVisualization>(() => {
    return this.question().visualization ?? 'cards';
  });

  /** CSS class for the options container */
  protected containerClass = computed(() => {
    const viz = this.visualization();
    return `options-container options-${viz}`;
  });

  /** Translate an option's label */
  protected getOptionLabel(option: QuestionOption): string {
    return this.translateService.instant(option.labelKey);
  }

  /** Translate an option's description */
  protected getOptionDescription(option: QuestionOption): string | null {
    if (!option.descriptionKey) return null;
    return this.translateService.instant(option.descriptionKey);
  }

  /** Handle option click */
  protected onOptionClick(option: QuestionOption): void {
    this.optionSelected.emit(option);
  }

  /** Track by for ngFor */
  protected trackByOptionId(_index: number, option: QuestionOption): string {
    return option.id;
  }
}
