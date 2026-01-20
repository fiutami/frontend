import { Component, OnInit, OnDestroy, signal, computed, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, forkJoin, of, catchError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { PetService } from '../../core/services/pet.service';
import { SpeciesInfoService } from '../../core/services/species-info.service';
import { PhotoUploadService } from '../../core/services/photo-upload.service';
import { DrawerService } from '../../shared/services/drawer.service';
import { ProfileIconComponent } from '../../shared/components/profile-icons';
import { PhotoUploadModalComponent } from '../../shared/components/photo-upload-modal';
import {
  PetProfile,
  PetPhoto,
  PetFriendProfile,
  PetMemory,
  BreedFacts,
  PetResponse
} from '../../core/models/pet.models';

/** Promo card interface */
interface PromoCard {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
}

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ProfileIconComponent,
    PhotoUploadModalComponent
  ],
  templateUrl: './pet-profile.component.html',
  styleUrl: './pet-profile.component.scss'
})
export class PetProfileComponent implements OnInit, OnDestroy {
  @ViewChild('promoScrollContainer') promoScrollContainer?: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();
  private speciesInfoService = inject(SpeciesInfoService);
  private photoUploadService = inject(PhotoUploadService);
  private drawerService = inject(DrawerService);

  // State signals
  pet = signal<PetProfile | null>(null);
  photos = signal<PetPhoto[]>([]);
  friends = signal<PetFriendProfile[]>([]);
  memories = signal<PetMemory[]>([]);
  breedFacts = signal<BreedFacts | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // User's pets for switching
  userPets = signal<PetResponse[]>([]);

  // Human age conversion
  humanAge = signal<{ humanYears: number; stage: string } | null>(null);

  // Photo upload state
  showUploadModal = signal(false);
  uploadAspectRatio = signal(1);
  isUploading = signal(false);
  uploadProgress = signal(0);
  uploadError = signal<string | null>(null);

  // Promo carousel state
  promoCards = signal<PromoCard[]>([]);
  activePromoIndex = signal(0);

  // Computed values
  hasPhotos = computed(() => this.photos().length > 0);
  hasFriends = computed(() => this.friends().length > 0);
  hasMemories = computed(() => this.memories().length > 0);
  sortedMemories = computed(() =>
    [...this.memories()].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  );
  onlineFriends = computed(() =>
    this.friends().filter(f => f.isOnline)
  );

