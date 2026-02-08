import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { LostPetsModuleService } from '../services/lost-pets.service';
import { LostPet } from '../models/lost-pets.models';

@Component({
  selector: 'app-lost-pets-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedModule, RouterLink],
  templateUrl: './lost-pets-list.component.html',
  styleUrls: ['./lost-pets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LostPetsListComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly lostPetsService = inject(LostPetsModuleService);
  private readonly destroy$ = new Subject<void>();

  lostPets = signal<LostPet[]>([]);
  loading = signal(true);
  activeTab = signal<'nearby' | 'all'>('nearby');
  userLocation = signal<{ lat: number; lng: number } | null>(null);

  ngOnInit(): void {
    this.getUserLocation();
    this.loadLostPets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation.set({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          if (this.activeTab() === 'nearby') {
            this.loadLostPets();
          }
        },
        () => {
          // Fallback: load all
          this.activeTab.set('all');
          this.loadLostPets();
        }
      );
    }
  }

  loadLostPets(): void {
    this.loading.set(true);

    const location = this.userLocation();
    const params = this.activeTab() === 'nearby' && location
      ? { lat: location.lat, lng: location.lng, radiusKm: 50 }
      : {};

    this.lostPetsService.search(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.lostPets.set(response.items);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  setTab(tab: 'nearby' | 'all'): void {
    this.activeTab.set(tab);
    this.loadLostPets();
  }

  isRecent(pet: LostPet): boolean {
    const daysDiff = (Date.now() - new Date(pet.lastSeenDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 3;
  }

  openDetail(pet: LostPet): void {
    this.router.navigate(['/lost-pets', pet.id]);
  }

  reportLost(): void {
    this.router.navigate(['/lost-pets/report']);
  }

  reportSighting(pet: LostPet, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/lost-pets', pet.id, 'sighting']);
  }

  openEmergencyContacts(): void {
    // TODO: Open modal with emergency contacts
    console.log('Emergency contacts');
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  trackByPet(index: number, pet: LostPet): string {
    return pet.id;
  }
}
