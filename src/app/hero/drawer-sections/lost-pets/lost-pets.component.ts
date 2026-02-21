import { Component, OnInit, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LostPetsService, LostPet } from '../../../core/services/lost-pets.service';

// Shell Drawer (sfondo blu solido, solo header + back, niente avatar/logo/mascot/tab bar)
import { TabPageShellDrawerComponent } from '../../../shared/components/tab-page-shell-drawer';

/** Organization/shelter contact info */
interface Organization {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  icon: string;
}

@Component({
  selector: 'app-lost-pets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TabPageShellDrawerComponent,
  ],
  templateUrl: './lost-pets.component.html',
  styleUrls: ['./lost-pets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LostPetsComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly lostPetsService = inject(LostPetsService);
  private readonly translate = inject(TranslateService);

  /** Translated page title */
  protected pageTitle = this.translate.instant('drawerLostPets.title');

  // Data signals
  readonly lostPets = signal<LostPet[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  // Search
  readonly searchQuery = signal('');

  // Filter: 'all' or 'zone'
  readonly activeFilter = signal<'all' | 'zone'>('all');
  readonly showFilterDropdown = signal(false);

  // Overlays
  readonly showOrgOverlay = signal(false);
  readonly showCreateAdOverlay = signal(false);
  readonly showSightingModal = signal(false);

  // Sighting modal state
  readonly selectedPet = signal<LostPet | null>(null);
  readonly sightingLocation = signal('');
  readonly sightingNotes = signal('');
  readonly isSubmitting = signal(false);

  // Create ad form state
  readonly adPetName = signal('');
  readonly adBreed = signal('');
  readonly adLocation = signal('');
  readonly adDescription = signal('');
  readonly adContactPhone = signal('');
  readonly adType = signal<'lost' | 'found'>('lost');
  readonly isCreatingAd = signal(false);

  // Mock organizations
  readonly organizations: Organization[] = [
    { id: 'org_1', name: 'ENPA', phone: '+39 06 3220183', email: 'info@enpa.it', location: 'Roma', icon: 'pets' },
    { id: 'org_2', name: 'LAV', phone: '+39 06 4461325', email: 'info@lav.it', location: 'Roma', icon: 'volunteer_activism' },
    { id: 'org_3', name: 'OIPA', phone: '+39 06 3220183', email: 'info@oipa.org', location: 'Milano', icon: 'local_hospital' },
    { id: 'org_4', name: 'Lega del Cane', phone: '+39 02 97064036', email: 'info@legadelcane.it', location: 'Milano', icon: 'home' },
    { id: 'org_5', name: 'LIPU', phone: '+39 0521 273043', email: 'info@lipu.it', location: 'Parma', icon: 'flutter_dash' },
  ];

  // Filtered pets (search + zone filter)
  readonly filteredPets = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.activeFilter();
    let list = this.lostPets();

    // Search filter
    if (query) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.breed && p.breed.toLowerCase().includes(query)) ||
        p.lastSeenLocation.toLowerCase().includes(query)
      );
    }

    // Zone filter (mock: show only first 2 pets as "nearby")
    if (filter === 'zone') {
      list = list.slice(0, 2);
    }

    return list;
  });

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.pageTitle = this.translate.instant('drawerLostPets.title');
    });
  }

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

  // --- Overlays ---

  openOrgOverlay(): void {
    this.showOrgOverlay.set(true);
  }

  closeOrgOverlay(): void {
    this.showOrgOverlay.set(false);
  }

  openCreateAdOverlay(): void {
    this.adPetName.set('');
    this.adBreed.set('');
    this.adLocation.set('');
    this.adDescription.set('');
    this.adContactPhone.set('');
    this.adType.set('lost');
    this.showCreateAdOverlay.set(true);
  }

  closeCreateAdOverlay(): void {
    this.showCreateAdOverlay.set(false);
  }

  submitAd(): void {
    if (!this.adPetName() || !this.adLocation()) return;

    this.isCreatingAd.set(true);

    // Simulate API call
    setTimeout(() => {
      const newPet: LostPet = {
        id: `lost_new_${Date.now()}`,
        name: this.adPetName(),
        species: 'dog',
        breed: this.adBreed() || undefined,
        color: '',
        size: 'medium',
        imageUrl: 'assets/images/pets/placeholder-dog.png',
        lastSeenDate: new Date(),
        lastSeenLocation: this.adLocation(),
        description: this.adDescription(),
        ownerName: 'Tu',
        ownerPhone: this.adContactPhone(),
        status: this.adType() === 'lost' ? 'lost' : 'found',
        createdAt: new Date()
      };

      this.lostPets.update(pets => [newPet, ...pets]);
      this.isCreatingAd.set(false);
      this.closeCreateAdOverlay();
    }, 1000);
  }

  // --- Sighting modal ---

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

  // --- Filter ---

  toggleFilterDropdown(): void {
    this.showFilterDropdown.update(v => !v);
  }

  setFilter(filter: 'all' | 'zone'): void {
    this.activeFilter.set(filter);
    this.showFilterDropdown.set(false);
  }

  // --- Helpers ---

  formatLastSeen(date: Date): string {
    return this.lostPetsService.formatLastSeen(date);
  }

  getSpeciesIcon(species: LostPet['species']): string {
    return this.lostPetsService.getSpeciesIcon(species);
  }

  getStatusLabel(status: LostPet['status']): string {
    return this.lostPetsService.getStatusLabel(status);
  }

  callOwner(phone: string): void {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  }

  callOrg(phone: string): void {
    window.location.href = `tel:${phone}`;
  }

  emailOrg(email: string): void {
    window.location.href = `mailto:${email}`;
  }
}
