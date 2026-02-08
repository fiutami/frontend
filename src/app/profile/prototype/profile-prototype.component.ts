import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PrototypeService, PrototypeProfile } from '../services/prototype.service';

/**
 * ProfilePrototypeComponent - Prototype profile for Path B users
 *
 * Shows a preview profile based on quiz results for users
 * who haven't registered a pet yet. Includes locked sections
 * to encourage pet registration.
 *
 * Features:
 * - Unlocked: Species info card with breed suggestion
 * - Locked: Gallery, Friends, Memories sections
 * - CTA to register pet or retake quiz
 */
@Component({
  selector: 'app-profile-prototype',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './profile-prototype.component.html',
  styleUrls: ['./profile-prototype.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePrototypeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly prototypeService = inject(PrototypeService);

  /** Prototype profile data */
  protected profile = signal<PrototypeProfile | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  /**
   * Load prototype profile from session storage
   */
  private loadProfile(): void {
    const data = this.prototypeService.getPrototypeData();

    if (data) {
      this.profile.set(data);
    } else {
      // No prototype data, redirect to quiz
      this.router.navigate(['/onboarding/quiz']);
    }
  }

  /**
   * Navigate to breeds page for more info
   */
  onDiscoverBreed(): void {
    this.router.navigate(['/home/breeds']);
  }

  /**
   * Navigate to pet registration
   */
  onRegisterPet(): void {
    this.router.navigate(['/onboarding/register-pet']);
  }

  /**
   * Navigate back to quiz
   */
  onRetakeQuiz(): void {
    this.router.navigate(['/onboarding/quiz']);
  }

  /**
   * Navigate back
   */
  onBack(): void {
    this.router.navigate(['/onboarding/quiz-result']);
  }
}
