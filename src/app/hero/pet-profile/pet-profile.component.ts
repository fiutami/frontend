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
import { DrawerService } from '../../shared/components/drawer';
import {
  BottomTabBarComponent,
  TabItem,
} from '../../shared/components/bottom-tab-bar';
import {
  PetInfoCardComponent,
  PetInfoItem,
} from '../../shared/components/pet-info-card';
import { SpeechBubbleComponent } from '../../shared/components/speech-bubble';
import { PetService } from '../../core/services/pet.service';
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
    BottomTabBarComponent,
    PetInfoCardComponent,
    SpeechBubbleComponent,
  ],
  templateUrl: './pet-profile.component.html',
  styleUrls: ['./pet-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetProfileComponent implements OnInit {
  private drawerService = inject(DrawerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private petService = inject(PetService);
  private cdr = inject(ChangeDetectorRef);

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
  };

  // Info card data for PetInfoCardComponent
  petInfoItems: PetInfoItem[] = [];

  // Bottom tab bar configuration
  tabs: TabItem[] = [
    { id: 'home', icon: 'home', iconSrc: 'assets/icons/nav/home.svg', activeIconSrc: 'assets/icons/nav/home-active.svg', route: '/home/main', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', iconSrc: 'assets/icons/nav/calendar.svg', activeIconSrc: 'assets/icons/nav/calendar-active.svg', route: '/home/calendar', label: 'Calendario' },
    { id: 'location', icon: 'place', iconSrc: 'assets/icons/nav/map.svg', activeIconSrc: 'assets/icons/nav/map-active.svg', route: '/home/map', label: 'Mappa' },
    { id: 'species', icon: 'pets', iconSrc: 'assets/icons/nav/species.svg', activeIconSrc: 'assets/icons/nav/species-active.svg', route: '/home/species', label: 'Specie' },
    { id: 'profile', icon: 'person', iconSrc: 'assets/icons/nav/profile.svg', activeIconSrc: 'assets/icons/nav/profile-active.svg', route: '/user/profile', label: 'Profilo' },
  ];

  notificationCount = 2;

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

  openDrawer(): void {
    this.drawerService.open();
  }

  goBack(): void {
    window.history.back();
  }

  navigateToEdit(): void {
    if (this.pet.id) {
      this.router.navigate(['/home/pet-register/edit', this.pet.id]);
    }
  }

  navigateToCalendar(): void {
    this.router.navigate(['/home/calendar']);
  }

  navigateToChat(): void {
    this.router.navigate(['/home/chat']);
  }

  navigateToSaved(): void {
    this.router.navigate(['/home/favorites']);
  }

  // Yellow button actions
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
    // Premium features - Coming Soon
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
    };
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
   * Update the pet info items for the PetInfoCardComponent
   */
  private updatePetInfoItems(): void {
    this.petInfoItems = [
      { label: 'Sex', value: this.pet.sex },
      { label: 'Anni', value: `${this.pet.age}` },
      { label: 'Peso', value: this.pet.weight > 0 ? `${this.pet.weight} kg` : 'N/D' },
      { label: 'Razza', value: this.pet.breed },
    ];
  }
}
