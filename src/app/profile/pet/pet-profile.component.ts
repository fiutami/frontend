import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, forkJoin, of, catchError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { PetService } from '../../core/services/pet.service';
import {
  PetProfile,
  PetPhoto,
  PetFriendProfile,
  PetMemory,
  BreedFacts
} from '../../core/models/pet.models';

type ProfileTab = 'gallery' | 'friends' | 'memories' | 'info';

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './pet-profile.component.html',
  styleUrl: './pet-profile.component.scss'
})
export class PetProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // State signals
  pet = signal<PetProfile | null>(null);
  photos = signal<PetPhoto[]>([]);
  friends = signal<PetFriendProfile[]>([]);
  memories = signal<PetMemory[]>([]);
  breedFacts = signal<BreedFacts | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  activeTab = signal<ProfileTab>('gallery');

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
    } else {
      this.error.set('Pet ID not found');
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  setActiveTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

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

  onPhotoClick(photo: PetPhoto): void {
    // TODO: Open lightbox/fullscreen view
    console.log('Photo clicked:', photo);
  }

  onAddPhoto(): void {
    // TODO: Implement photo upload
    console.log('Add photo clicked');
  }

  onAddMemory(): void {
    // TODO: Implement add memory modal/page
    console.log('Add memory clicked');
  }

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
