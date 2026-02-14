import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  PetInfoCardComponent,
  PetInfoItem,
} from '../../shared/components/pet-info-card';
import { SpeechBubbleComponent } from '../../shared/components/speech-bubble';
import { MascotBottomSheetComponent } from '../../shared/components/mascot-bottom-sheet';
import { TabPageShellPetProfileComponent } from '../../shared/components/tab-page-shell-pet-profile';
import { ProfileIconComponent } from '../../shared/components/profile-icons';
import { PetService } from '../../core/services/pet.service';
import { SpeciesInfoService } from '../../core/services/species-info.service';
import { PetResponse } from '../../core/models/pet.models';

export interface PetData {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  sex: string;
  age: number;
  weight: number;
  breed: string;
  speciesCode?: string;
  calculatedAge?: string;
}

export interface FriendPet {
  id: string;
  name: string;
  avatarUrl: string;
  online: boolean;
}

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TabPageShellPetProfileComponent,
    PetInfoCardComponent,
    SpeechBubbleComponent,
    MascotBottomSheetComponent,
    ProfileIconComponent,
  ],
  templateUrl: './pet-profile.component.html',
  styleUrls: ['./pet-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private petService = inject(PetService);
  private speciesInfoService = inject(SpeciesInfoService);
  private cdr = inject(ChangeDetectorRef);

  // Mascot sheet state
  showMascotSheet = signal(false);

  // Loading and error state
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Pet data - loaded from API
  pet: PetData = {
    id: '',
    name: '',
    description: '',
    photoUrl: 'assets/images/default-pet-avatar.png',
    sex: '',
    age: 0,
    weight: 0,
    breed: '',
    speciesCode: '',
    calculatedAge: '',
  };

  // Human age computed via SpeciesInfoService
  humanAge: number | null = null;
  petRealAge = '';

  // Info card data for PetInfoCardComponent
  petInfoItems: PetInfoItem[] = [];


  // Online friends
  onlineFriends: FriendPet[] = [
    { id: '1', name: 'Luna', avatarUrl: 'assets/images/default-pet-avatar.png', online: true },
    { id: '2', name: 'Max', avatarUrl: 'assets/images/default-pet-avatar.png', online: true },
    { id: '3', name: 'Bella', avatarUrl: 'assets/images/default-pet-avatar.png', online: false },
  ];

  // Promo slides
  promoSlides = [
    { id: 1, title: 'Tinder Pet', description: 'Match tra animali' },
    { id: 2, title: 'Track Emotion', description: 'Traccia l\'umore del pet' },
    { id: 3, title: 'Mappa Avanzata', description: 'Funzioni speciali' },
  ];
  currentSlide = 0;

  ngOnInit(): void {
    // Get pet ID from route first, then fall back to sessionStorage
    let petId = this.route.snapshot.paramMap.get('id');

    if (!petId) {
      // Try to get from sessionStorage (set during onboarding)
      petId = sessionStorage.getItem('createdPetId');
    }

    if (petId) {
      this.loadPetData(petId);
    } else {
      // No pet ID available, try to load user's first pet
      this.loadFirstPet();
    }
  }

  goBack(): void {
    window.history.back();
  }

  // === Quick Action icon navigation ===
  onCalendarClick(): void {
    this.router.navigate(['/home/calendar']);
  }

  onNotificationsClick(): void {
    this.router.navigate(['/home/notifications']);
  }

  onEditPetClick(): void {
    if (this.pet.id) {
      this.router.navigate(['/profile/pet', this.pet.id]);
    }
  }

  onMessagesClick(): void {
    this.router.navigate(['/home/chat']);
  }

  onSavedClick(): void {
    this.router.navigate(['/home/favorites']);
  }

  // === CTA button actions ===
  onBandaPelosaClick(): void {
    if (this.pet.id) {
      this.router.navigate(['/home/pet-profile', this.pet.id, 'gallery']);
    }
  }

  onFattiBestialiClick(): void {
    if (this.pet.id) {
      this.router.navigate(['/home/pet-profile', this.pet.id, 'fatti-bestiali']);
    }
  }

  onRullinoFeroceClick(): void {
    if (this.pet.id) {
      this.router.navigate(['/home/pet-profile', this.pet.id, 'friends']);
    }
  }

  onAppCompletaClick(): void {
    alert('Funzionalità Premium - Coming Soon!');
  }

  // Map actions
  onFiutaClick(): void {
    this.router.navigate(['/home/map']);
  }

  // Promo slider
  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  // Add new pet
  onAddPetClick(): void {
    this.router.navigate(['/home/pet-register']);
  }

  // Friend click
  onFriendClick(friend: FriendPet): void {
    if (friend.id) {
      this.router.navigate(['/home/pet-profile', friend.id]);
    }
  }

  /**
   * Load pet data from API by ID
   */
  private loadPetData(petId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.petService.getPet(petId).subscribe({
      next: (response: PetResponse) => {
        this.mapResponseToPetData(response);
        this.loadHumanAge(response);
        this.updatePetInfoItems();
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

  /**
   * Load the user's first pet if no specific ID is provided
   */
  private loadFirstPet(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.petService.loadPets().subscribe({
      next: (response) => {
        if (response.pets && response.pets.length > 0) {
          // Load the first pet's full details
          this.loadPetData(response.pets[0].id);
        } else {
          this.errorMessage.set('Nessun pet trovato. Registra il tuo primo pet!');
          this.isLoading.set(false);
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Failed to load pets:', err);
        this.errorMessage.set('Impossibile caricare i dati');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Map API response to local PetData interface
   */
  private mapResponseToPetData(response: PetResponse): void {
    this.pet = {
      id: response.id,
      name: response.name,
      description: response.notes || 'Nessuna descrizione disponibile',
      photoUrl: response.profilePhotoUrl || 'assets/images/default-pet-avatar.png',
      sex: response.sex === 'male' ? 'Maschio' : 'Femmina',
      age: this.calculateAgeFromString(response.calculatedAge),
      weight: response.weight || 0,
      breed: response.speciesName,
      speciesCode: response.speciesCategory?.toLowerCase() || '',
      calculatedAge: response.calculatedAge || '',
    };
    this.petRealAge = response.calculatedAge || '';
  }

  /**
   * Load human-equivalent age via SpeciesInfoService
   */
  private loadHumanAge(response: PetResponse): void {
    const speciesCode = response.speciesCategory?.toLowerCase() || '';
    const ageMonths = this.pet.age * 12; // approximate

    this.speciesInfoService.calculateHumanAge(speciesCode, ageMonths).subscribe({
      next: (result) => {
        this.humanAge = result.humanYears;
        this.updatePetInfoItems();
        this.cdr.markForCheck();
      },
      error: () => {
        this.humanAge = null;
      },
    });
  }

  /**
   * Calculate numeric age from string like "3 anni" or "6 mesi"
   */
  private calculateAgeFromString(ageString: string): number {
    if (!ageString) return 0;
    const match = ageString.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Update the pet info items for the PetInfoCardComponent (5 items)
   */
  private updatePetInfoItems(): void {
    this.petInfoItems = [
      { label: 'Sex', value: this.pet.sex },
      { label: 'Anni', value: `${this.pet.age}` },
      { label: 'Anni Umani', value: this.humanAge != null ? `${this.humanAge}` : 'N/D' },
      { label: 'Peso', value: this.pet.weight > 0 ? `${this.pet.weight} kg` : 'N/D' },
      { label: 'Razza', value: this.pet.breed },
    ];
  }

  // Mascot methods
  closeMascotSheet(): void {
    this.showMascotSheet.set(false);
  }
}
