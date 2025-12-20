import {
  Component,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { POI, POIFilter, POIType } from '../../core/models/poi.models';
import { POIService } from '../services/poi.service';
import { BottomTabBarComponent } from '../../shared/components/bottom-tab-bar/bottom-tab-bar.component';
import { TabItem } from '../../shared/components/bottom-tab-bar/bottom-tab-bar.models';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/icons/marker-icon-2x.png',
  iconUrl: 'assets/icons/marker-icon.png',
  shadowUrl: 'assets/icons/marker-shadow.png',
});

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomTabBarComponent],
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  private readonly poiService = inject(POIService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private userMarker?: L.Marker;

  // Signals
  readonly userLocation = signal<[number, number]>([41.9028, 12.4964]); // Roma default
  readonly pois = signal<POI[]>([]);
  readonly selectedPOI = signal<POI | null>(null);
  readonly filters = signal<POIFilter[]>(this.poiService.getDefaultFilters());
  readonly searchQuery = signal<string>('');
  readonly isLocationEnabled = signal<boolean>(false);
  readonly currentLocationName = signal<string>('Roma');

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

  // Tab bar configuration
  readonly tabs: TabItem[] = [
    { id: 'home', iconSrc: 'assets/icons/tab-home.svg', route: '/home' },
    { id: 'calendar', iconSrc: 'assets/icons/tab-calendar.svg', route: '/calendar' },
    { id: 'map', iconSrc: 'assets/icons/tab-location.svg', activeIconSrc: 'assets/icons/tab-location-active.svg', route: '/map' },
    { id: 'pet', iconSrc: 'assets/icons/tab-paw.svg', route: '/profile' },
    { id: 'profile', iconSrc: 'assets/icons/tab-user.svg', route: '/user' }
  ];

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

  ngAfterViewInit(): void {
    this.initMap();
    this.loadPOIs();
    this.getUserLocation();
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

  getFilterIcon(filter: POIFilter): string {
    return filter.icon;
  }
}
