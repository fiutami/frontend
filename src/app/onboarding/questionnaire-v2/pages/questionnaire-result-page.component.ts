/**
 * QuestionnaireResultPageComponent - Results display for Questionnaire v1.1
 *
 * Shows breed recommendations based on the completed profile.
 * Uses MatchingEngine for scoring and FiutoAI for explanations.
 *
 * @version 1.1
 */

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProfileManagerService } from '../engine/profile-manager.service';
import { MatchingEngineService, MatchResult } from '../engine/matching-engine.service';
import { FiutoAiService } from '../engine/fiuto-ai.service';
import { EmbeddingService } from '../engine/embedding.service';
import { UserPreferenceProfile } from '../models/profile.models';
import { FiutoChatComponent } from '../components/fiuto-chat/fiuto-chat.component';

@Component({
  selector: 'app-questionnaire-result-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, FiutoChatComponent],
  templateUrl: './questionnaire-result-page.component.html',
  styleUrls: ['./questionnaire-result-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireResultPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly profileManager = inject(ProfileManagerService);
  private readonly matchingEngine = inject(MatchingEngineService);
  private readonly fiutoAi = inject(FiutoAiService);
  private readonly embeddingService = inject(EmbeddingService);

  /** Loading state */
  protected isLoading = signal(true);

  /** User profile */
  protected profile = signal<UserPreferenceProfile | null>(null);

  /** Match results */
  protected matchResults = signal<MatchResult[]>([]);

  /** Expanded explanation for a breed */
  protected expandedBreedId = signal<string | null>(null);
  protected breedExplanation = signal<string | null>(null);
  protected isLoadingExplanation = signal(false);

  /** Matching engine state */
  protected matchingState = this.matchingEngine.state;
  protected embeddingState = this.embeddingService.loadState;

  /** Selected species */
  protected selectedSpecies = computed(() => {
    const p = this.profile();
    return p?.Route?.selectedSpecies ?? 'unknown';
  });

  /** Profile summary for display */
  protected profileSummary = computed(() => {
    const p = this.profile();
    if (!p) return [];

    const items = [];

    if (p.EnvironmentProfile?.housingType) {
      items.push({ key: 'questionnaire.result.housing', value: p.EnvironmentProfile.housingType });
    }
    if (p.LifestyleProfile?.dailyTime) {
      items.push({ key: 'questionnaire.result.time', value: p.LifestyleProfile.dailyTime });
    }
    if (p.LifestyleProfile?.experience) {
      items.push({ key: 'questionnaire.result.experience', value: p.LifestyleProfile.experience });
    }
    if (p.FinanceProfile?.monthlyBudget) {
      items.push({ key: 'questionnaire.result.budget', value: p.FinanceProfile.monthlyBudget });
    }

    return items;
  });

  /** Top 3 recommendations */
  protected topRecommendations = computed(() => this.matchResults().slice(0, 3));

  /** Has results */
  protected hasResults = computed(() => this.matchResults().length > 0);

  ngOnInit(): void {
    this.loadProfileAndMatch();
  }

  ngOnDestroy(): void {
    // Clear cache to free memory
    this.matchingEngine.clearCache();
  }

  private async loadProfileAndMatch(): Promise<void> {
    try {
      const profile = this.profileManager.getProfile();
      this.profile.set(profile);

      // Run matching
      const results = await this.matchingEngine.computeMatches(profile);
      this.matchResults.set(results);
    } catch (err) {
      console.error('[ResultPage] Error:', err);
      // Try local matching as fallback
      try {
        const profile = this.profile();
        if (profile) {
          const results = await this.matchingEngine.computeMatchesLocal(profile);
          this.matchResults.set(results);
        }
      } catch {
        // No results available
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Toggle breed explanation */
  protected async toggleExplanation(breed: MatchResult): Promise<void> {
    if (this.expandedBreedId() === breed.breed.id) {
      this.expandedBreedId.set(null);
      this.breedExplanation.set(null);
      return;
    }

    this.expandedBreedId.set(breed.breed.id);
    this.isLoadingExplanation.set(true);

    try {
      const explanation = await this.fiutoAi.explainBreed(breed, this.profile() ?? {});
      this.breedExplanation.set(explanation);
    } catch {
      this.breedExplanation.set(this.getDefaultExplanation(breed));
    } finally {
      this.isLoadingExplanation.set(false);
    }
  }

  private getDefaultExplanation(breed: MatchResult): string {
    const reasons = breed.matchReasons.map(r => r.reason).join('. ');
    return reasons || `${breed.breed.name} è compatibile con il tuo profilo.`;
  }

  /** Get score color class */
  protected getScoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-low';
  }

  /** Navigate to breed details */
  protected viewBreedDetails(breedId: string): void {
    this.router.navigate(['/breeds', breedId]);
  }

  /** Navigate to breed catalog */
  protected exploreCatalog(): void {
    const species = this.selectedSpecies();
    this.router.navigate(['/breeds'], { queryParams: { species } });
  }

  /** Start over */
  protected startOver(): void {
    this.profileManager.reset();
    this.matchingEngine.reset();
    this.router.navigate(['/onboarding/questionnaire']);
  }

  /** Go to home */
  protected goHome(): void {
    this.router.navigate(['/']);
  }

  /** Track by for results */
  protected trackByBreedId(_: number, result: MatchResult): string {
    return result.breed.id;
  }
}
