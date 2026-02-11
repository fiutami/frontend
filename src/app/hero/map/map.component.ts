import {
  Component,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal,
  computed,
  ViewChild
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';
import { POI, POIFilter, POIType } from '../../core/models/poi.models';

/**
 * Partner showcase interface
 * Per vetrina dinamica con inserzionisti free/paid
 */
export interface PartnerShowcase {
  id: string;
  name: string;
  type: 'shop' | 'vet' | 'groomer' | 'shelter' | 'clinic' | 'hotel';
  location: string;
  logo?: string;
  tier: 'free' | 'base' | 'premium';
  rating?: number;
}
import { POIService } from '../../map/services/poi.service';
import { TabPageShellDefaultComponent } from '../../shared/components/tab-page-shell-default/tab-page-shell-default.component';
import { MascotBottomSheetComponent } from '../../shared/components/mascot-bottom-sheet';
import { SharedModule } from '../../shared/shared.module';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/icons/marker-icon-2x.png',
  iconUrl: 'assets/icons/marker-icon.png',
  shadowUrl: 'assets/icons/marker-shadow.png',
});

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SharedModule,
    TabPageShellDefaultComponent,
    MascotBottomSheetComponent
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private readonly poiService = inject(POIService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private userMarker?: L.Marker;

  // Mascot sheet state
  showMascotSheet = signal(false);

  // Signals
  readonly userLocation = signal<[number, number]>([45.6983, 9.6773]); // Bergamo default
  readonly pois = signal<POI[]>([]);
  readonly selectedPOI = signal<POI | null>(null);
  readonly filters = signal<POIFilter[]>(this.poiService.getDefaultFilters());
  readonly searchQuery = signal<string>('');
  readonly isLocationEnabled = signal<boolean>(false);
  readonly currentLocationName = signal<string>('Bergamo');

  readonly activeFilters = computed(() =>
    this.filters().filter(f => f.active).map(f => f.type)
  );

  readonly filteredPOIs = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const active = this.activeFilters();
    return this.pois().filter(poi =>
      active.includes(poi.type) &&
      (query === '' || poi.name.toLowerCase().includes(query))
    );
  });


  // Colors for POI markers (public for template access)
  readonly markerColors: Record<POIType, string> = {
    vet: '#FF6B6B',
    groomer: '#4ECDC4',
    park: '#95E1A3',
    shop: '#F4AE1A',
    restaurant: '#A78BFA',
    hotel: '#60A5FA',
    beach: '#60A5FA'
  };

  // Partner showcase mock data (future: from backend API)
  readonly partnerShowcase = signal<PartnerShowcase[]>([
    {
      id: '1',
      name: 'Pet Paradise',
      type: 'shop',
      location: 'Milano',
      tier: 'premium',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Clinica Zampe Felici',
      type: 'clinic',
      location: 'Bergamo',
      tier: 'premium',
      rating: 4.9
    },
    {
      id: '3',
      name: 'Amici a 4 Zampe',
      type: 'shelter',
      location: 'Brescia',
      tier: 'free'
    },
    {
      id: '4',
      name: 'Toelettatura Bella',
      type: 'groomer',
      location: 'Como',
      tier: 'base',
      rating: 4.5
    },
    {
      id: '5',
      name: 'Hotel Pets & Relax',
      type: 'hotel',
      location: 'Lecco',
      tier: 'base',
      rating: 4.3
    }
  ]);

  // Partner type icons
  readonly partnerIcons: Record<string, string> = {
    shop: '🏪',
    vet: '🏥',
    groomer: '✂️',
    shelter: '🐕',
    clinic: '💊',
    hotel: '🏨'
  };

  // Partner type colors
  readonly partnerColors: Record<string, string> = {
    shop: '#F4AE1A',
    vet: '#FF6B6B',
    groomer: '#4ECDC4',
    shelter: '#95E1A3',
    clinic: '#A78BFA',
    hotel: '#60A5FA'
  };

  ngAfterViewInit(): void {
    this.initMap();
    this.loadPOIs();
    this.getUserLocation();
    // Fix mappa "grigia" dopo cambio tab
    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: this.userLocation(),
      zoom: 13,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Add zoom control to bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private getUserLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          this.userLocation.set(location);
          this.isLocationEnabled.set(true);
          this.map.setView(location, 14);
          this.addUserMarker(location);
          this.updatePOIDistances();
          this.reverseGeocode(location[0], location[1]);
          this.cdr.markForCheck();
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          this.isLocationEnabled.set(false);
        },
        { enableHighAccuracy: true }
      );
    }
  }

  /**
   * Reverse geocoding con Nominatim (OpenStreetMap)
   * Converte coordinate GPS in nome località
   */
  private reverseGeocode(lat: number, lon: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;

    this.http.get<any>(url, {
      headers: {
        'Accept-Language': 'it' // Risultati in italiano
      }
    }).subscribe({
      next: (response) => {
        // Estrai città o comune dal risultato
        const address = response.address;
        const locationName =
          address.city ||
          address.town ||
          address.municipality ||
          address.village ||
          address.county ||
          response.display_name?.split(',')[0] ||
          'Posizione sconosciuta';

        this.currentLocationName.set(locationName);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('Reverse geocoding error:', err);
        // Mantieni il default
      }
    });
  }

  private addUserMarker(location: [number, number]): void {
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: '<div class="user-marker-pulse"></div><div class="user-marker-dot"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    this.userMarker = L.marker(location, { icon: userIcon })
      .addTo(this.map);
  }

  private loadPOIs(): void {
    this.poiService.getPOIs(this.activeFilters()).subscribe(pois => {
      this.pois.set(pois);
      this.renderMarkers();
      this.cdr.markForCheck();
    });
  }

  private updatePOIDistances(): void {
    const [lat, lng] = this.userLocation();
    const updatedPOIs = this.pois().map(poi => ({
      ...poi,
      distance: this.poiService.calculateDistance(lat, lng, poi.lat, poi.lng)
    }));
    this.pois.set(updatedPOIs);
  }

  private renderMarkers(): void {
    this.markersLayer.clearLayers();

    this.filteredPOIs().forEach(poi => {
      const icon = this.createMarkerIcon(poi.type);
      const marker = L.marker([poi.lat, poi.lng], { icon });

      marker.on('click', () => {
        this.selectPOI(poi);
      });

      this.markersLayer.addLayer(marker);
    });
  }

  private createMarkerIcon(type: POIType): L.DivIcon {
    const color = this.markerColors[type] || '#4A74F0';
    const iconHtml = this.getMarkerIconHtml(type, color);

    return L.divIcon({
      className: 'custom-marker',
      html: iconHtml,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
      popupAnchor: [0, -42]
    });
  }

  private getMarkerIconHtml(type: POIType, color: string): string {
    const iconMap: Record<POIType, string> = {
      vet: '🏥',
      groomer: '✂️',
      park: '🌳',
      shop: '🛍️',
      restaurant: '🍽️',
      hotel: '🏨',
      beach: '🏖️'
    };

    return `
      <div class="marker-pin" style="background-color: ${color}">
        <span class="marker-icon">${iconMap[type]}</span>
      </div>
    `;
  }

  goBack(): void {
    this.location.back();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.renderMarkers();
  }

  toggleFilter(filter: POIFilter): void {
    const updated = this.filters().map(f =>
      f.type === filter.type ? { ...f, active: !f.active } : f
    );
    this.filters.set(updated);
    this.loadPOIs();
  }

  selectPOI(poi: POI): void {
    // REGOLA UX: overlay, NO router.navigate
    this.selectedPOI.set(poi);
    this.map.panTo([poi.lat, poi.lng]);
    this.cdr.markForCheck();
  }

  closePOICard(): void {
    this.selectedPOI.set(null);
    this.cdr.markForCheck();
  }

  openDirections(poi: POI): void {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}`;
    window.open(url, '_blank');
  }

  toggleFavorite(poi: POI): void {
    const newFavoriteState = !poi.isFavorite;
    this.poiService.toggleFavorite(poi.id, newFavoriteState).subscribe(isFavorite => {
      const updatedPOIs = this.pois().map(p =>
        p.id === poi.id ? { ...p, isFavorite } : p
      );
      this.pois.set(updatedPOIs);
      if (this.selectedPOI()?.id === poi.id) {
        this.selectedPOI.set({ ...poi, isFavorite });
      }
      this.cdr.markForCheck();
    });
  }

  centerOnUser(): void {
    if (this.isLocationEnabled()) {
      this.map.setView(this.userLocation(), 15);
      // Fix mappa "grigia" dopo ri-centramento
      setTimeout(() => this.map?.invalidateSize(), 100);
    } else {
      this.getUserLocation();
    }
  }

  formatDistance(distance?: number): string {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  formatRating(rating?: number): string {
    return rating ? rating.toFixed(1) : '-';
  }

  goToPremium(): void {
    this.router.navigate(['/premium']);
  }

  // Mascot methods
  onMascotClick(): void {
    this.showMascotSheet.set(true);
  }

  closeMascotSheet(): void {
    this.showMascotSheet.set(false);
  }
}
