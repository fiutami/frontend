import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TabPageShellYellowComponent } from '../../components/tab-page-shell-yellow/tab-page-shell-yellow.component';

/**
 * Pagina di TEST per TabPageShellYellow
 * URL: /test/shell-yellow
 */
@Component({
  selector: 'app-test-shell-yellow',
  standalone: true,
  imports: [CommonModule, TabPageShellYellowComponent],
  template: `
    <app-tab-page-shell-yellow
      title="Test Shell Yellow"
      activeTabId="home"
      [showBack]="true"
      (backClicked)="onBack()">

      <!-- Sticky Content -->
      <ng-container shellStickyContent>
        <div class="test-sticky">
          <h2>Sticky Content Area</h2>
          <p>Questa sezione rimane fissa durante lo scroll</p>
        </div>
      </ng-container>

      <!-- Main Content -->
      <div class="test-content">
        <h3>Main Content Area</h3>
        <p>Contenuto scrollabile della shell gialla.</p>

        @for (item of items; track item) {
          <div class="test-card">
            <span>Card {{ item }}</span>
          </div>
        }
      </div>

    </app-tab-page-shell-yellow>
  `,
  styles: [`
    .test-sticky {
      padding: var(--sp-4);
      text-align: center;

      h2 {
        margin: 0 0 var(--sp-2);
        font-size: 18px;
        font-weight: 700;
        color: var(--text);
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #666;
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
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: var(--sp-4);
      margin-bottom: var(--sp-3);
      color: var(--white);
      font-weight: 500;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestShellYellowComponent {
  items = [1, 2, 3, 4, 5, 6, 7, 8];

  constructor(private router: Router) {}

  onBack(): void {
    this.router.navigate(['/home/main']);
  }
}
