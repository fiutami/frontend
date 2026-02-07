/**
 * QuestionnaireResultPageComponent - Results display for Questionnaire v1.1
 *
 * Shows the final recommendation based on the completed profile.
 * This is a placeholder - the matching engine will be implemented in Step 5.
 *
 * @version 1.1
 */

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProfileManagerService } from '../engine/profile-manager.service';
import { UserPreferenceProfile } from '../models/profile.models';

@Component({
  selector: 'app-questionnaire-result-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './questionnaire-result-page.component.html',
  styleUrls: ['./questionnaire-result-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireResultPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly profileManager = inject(ProfileManagerService);

  /** Loading state */
  protected isLoading = signal(true);

  /** User profile */
  protected profile = signal<UserPreferenceProfile | null>(null);

  /** Selected species */
  protected selectedSpecies = computed(() => {
    const p = this.profile();
    return p?.Route.selectedSpecies ?? 'unknown';
  });

  /** Profile summary for display */
  protected profileSummary = computed(() => {
    const p = this.profile();
    if (!p) return [];

    return [
      { key: 'questionnaire.result.housing', value: p.EnvironmentProfile.housingType },
      { key: 'questionnaire.result.time', value: p.LifestyleProfile.dailyTime },
      { key: 'questionnaire.result.experience', value: p.LifestyleProfile.experience },
      { key: 'questionnaire.result.budget', value: p.FinanceProfile.monthlyBudget },
    ];
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    try {
      const profile = this.profileManager.getProfile();
      this.profile.set(profile);
    } catch {
      // No profile found, redirect back
      this.router.navigate(['/onboarding/questionnaire']);
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Navigate to breed catalog */
  protected exploreCatalog(): void {
    const species = this.selectedSpecies();
    this.router.navigate(['/breeds'], { queryParams: { species } });
  }

  /** Start over */
  protected startOver(): void {
    this.profileManager.reset();
    this.router.navigate(['/onboarding/questionnaire']);
  }

  /** Go to home */
  protected goHome(): void {
    this.router.navigate(['/']);
  }
}
