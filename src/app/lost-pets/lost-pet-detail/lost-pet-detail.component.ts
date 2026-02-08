import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { LostPetsModuleService } from '../services/lost-pets.service';
import { LostPet, LostPetSighting } from '../models/lost-pets.models';

@Component({
  selector: 'app-lost-pet-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedModule],
  templateUrl: './lost-pet-detail.component.html',
  styleUrls: ['./lost-pet-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LostPetDetailComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly lostPetsService = inject(LostPetsModuleService);
  private readonly destroy$ = new Subject<void>();

  pet = signal<LostPet | null>(null);
  sightings = signal<LostPetSighting[]>([]);
  loading = signal(true);
  showContactModal = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = params.get('id');
          if (id) {
            return this.lostPetsService.getById(id);
          }
          throw new Error('No ID provided');
        })
      )
      .subscribe({
        next: (pet) => {
          this.pet.set(pet);
          this.loading.set(false);
          this.loadSightings(pet.id);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/lost-pets']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSightings(petId: string): void {
    this.lostPetsService.getSightings(petId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.sightings.set(response.items)
      });
  }

  goBack(): void {
    this.router.navigate(['/lost-pets']);
  }

  reportSighting(): void {
    const pet = this.pet();
    if (pet) {
      this.router.navigate(['/lost-pets', pet.id, 'sighting']);
    }
  }

  openContact(): void {
    this.showContactModal.set(true);
  }

  closeContact(): void {
    this.showContactModal.set(false);
  }

  callOwner(): void {
    const pet = this.pet();
    if (pet?.contactPhone) {
      window.location.href = `tel:${pet.contactPhone}`;
    }
  }

  emailOwner(): void {
    const pet = this.pet();
    if (pet?.contactEmail) {
      window.location.href = `mailto:${pet.contactEmail}?subject=Avvistamento ${pet.petName}`;
    }
  }

  shareReport(): void {
    const pet = this.pet();
    if (pet && navigator.share) {
      navigator.share({
        title: `Aiutami a trovare ${pet.petName}`,
        text: pet.description,
        url: window.location.href
      });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return this.lostPetsService.formatLastSeen(date);
  }

  trackBySighting(index: number, sighting: LostPetSighting): string {
    return sighting.id;
  }
}
