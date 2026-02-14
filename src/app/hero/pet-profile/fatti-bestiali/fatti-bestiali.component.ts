import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default';
import { PetService } from '../../../core/services/pet.service';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionsService } from '../../../core/services/subscriptions.service';
import { PetResponse } from '../../../core/models/pet.models';

export interface FBSection {
  id: string;
  titleKey: string;
  icon: string;
  isLocked: boolean;
}

@Component({
  selector: 'app-fatti-bestiali',
  standalone: true,
  imports: [CommonModule, TranslateModule, TabPageShellDefaultComponent],
  templateUrl: './fatti-bestiali.component.html',
  styleUrls: ['./fatti-bestiali.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FattiBestialiComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private petService = inject(PetService);
  private authService = inject(AuthService);
  private subscriptionsService = inject(SubscriptionsService);
  private cdr = inject(ChangeDetectorRef);

  // State signals
  pet = signal<PetResponse | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  expandedSectionId = signal<string | null>(null);
  userCity = signal('');
  userPlanId = signal<string>('free');

  // Computed
  petAge = computed(() => {
    const p = this.pet();
    if (!p) return '';
    if (p.calculatedAge) return p.calculatedAge;
    if (!p.birthDate) return '';
    const birth = new Date(p.birthDate);
    const now = new Date();
    const diffMs = now.getTime() - birth.getTime();
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    if (years > 0) return `${years} ${years === 1 ? 'anno' : 'anni'}`;
    if (months > 0) return `${months} ${months === 1 ? 'mese' : 'mesi'}`;
    return '';
  });

  isPremiumOrPro = computed(() => {
    const plan = this.userPlanId();
    return plan === 'premium' || plan === 'pro';
  });

  // Sections definition
  readonly sections: FBSection[] = [
    { id: 'appointments', titleKey: 'fattiBestiali.sections.appointments', icon: 'calendar_today', isLocked: false },
    { id: 'documents', titleKey: 'fattiBestiali.sections.documents', icon: 'description', isLocked: false },
    { id: 'vaccinations', titleKey: 'fattiBestiali.sections.vaccinations', icon: 'vaccines', isLocked: false },
    { id: 'allergies', titleKey: 'fattiBestiali.sections.allergies', icon: 'healing', isLocked: false },
    { id: 'activityDiary', titleKey: 'fattiBestiali.sections.activityDiary', icon: 'directions_run', isLocked: true },
    { id: 'weightCondition', titleKey: 'fattiBestiali.sections.weightCondition', icon: 'monitor_weight', isLocked: true },
  ];

  ngOnInit(): void {
    const petId = this.route.snapshot.paramMap.get('id');
    if (petId) {
      this.loadPetData(petId);
    }
    this.loadUserProfile();
    this.loadSubscription();
  }

  toggleSection(sectionId: string): void {
    this.expandedSectionId.update(current =>
      current === sectionId ? null : sectionId
    );
  }

  isSectionExpanded(sectionId: string): boolean {
    return this.expandedSectionId() === sectionId;
  }

  isSectionLocked(section: FBSection): boolean {
    return section.isLocked && !this.isPremiumOrPro();
  }

  navigateToEditPet(): void {
    const p = this.pet();
    if (p) {
      this.router.navigate(['/profile/pet', p.id]);
    }
  }

  navigateToAddPet(): void {
    this.router.navigate(['/home/pet-register/specie']);
  }

  navigateToSubscriptions(): void {
    this.router.navigate(['/home/subscriptions']);
  }

  formatBirthDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private loadPetData(petId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.petService.getPet(petId).subscribe({
      next: (response: PetResponse) => {
        this.pet.set(response);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load pet:', err);
        this.errorMessage.set('Impossibile caricare i dati del pet');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.userCity.set(profile.city || '');
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  private loadSubscription(): void {
    this.subscriptionsService.getCurrentSubscription().subscribe({
      next: (sub) => {
        this.userPlanId.set(sub.planId || 'free');
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }
}
