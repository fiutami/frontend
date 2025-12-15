import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { AdoptService, AdoptionAd, PetType } from '../../../core/services/adopt.service';
import { BottomTabBarComponent } from '../../../shared/components/bottom-tab-bar/bottom-tab-bar.component';
import { TabItem } from '../../../shared/components/bottom-tab-bar/bottom-tab-bar.models';

@Component({
  selector: 'app-adopt',
  standalone: true,
  imports: [CommonModule, BottomTabBarComponent],
  templateUrl: './adopt.component.html',
  styleUrls: ['./adopt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdoptComponent implements OnInit {
  private location = inject(Location);
  private router = inject(Router);
  private adoptService = inject(AdoptService);

  adoptionAds = signal<AdoptionAd[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  tabs: TabItem[] = [
    { id: 'home', icon: 'home', iconSrc: 'assets/icons/nav/home.svg', activeIconSrc: 'assets/icons/nav/home-active.svg', route: '/home/main', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', iconSrc: 'assets/icons/nav/calendar.svg', activeIconSrc: 'assets/icons/nav/calendar-active.svg', route: '/home/calendar', label: 'Calendario' },
    { id: 'location', icon: 'place', iconSrc: 'assets/icons/nav/map.svg', activeIconSrc: 'assets/icons/nav/map-active.svg', route: '/home/map', label: 'Mappa' },
    { id: 'species', icon: 'pets', iconSrc: 'assets/icons/nav/species.svg', activeIconSrc: 'assets/icons/nav/species-active.svg', route: '/home/species', label: 'Specie' },
    { id: 'profile', icon: 'person', iconSrc: 'assets/icons/nav/profile.svg', activeIconSrc: 'assets/icons/nav/profile-active.svg', route: '/user/profile', label: 'Profilo' }
  ];

  ngOnInit(): void {
    this.loadAdoptionAds();
  }

  goBack(): void {
    this.location.back();
  }

  loadAdoptionAds(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.adoptService.getAdoptionAds().subscribe({
      next: (ads) => {
        this.adoptionAds.set(ads);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  retry(): void {
    this.loadAdoptionAds();
  }

  getPetTypeIcon(type: PetType): string {
    return this.adoptService.getPetTypeIcon(type);
  }

  formatRelativeTime(date: Date): string {
    return this.adoptService.formatRelativeTime(date);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'available': return 'status--available';
      case 'pending': return 'status--pending';
      case 'adopted': return 'status--adopted';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available': return 'Disponibile';
      case 'pending': return 'In attesa';
      case 'adopted': return 'Adottato';
      default: return status;
    }
  }

  contactOwner(ad: AdoptionAd): void {
    // Open chat - using ad ID as reference since ownerId not available
    this.router.navigate(['/home/chat'], {
      queryParams: {
        adId: ad.id,
        subject: `Interessato a ${ad.petName}`
      }
    });
  }

  viewDetails(ad: AdoptionAd): void {
    // Navigate to adoption ad detail page
    this.router.navigate(['/home/adopt', ad.id]);
  }
}
