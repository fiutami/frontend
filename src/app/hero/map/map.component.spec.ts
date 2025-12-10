import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with "all" filter active', () => {
    expect(component.activeFilter).toBe('all');
  });

  it('should have 5 filter options', () => {
    expect(component.filters.length).toBe(5);
  });

  it('should have mock places data', () => {
    expect(component.places.length).toBeGreaterThan(0);
  });

  it('should return all places when filter is "all"', () => {
    component.activeFilter = 'all';
    expect(component.filteredPlaces.length).toBe(component.places.length);
  });

  it('should filter places by type', () => {
    component.setFilter('park');
    const filteredPlaces = component.filteredPlaces;
    expect(filteredPlaces.every((place) => place.type === 'park')).toBeTruthy();
  });

  it('should generate star array correctly', () => {
    const stars = component.getStarArray(4.5);
    expect(stars.length).toBe(5);
    expect(stars.filter((s) => s.full).length).toBe(4);
  });

  it('should have 5 tabs configured', () => {
    expect(component.tabs.length).toBe(5);
  });

  it('should log when going to a place', () => {
    spyOn(console, 'log');
    const mockPlace = component.places[0];
    component.goToPlace(mockPlace);
    expect(console.log).toHaveBeenCalledWith('Navigate to place:', mockPlace);
  });
});
