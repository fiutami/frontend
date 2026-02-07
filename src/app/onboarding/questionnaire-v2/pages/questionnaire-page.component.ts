/**
 * QuestionnairePageComponent - Route wrapper for Questionnaire v1.1
 *
 * Simple wrapper that loads the QuestionnaireShellComponent.
 * Handles route params if needed (e.g., entry point, resume).
 *
 * @version 1.1
 */

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { QuestionnaireShellComponent } from '../components/questionnaire-shell/questionnaire-shell.component';

@Component({
  selector: 'app-questionnaire-page',
  standalone: true,
  imports: [
    CommonModule,
    QuestionnaireShellComponent
  ],
  template: `
    <app-questionnaire-shell
      [entryQuestionId]="entryQuestionId"
      (completed)="onCompleted()"
    />
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnairePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  /** Entry question ID (from query param or default) */
  protected entryQuestionId = 'Q00_ENTRY';

  ngOnInit(): void {
    // Check for entry point in query params
    const entry = this.route.snapshot.queryParamMap.get('entry');
    if (entry) {
      this.entryQuestionId = entry;
    }
  }

  protected onCompleted(): void {
    // Completion is handled by the shell component
    console.log('[QuestionnairePage] Questionnaire completed');
  }
}
