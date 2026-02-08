import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TabPageShellFiutoComponent } from '../../components/tab-page-shell-fiuto/tab-page-shell-fiuto.component';

/**
 * Pagina di TEST per TabPageShellFiuto
 * URL: /test/shell-fiuto
 */
@Component({
  selector: 'app-test-shell-fiuto',
  standalone: true,
  imports: [CommonModule, TabPageShellFiutoComponent],
  template: `
    <app-tab-page-shell-fiuto
      title="Test Shell Fiuto"
      activeTabId="fiuto"
      [showBack]="true"
      (backClicked)="onBack()">

      <!-- Sticky Content -->
      <ng-container shellStickyContent>
        <div class="test-sticky">
          <h2>Fiuto AI</h2>
          <p>Shell speciale per le funzionalità AI</p>
        </div>
      </ng-container>

      <!-- Main Content -->
      <div class="test-content">
        <h3>Suggerimenti AI</h3>
        <p>Contenuto scrollabile della shell Fiuto.</p>

        @for (item of items; track item) {
          <div class="test-card">
            <span>🐾 Suggerimento {{ item }}</span>
          </div>
        }
      </div>

    </app-tab-page-shell-fiuto>
  `,
  styles: [`
    .test-sticky {
      padding: var(--sp-4);
      text-align: center;

      h2 {
        margin: 0 0 var(--sp-2);
        font-size: 18px;
        font-weight: 700;
        color: var(--white);
      }

      p {
        margin: 0;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .test-content {
      padding: var(--sp-4);

      h3 {
        margin: 0 0 var(--sp-2);
        font-size: 16px;
        font-weight: 600;
        color: var(--white);
      }

      p {
        margin: 0 0 var(--sp-4);
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .test-card {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 16px;
      padding: var(--sp-4);
      margin-bottom: var(--sp-3);
      color: var(--white);
      font-weight: 500;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestShellFiutoComponent {
  items = [1, 2, 3, 4, 5, 6];

  constructor(private router: Router) {}

  onBack(): void {
    this.router.navigate(['/home/main']);
  }
}
