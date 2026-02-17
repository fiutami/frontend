import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
  signal,
  ChangeDetectorRef,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import {
  PetInfoCardComponent,
  PetInfoItem,
} from '../../shared/components/pet-info-card';
import { SpeechBubbleComponent } from '../../shared/components/speech-bubble';
import { MascotBottomSheetComponent } from '../../shared/components/mascot-bottom-sheet';
import { TabPageShellPetProfileComponent } from '../../shared/components/tab-page-shell-pet-profile';
import { ProfileIconComponent } from '../../shared/components/profile-icons';
import { PhotoUploadModalComponent } from '../../shared/components/photo-upload-modal/photo-upload-modal.component';
import { PetService } from '../../core/services/pet.service';
import { PhotoUploadService } from '../../core/services/photo-upload.service';
import { SpeciesInfoService } from '../../core/services/species-info.service';
import { PetResponse, PetSummaryResponse } from '../../core/models/pet.models';

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

export interface PartnerShowcase {
  id: string;
  name: string;
  type: 'shop' | 'vet' | 'groomer' | 'shelter' | 'clinic' | 'hotel';
  location: string;
  logo?: string;
  tier: 'free' | 'base' | 'premium';
  rating?: number;
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
    PhotoUploadModalComponent,
  ],
  templateUrl: './pet-profile.component.html',
  styleUrls: ['./pet-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private petService = inject(PetService);
  private photoUploadService = inject(PhotoUploadService);
  private speciesInfoService = inject(SpeciesInfoService);
  private cdr = inject(ChangeDetectorRef);

  // Mascot sheet state
  showMascotSheet = signal(false);

  // Photo upload state
  showPhotoUpload = signal(false);
  isUploadingPhoto = signal(false);
  uploadProgress = signal(0);

  // Photo edit menu state
  showPhotoMenu = signal(false);

  // Loading and error state
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // All pets list + current index for swipe/dots
  allPets = signal<PetSummaryResponse[]>([]);
  currentPetIndex = signal(0);

  // Max pets allowed
  readonly MAX_PETS = 2;

  // Mini map preview
  @ViewChild('miniMapEl') miniMapEl!: ElementRef<HTMLDivElement>;
  private miniMap: L.Map | null = null;

  // Swipe tracking
  private swipeStartX = 0;
  private swipeStartY = 0;
  private isSwiping = false;

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


  // Partner showcase (same data as map page)
  readonly partnerShowcase = signal<PartnerShowcase[]>([
    { id: '1', name: 'Pet Paradise', type: 'shop', location: 'Milano', tier: 'premium', rating: 4.8 },
    { id: '2', name: 'Clinica Zampe Felici', type: 'clinic', location: 'Bergamo', tier: 'premium', rating: 4.9 },
    { id: '3', name: 'Amici a 4 Zampe', type: 'shelter', location: 'Brescia', tier: 'free' },
    { id: '4', name: 'Toelettatura Bella', type: 'groomer', location: 'Como', tier: 'base', rating: 4.5 },
    { id: '5', name: 'Hotel Pets & Relax', type: 'hotel', location: 'Lecco', tier: 'base', rating: 4.3 },
  ]);

  readonly partnerIcons: Record<string, string> = {
    shop: '🏪', vet: '🏥', groomer: '✂️', shelter: '🐕', clinic: '💊', hotel: '🏨',
  };

  readonly partnerColors: Record<string, string> = {
    shop: '#F4AE1A', vet: '#FF6B6B', groomer: '#4ECDC4', shelter: '#95E1A3', clinic: '#A78BFA', hotel: '#60A5FA',
  };

  // Promo slides
  promoSlides = [
    { id: 1, title: 'Tinder Pet', description: 'Match tra animali' },
    { id: 2, title: 'Track Emotion', description: 'Traccia l\'umore del pet' },
    { id: 3, title: 'Mappa Avanzata', description: 'Funzioni speciali' },
  ];
  currentSlide = 0;

  ngOnInit(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Get target pet ID from route or sessionStorage
    let targetPetId = this.route.snapshot.paramMap.get('id');
    if (!targetPetId) {
      targetPetId = sessionStorage.getItem('createdPetId');
    }

    // Load all pets first, then resolve the current one
    this.petService.loadPets().subscribe({
      next: (response) => {
        if (!response.pets || response.pets.length === 0) {
          this.errorMessage.set('Nessun pet trovato. Registra il tuo primo pet!');
          this.isLoading.set(false);
          this.cdr.markForCheck();
          return;
        }

        this.allPets.set(response.pets);

        // Find the index of the target pet, default to 0
        let index = 0;
        if (targetPetId) {
          const found = response.pets.findIndex(p => p.id === targetPetId);
          if (found >= 0) index = found;
        }
        this.currentPetIndex.set(index);

        // Load full details for this pet
        this.loadPetData(response.pets[index].id);
      },
      error: (err) => {
        console.error('Failed to load pets:', err);
        this.errorMessage.set('Impossibile caricare i dati');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  ngAfterViewInit(): void {
    // Init map after view is ready — delayed to let the container render
    setTimeout(() => this.initMiniMap(), 300);
  }

  ngOnDestroy(): void {
    if (this.miniMap) {
      this.miniMap.remove();
      this.miniMap = null;
    }
  }

  goBack(): void {
    window.history.back();
  }

  // === Quick Action icon navigation ===
  onCalendarClick(): void {
    this.router.navigate(['/calendar/month']);
  }

  onNotificationsClick(): void {
    this.router.navigate(['/home/notifications']);
  }

  onEditPetClick(): void {
    this.router.navigate(['/home/pet-profile/edit']);
  }

  onMessagesClick(): void {
    this.router.navigate(['/home/pet-profile/chat/list']);
  }

  onSavedClick(): void {
    this.router.navigate(['/home/favorites']);
  }

  // === CTA button actions ===
  onBandaPelosaClick(): void {
    if (this.pet.id) {
      this.router.navigate(['/home/pet-profile', this.pet.id, 'friends']);
    }
  }

  onFattiBestialiClick(): void {
    if (this.pet.id) {
      this.router.navigate(['/home/pet-profile', this.pet.id, 'fatti-bestiali']);
    }
  }

  onRullinoFeroceClick(): void {
    if (this.pet.id) {
      this.router.navigate(['/home/pet-profile', this.pet.id, 'gallery']);
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

  // Add new pet (max 2)
  onAddPetClick(): void {
    if (this.allPets().length >= this.MAX_PETS) {
      return; // Button hidden via template, but guard here too
    }
    this.router.navigate(['/home/pet-register']);
  }

  canAddPet(): boolean {
    return this.allPets().length < this.MAX_PETS;
  }

  // === Pet swipe / dot navigation ===
  goToPet(index: number): void {
    const pets = this.allPets();
    if (index < 0 || index >= pets.length || index === this.currentPetIndex()) return;
    this.currentPetIndex.set(index);
    this.loadPetData(pets[index].id);
  }

  nextPet(): void {
    this.goToPet(this.currentPetIndex() + 1);
  }

  prevPet(): void {
    this.goToPet(this.currentPetIndex() - 1);
  }

  onSwipeStart(e: PointerEvent): void {
    this.swipeStartX = e.clientX;
    this.swipeStartY = e.clientY;
    this.isSwiping = true;
  }

  onSwipeEnd(e: PointerEvent): void {
    if (!this.isSwiping) return;
    this.isSwiping = false;

    const deltaX = e.clientX - this.swipeStartX;
    const deltaY = e.clientY - this.swipeStartY;

    // Only trigger if horizontal movement > 50px and greater than vertical
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        this.nextPet();   // swipe left → next
      } else {
        this.prevPet();   // swipe right → prev
      }
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
   * Map API response to local PetData interface
   */
  private mapResponseToPetData(response: PetResponse): void {
    // Build breed display string
    let breedDisplay: string;
    if (response.breedName) {
      breedDisplay = response.breedVariantLabel
        ? `${response.breedName} - ${response.breedVariantLabel}`
        : response.breedName;
    } else {
      breedDisplay = response.speciesName;
    }

    this.pet = {
      id: response.id,
      name: response.name,
      description: response.notes || 'Nessuna descrizione disponibile',
      photoUrl: response.profilePhotoUrl || 'assets/images/default-pet-avatar.png',
      sex: response.sex === 'male' ? 'Maschio' : 'Femmina',
      age: this.calculateAgeFromString(response.calculatedAge),
      weight: response.weight || 0,
      breed: breedDisplay,
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

  // === Photo upload / edit menu ===
  @HostListener('document:click')
  onDocumentClick(): void {
    this.showPhotoMenu.set(false);
  }

  onEditPhotoClick(): void {
    this.showPhotoMenu.update(v => !v);
  }

  onChangePhoto(): void {
    this.showPhotoMenu.set(false);
    this.showPhotoUpload.set(true);
  }

  deleteProfilePhoto(): void {
    this.showPhotoMenu.set(false);
    if (!this.pet.id) return;

    // Find current profile photo and delete it
    this.petService.getPetGallery(this.pet.id).subscribe(photos => {
      const primary = photos.find(p => p.isProfilePhoto);
      if (primary) {
        this.petService.deletePhoto(this.pet.id, primary.id).subscribe({
          next: () => {
            this.pet.photoUrl = 'assets/images/default-pet-avatar.png';
            this.cdr.markForCheck();
          },
        });
      }
    });
  }

  onPhotoCancelled(): void {
    this.showPhotoUpload.set(false);
  }

  async onPhotoConfirmed(blob: Blob): Promise<void> {
    this.showPhotoUpload.set(false);

    if (!this.pet.id) return;

    this.isUploadingPhoto.set(true);
    this.uploadProgress.set(0);

    const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });

    try {
      await this.photoUploadService.uploadProfilePhoto(
        this.pet.id,
        file,
        (p) => this.uploadProgress.set(p)
      );
      // Reload pet data to get the new photo URL
      this.loadPetData(this.pet.id);
    } catch (err) {
      console.error('Profile photo upload failed:', err);
      this.errorMessage.set('Impossibile caricare la foto. Riprova.');
    } finally {
      this.isUploadingPhoto.set(false);
      this.uploadProgress.set(0);
      this.cdr.markForCheck();
    }
  }

  // Mascot methods
  closeMascotSheet(): void {
    this.showMascotSheet.set(false);
  }

  // === Mini map preview (read-only Leaflet) ===
  private initMiniMap(): void {
    if (!this.miniMapEl?.nativeElement || this.miniMap) return;

    this.miniMap = L.map(this.miniMapEl.nativeElement, {
      center: [45.6983, 9.6773],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.miniMap);
  }
}
