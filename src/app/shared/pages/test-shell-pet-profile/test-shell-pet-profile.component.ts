import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TabPageShellPetProfileComponent } from '../../components/tab-page-shell-pet-profile';

/**
 * Pagina di TEST per TabPageShellPetProfile
 * URL: /test/shell-pet-profile
 */
@Component({
  selector: 'app-test-shell-pet-profile',
  standalone: true,
  imports: [CommonModule, TabPageShellPetProfileComponent],
  template: `
    <app-tab-page-shell-pet-profile
      title="Profilo"
      activeTabId="home"
      [showBack]="true"
      (backClicked)="onBack()">

      <!-- Pet Photo nel cerchio bianco -->
      <div shellPetPhoto class="test-pet-photo">
        <span class="test-pet-emoji">&#128021;</span>
      </div>

      <!-- Sticky Content -->
      <ng-container shellStickyContent>
        <div class="test-pet-info">
          <h1 class="test-pet-name">Luna</h1>
          <p class="test-pet-breed">Golden Retriever - 3 anni</p>
        </div>
      </ng-container>

      <!-- Main Content (dentro card blu) -->
      <div class="test-content">
        <p class="test-placeholder">Contenuto profilo pet</p>
      </div>

    </app-tab-page-shell-pet-profile>
  `,
  styles: [`
    .test-pet-photo {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
    }

    .test-pet-emoji {
      font-size: 120px;
    }

    .test-pet-info {
      padding: var(--sp-4);
      text-align: center;
    }

    .test-pet-name {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: var(--white);
    }

    .test-pet-breed {
      margin: var(--sp-1) 0 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }

    .test-content {
      padding: var(--sp-4);
    }

    .test-placeholder {
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
      font-size: 16px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestShellPetProfileComponent {
  constructor(private router: Router) {}

  onBack(): void {
    this.router.navigate(['/home/main']);
  }
}
