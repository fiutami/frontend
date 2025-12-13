import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LostPetsService, LostPet } from '../../../core/services/lost-pets.service';

@Component({
  selector: 'app-lost-pets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lost-pets.component.html',
  styleUrls: ['./lost-pets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LostPetsComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly lostPetsService = inject(LostPetsService);

  readonly lostPets = signal<LostPet[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly showSightingModal = signal(false);
  readonly selectedPet = signal<LostPet | null>(null);
  readonly sightingLocation = signal('');
  readonly sightingNotes = signal('');
  readonly isSubmitting = signal(false);


  ngOnInit(): void {
    this.loadLostPets();
  }

  loadLostPets(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.lostPetsService.getLostPets().subscribe({
      next: (pets) => {
        this.lostPets.set(pets);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  formatLastSeen(date: Date): string {
    return this.lostPetsService.formatLastSeen(date);
  }

  getSpeciesIcon(species: LostPet['species']): string {
    return this.lostPetsService.getSpeciesIcon(species);
  }

  getStatusLabel(status: LostPet['status']): string {
    return this.lostPetsService.getStatusLabel(status);
  }

  openSightingModal(pet: LostPet): void {
    this.selectedPet.set(pet);
    this.sightingLocation.set('');
    this.sightingNotes.set('');
    this.showSightingModal.set(true);
  }

  closeSightingModal(): void {
    this.showSightingModal.set(false);
    this.selectedPet.set(null);
  }

  submitSighting(): void {
    const pet = this.selectedPet();
    if (!pet || !this.sightingLocation()) return;

    this.isSubmitting.set(true);

    this.lostPetsService.reportSighting(
      pet.id,
      this.sightingLocation(),
      this.sightingNotes()
    ).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeSightingModal();
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  callOwner(phone: string): void {
    window.location.href = `tel:${phone}`;
  }
}