  petId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petService: PetService
  ) {}

  ngOnInit(): void {
    this.petId = this.route.snapshot.paramMap.get('id');
    if (this.petId) {
      this.loadPetProfile(this.petId);
      this.loadUserPets();
      this.loadPromoCards();
    } else {
      this.error.set('Pet ID not found');
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all user's pets for pet switching dots
   */
  private loadUserPets(): void {
    this.petService.loadPets()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of({ items: [], totalCount: 0 }))
      )
      .subscribe(response => {
        this.userPets.set(response.items || []);
      });
  }

  /**
   * Load promo cards for carousel
   */
  private loadPromoCards(): void {
    // Static promo cards for now - can be replaced with API call
    this.promoCards.set([
      {
        id: '1',
        title: 'FIUTAMI Plus',
        imageUrl: 'assets/images/promo/promo-1.png',
        link: '/premium'
      },
      {
        id: '2',
        title: 'Scopri nuove funzioni',
        imageUrl: 'assets/images/promo/promo-2.png',
        link: '/features'
      },
      {
        id: '3',
        title: 'Invita un amico',
        imageUrl: 'assets/images/promo/promo-3.png',
        link: '/invite'
      }
    ]);
  }

  private loadPetProfile(petId: string): void {
    this.loading.set(true);
    this.error.set(null);

    // Load all profile data in parallel
    forkJoin({
      profile: this.petService.getPetProfile(petId).pipe(
        catchError(() => of(null))
      ),
      photos: this.petService.getPetGallery(petId).pipe(
        catchError(() => of([] as PetPhoto[]))
      ),
      friends: this.petService.getPetFriends(petId).pipe(
        catchError(() => of([] as PetFriendProfile[]))
      ),
      memories: this.petService.getPetMemories(petId).pipe(
        catchError(() => of([] as PetMemory[]))
      )
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        if (data.profile) {
          this.pet.set(data.profile);
          this.photos.set(data.photos);
          this.friends.set(data.friends);
          this.memories.set(data.memories);

          // Load breed facts if breed ID is available
          if (data.profile.breedId) {
            this.loadBreedFacts(data.profile.breedId);
          }

          // Calculate human age if birthDate is available
          if (data.profile.birthDate) {
            this.calculateHumanAge(data.profile);
          }
        } else {
          this.error.set('Pet not found');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load pet profile');
        this.loading.set(false);
        console.error('Error loading pet profile:', err);
      }
    });
  }

  private loadBreedFacts(breedId: string): void {
    this.petService.getBreedFacts(breedId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null))
      )
      .subscribe(facts => {
        this.breedFacts.set(facts);
      });
  }

  /**
   * Calculate human-equivalent age for the pet
   */
  private calculateHumanAge(profile: PetProfile): void {
    if (!profile.birthDate) return;

    // Calculate pet age in months
    const birthDate = new Date(profile.birthDate);
    const now = new Date();
    const diffMs = now.getTime() - birthDate.getTime();
    const petAgeMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));

    // Determine species code from species name
    const speciesLower = profile.species.toLowerCase();
    let speciesCode: string;
    if (speciesLower.includes('gatto') || speciesLower.includes('cat')) {
      speciesCode = 'cat';
    } else if (speciesLower.includes('cane') || speciesLower.includes('dog')) {
      speciesCode = 'dog';
    } else {
      speciesCode = 'other';
    }

    // Determine size category for dogs based on weight
    let sizeCategory: 'small' | 'medium' | 'large' | 'giant' | undefined;
    if (speciesCode === 'dog' && profile.weight) {
      if (profile.weight < 10) {
        sizeCategory = 'small';
      } else if (profile.weight < 25) {
        sizeCategory = 'medium';
      } else if (profile.weight < 45) {
        sizeCategory = 'large';
      } else {
        sizeCategory = 'giant';
      }
    }

    this.speciesInfoService.calculateHumanAge(speciesCode, petAgeMonths, sizeCategory)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.humanAge.set(result);
      });
  }

  // ============================================================
  // Navigation Methods
  // ============================================================

  goBack(): void {
    this.router.navigate(['/home']);
  }

  goToEdit(): void {
    if (this.petId) {
      this.router.navigate(['/profile/pet', this.petId, 'edit']);
    }
  }

  goToBreedDetails(): void {
    const pet = this.pet();
    if (pet?.breedId) {
      this.router.navigate(['/breeds', pet.breedId]);
    }
  }

  goToFriendProfile(friend: PetFriendProfile): void {
    this.router.navigate(['/profile/pet', friend.petId]);
  }

  goToDiscover(): void {
    this.router.navigate(['/discover']);
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  /**
   * Switch to another pet
   */
  switchPet(petId: string): void {
    if (petId !== this.petId) {
      this.router.navigate(['/profile/pet', petId]);
    }
  }

  /**
   * Navigate to add new pet
   */
  onAddPet(): void {
    this.router.navigate(['/onboarding/register-pet']);
  }

  /**
   * Open drawer menu
   */
  openDrawer(): void {
    this.drawerService.open('profile-menu');
  }

  /**
   * Open FIUTO chat/assistant
   */
  openFiutoChat(): void {
    this.router.navigate(['/chat/fiuto']);
  }

  // ============================================================
  // Promo Carousel Methods
  // ============================================================

  onPromoClick(promo: PromoCard): void {
    if (promo.link) {
      this.router.navigateByUrl(promo.link);
    }
  }

  scrollToPromo(index: number): void {
    this.activePromoIndex.set(index);
    const container = this.promoScrollContainer?.nativeElement;
    if (container) {
      const cardWidth = container.scrollWidth / this.promoCards().length;
      container.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      });
    }
  }

  // ============================================================
  // Photo Upload Methods
  // ============================================================

  onPhotoClick(photo: PetPhoto): void {
    console.log('Photo clicked:', photo);
  }

  onAddPhoto(): void {
    this.uploadAspectRatio.set(4 / 3);
    this.showUploadModal.set(true);
  }

  async onPhotoConfirmed(blob: Blob): Promise<void> {
    this.showUploadModal.set(false);

    if (!this.petId) {
      this.uploadError.set('ID pet non trovato');
      return;
    }

    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.uploadError.set(null);

    try {
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

      await this.photoUploadService.uploadGalleryPhoto(
        this.petId,
        file,
        (progress) => this.uploadProgress.set(progress)
      );

      this.loadPhotos();
    } catch (err) {
      console.error('Upload failed:', err);
      this.uploadError.set(err instanceof Error ? err.message : 'Errore durante il caricamento');
    } finally {
      this.isUploading.set(false);
      this.uploadProgress.set(0);
    }
  }

  onUploadCancelled(): void {
    this.showUploadModal.set(false);
  }

  private loadPhotos(): void {
    if (!this.petId) return;

    this.petService.getPetGallery(this.petId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of([] as PetPhoto[]))
      )
      .subscribe(photos => {
        this.photos.set(photos);
      });
  }

  onAddMemory(): void {
    console.log('Add memory clicked');
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  getSexIcon(sex: 'M' | 'F'): string {
    return sex === 'M' ? '\u2642' : '\u2640';
  }

  getSexLabel(sex: 'M' | 'F'): string {
    return sex === 'M' ? 'Maschio' : 'Femmina';
  }

  formatWeight(weight: number | null): string {
    if (weight === null) return '-';
    return `${weight} kg`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatRelativeTime(dateString: string | null): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}g fa`;
    return this.formatDate(dateString);
  }

  getMemoryIcon(type: string): string {
    const icons: Record<string, string> = {
      milestone: '\uD83C\uDFC6',
      adventure: '\uD83C\uDF0D',
      health: '\uD83D\uDC8A',
      birthday: '\uD83C\uDF82',
      adoption: '\u2764\uFE0F',
      achievement: '\u2B50',
      other: '\uD83D\uDCDD'
    };
    return icons[type] || '\uD83D\uDCDD';
  }

  getCareLabel(level: string): string {
    const labels: Record<string, string> = {
      low: 'Basso',
      medium: 'Medio',
      high: 'Alto'
    };
    return labels[level] || level;
  }
}
