import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  BottomTabBarComponent,
  TabItem,
} from '../../shared/components/bottom-tab-bar';
import { AvatarButtonComponent } from '../../shared/components/avatar-button';

interface PetFriendlyPlace {
  id: string;
  name: string;
  type: 'park' | 'beach' | 'vet' | 'shop';
  distance: string;
  rating: number;
  icon: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterModule, BottomTabBarComponent, AvatarButtonComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent {
  // Active filter
  activeFilter: string = 'all';

  // Filter options
  filters = [
    { id: 'all', label: 'Tutti', icon: 'apps' },
    { id: 'park', label: 'Parchi', icon: 'park' },
    { id: 'beach', label: 'Spiagge', icon: 'beach_access' },
    { id: 'vet', label: 'Veterinari', icon: 'medical_services' },
    { id: 'shop', label: 'Negozi', icon: 'store' },
  ];

  // Mock data - pet-friendly places
  places: PetFriendlyPlace[] = [
    {
      id: '1',
      name: 'Parco Sempione',
      type: 'park',
      distance: '1.2 km',
      rating: 4.5,
      icon: 'park',
    },
    {
      id: '2',
      name: 'Dog Beach Lido',
      type: 'beach',
      distance: '5.3 km',
      rating: 4.8,
      icon: 'beach_access',
    },
    {
      id: '3',
      name: 'Vet Clinic Milano',
      type: 'vet',
      distance: '800 m',
      rating: 4.2,
      icon: 'medical_services',
    },
    {
      id: '4',
      name: 'Pet Store Central',
      type: 'shop',
      distance: '1.5 km',
      rating: 4.6,
      icon: 'store',
    },
    {
      id: '5',
      name: 'Giardini Pubblici',
      type: 'park',
      distance: '2.1 km',
      rating: 4.3,
      icon: 'park',
    },
    {
      id: '6',
      name: 'Spiaggia Bau Bau',
      type: 'beach',
      distance: '7.8 km',
      rating: 4.9,
      icon: 'beach_access',
    },
  ];

  // Bottom tab bar configuration
  tabs: TabItem[] = [
    { id: 'home', icon: 'home', route: '/home/main', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', route: '/calendar', label: 'Calendario' },
    { id: 'location', icon: 'place', route: '/home/map', label: 'Mappa' },
    { id: 'pet', icon: 'pets', route: '/home/pet-profile', label: 'Pet' },
    { id: 'profile', icon: 'person', route: '/user/profile', label: 'Profilo' },
  ];

  /**
   * Get filtered places based on active filter
   */
  get filteredPlaces(): PetFriendlyPlace[] {
    if (this.activeFilter === 'all') {
      return this.places;
    }
    return this.places.filter((place) => place.type === this.activeFilter);
  }

  /**
   * Set active filter
   */
  setFilter(filterId: string): void {
    this.activeFilter = filterId;
  }

  /**
   * Generate star rating array for template
   */
  getStarArray(rating: number): { full: boolean }[] {
    const stars: { full: boolean }[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push({ full: i <= Math.floor(rating) });
    }
    return stars;
  }

  /**
   * Navigate to place details (placeholder)
   */
  goToPlace(place: PetFriendlyPlace): void {
    console.log('Navigate to place:', place);
    // TODO: Implement navigation to place details
  }
}
