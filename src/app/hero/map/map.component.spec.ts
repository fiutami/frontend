import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MapComponent } from './map.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { POIService } from '../../map/services/poi.service';
import { of } from 'rxjs';
import { POI, POIFilter } from '../../core/models/poi.models';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let mockPOIService: jasmine.SpyObj<POIService>;

  const mockPOIs: POI[] = [
    {
      id: 'poi-1',
      name: 'Parco Centrale',
      type: 'park',
      lat: 45.6983,
      lng: 9.6773,
      address: 'Via Roma 1',
      rating: 4.5,
      isFavorite: false
    },
    {
      id: 'poi-2',
      name: 'Clinica Veterinaria',
      type: 'vet',
      lat: 45.6993,
      lng: 9.6783,
      address: 'Via Milano 2',
      rating: 4.8,
      isFavorite: true
    },
    {
      id: 'poi-3',
      name: 'Pet Shop Amici',
      type: 'shop',
      lat: 45.6973,
      lng: 9.6763,
      address: 'Via Napoli 3',
      rating: 4.2,
      isFavorite: false
    }
  ];

  const mockFilters: POIFilter[] = [
    { type: 'vet', label: 'Veterinari', icon: '🏥', color: '#FF6B6B', active: true },
    { type: 'groomer', label: 'Toelettatori', icon: '✂️', color: '#4ECDC4', active: true },
    { type: 'park', label: 'Parchi', icon: '🌳', color: '#95E1A3', active: true },
    { type: 'shop', label: 'Negozi', icon: '🛍️', color: '#F4AE1A', active: true },
    { type: 'restaurant', label: 'Ristoranti', icon: '🍽️', color: '#A78BFA', active: true }
  ];

  beforeEach(async () => {
    mockPOIService = jasmine.createSpyObj('POIService', [
      'getPOIs',
      'getDefaultFilters',
      'toggleFavorite',
      'calculateDistance'
    ]);
    mockPOIService.getPOIs.and.returnValue(of(mockPOIs));
    mockPOIService.getDefaultFilters.and.returnValue(mockFilters);
    mockPOIService.toggleFavorite.and.returnValue(of(true));
    mockPOIService.calculateDistance.and.returnValue(1.5);

    await TestBed.configureTestingModule({
      imports: [
        MapComponent,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: POIService, useValue: mockPOIService }
      ]
    }).compileComponents();

    // Mock the map container element
    const mapDiv = document.createElement('div');
    mapDiv.id = 'map';
    mapDiv.style.height = '400px';
    mapDiv.style.width = '100%';
    document.body.appendChild(mapDiv);

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges to avoid Leaflet initialization issues in tests
  });

  afterEach(() => {
    // Clean up map container
    const mapDiv = document.getElementById('map');
    if (mapDiv) {
      document.body.removeChild(mapDiv);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Filters', () => {
    it('should have 5 filter options from service', () => {
      expect(component.filters().length).toBe(5);
    });

    it('should have all filters active initially', () => {
      const activeFilters = component.activeFilters();
      expect(activeFilters.length).toBe(5);
    });

    it('should compute activeFilters correctly', () => {
      // All filters are active initially
      const active = component.activeFilters();
      expect(active).toContain('vet');
      expect(active).toContain('park');
      expect(active).toContain('shop');
    });
  });

  describe('POIs', () => {
    it('should initialize with empty POIs signal', () => {
      // Before ngAfterViewInit, pois should be empty
      expect(component.pois().length).toBe(0);
    });

    it('should have filteredPOIs computed', () => {
      // Set pois directly for testing
      component['pois'].set(mockPOIs);

      const filtered = component.filteredPOIs();
      expect(filtered.length).toBe(3);
    });

    it('should filter POIs by search query', () => {
      component['pois'].set(mockPOIs);
      component['searchQuery'].set('parco');

      const filtered = component.filteredPOIs();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Parco Centrale');
    });

    it('should filter POIs by type when filter is toggled', () => {
      component['pois'].set(mockPOIs);

      // Toggle off all except park
      const updatedFilters = mockFilters.map(f => ({
        ...f,
        active: f.type === 'park'
      }));
      component['filters'].set(updatedFilters);

      const filtered = component.filteredPOIs();
      expect(filtered.length).toBe(1);
      expect(filtered[0].type).toBe('park');
    });
  });

  describe('POI Selection', () => {
    it('should have null selectedPOI initially', () => {
      expect(component.selectedPOI()).toBeNull();
    });

    it('should select POI when selectPOI is called', () => {
      const poi = mockPOIs[0];
      // Mock the map to avoid errors
      component['map'] = { panTo: jasmine.createSpy('panTo') } as any;

      component.selectPOI(poi);

      expect(component.selectedPOI()).toEqual(poi);
    });

    it('should clear selection when closePOICard is called', () => {
      component['selectedPOI'].set(mockPOIs[0]);
      expect(component.selectedPOI()).not.toBeNull();

      component.closePOICard();

      expect(component.selectedPOI()).toBeNull();
    });
  });

  describe('User Location', () => {
    it('should have default user location (Bergamo)', () => {
      const location = component.userLocation();
      expect(location[0]).toBeCloseTo(45.6983, 2);
      expect(location[1]).toBeCloseTo(9.6773, 2);
    });

    it('should have location disabled initially', () => {
      expect(component.isLocationEnabled()).toBeFalse();
    });

    it('should have default location name', () => {
      expect(component.currentLocationName()).toBe('Bergamo');
    });
  });

  describe('Formatting', () => {
    it('should format distance in meters when less than 1km', () => {
      const formatted = component.formatDistance(0.5);
      expect(formatted).toBe('500m');
    });

    it('should format distance in km when 1km or more', () => {
      const formatted = component.formatDistance(2.5);
      expect(formatted).toBe('2.5km');
    });

    it('should return empty string for undefined distance', () => {
      expect(component.formatDistance(undefined)).toBe('');
    });

    it('should format rating correctly', () => {
      expect(component.formatRating(4.567)).toBe('4.6');
    });

    it('should return dash for undefined rating', () => {
      expect(component.formatRating(undefined)).toBe('-');
    });
  });

  describe('Marker Colors', () => {
    it('should have colors defined for all POI types', () => {
      expect(component.markerColors['vet']).toBe('#FF6B6B');
      expect(component.markerColors['groomer']).toBe('#4ECDC4');
      expect(component.markerColors['park']).toBe('#95E1A3');
      expect(component.markerColors['shop']).toBe('#F4AE1A');
      expect(component.markerColors['restaurant']).toBe('#A78BFA');
    });
  });

  describe('Mascot Sheet', () => {
    it('should have mascot sheet hidden initially', () => {
      expect(component.showMascotSheet()).toBeFalse();
    });

    it('should show mascot sheet on click', () => {
      component.onMascotClick();
      expect(component.showMascotSheet()).toBeTrue();
    });

    it('should hide mascot sheet on close', () => {
      component.showMascotSheet.set(true);
      component.closeMascotSheet();
      expect(component.showMascotSheet()).toBeFalse();
    });
  });
});
