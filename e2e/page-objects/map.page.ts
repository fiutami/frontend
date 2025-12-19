import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Map Page Object
 * Covers: POI Map with filters, geolocation, and POI details
 */
export class MapPage extends BasePage {
  // Map container
  get map(): Locator {
    return this.page.locator('#map, [data-testid="map"], .leaflet-container');
  }

  get mapContainer(): Locator {
    return this.page.locator('.map-container');
  }

  // Header
  get pageTitle(): Locator {
    return this.page.locator('.map-header__title, h1').filter({ hasText: /mappa/i });
  }

  get backButton(): Locator {
    return this.page.locator('.back-button, [data-testid="back-btn"]');
  }

  get menuButton(): Locator {
    return this.page.locator('.menu-button, [data-testid="menu-btn"]');
  }

  // Search
  get searchInput(): Locator {
    return this.page.locator('.search-input, [data-testid="search-input"], input[type="text"]').first();
  }

  get filterButton(): Locator {
    return this.page.locator('.filter-button, [data-testid="filter-btn"]');
  }

  // Filter pills/chips
  get filterPills(): Locator {
    return this.page.locator('.filter-chip, .filter-pill, [data-testid="filter"]');
  }

  get activeFilters(): Locator {
    return this.page.locator('.filter-chip--active, .filter-pill--active');
  }

  // Specific filter pills
  get vetFilter(): Locator {
    return this.filterPills.filter({ hasText: /veterinario|vet/i });
  }

  get parkFilter(): Locator {
    return this.filterPills.filter({ hasText: /parco|park/i });
  }

  get shopFilter(): Locator {
    return this.filterPills.filter({ hasText: /negozio|shop/i });
  }

  get groomerFilter(): Locator {
    return this.filterPills.filter({ hasText: /toeletta|groomer/i });
  }

  get restaurantFilter(): Locator {
    return this.filterPills.filter({ hasText: /ristorante|restaurant/i });
  }

  get hotelFilter(): Locator {
    return this.filterPills.filter({ hasText: /hotel/i });
  }

  get beachFilter(): Locator {
    return this.filterPills.filter({ hasText: /spiagge|beach/i });
  }

  // Action buttons
  get actionButtons(): Locator {
    return this.page.locator('.action-btn, .action-buttons button');
  }

  get activityButton(): Locator {
    return this.actionButtons.filter({ hasText: /attività/i });
  }

  get eventsButton(): Locator {
    return this.actionButtons.filter({ hasText: /eventi/i });
  }

  get friendsLocationButton(): Locator {
    return this.actionButtons.filter({ hasText: /localizzati|amici/i });
  }

  // Location
  get myLocationButton(): Locator {
    return this.page.locator('.location-button, button').filter({ hasText: /posizione|location|my_location/i });
  }

  get currentLocationIndicator(): Locator {
    return this.page.locator('.current-location, [data-testid="current-location"]');
  }

  get locationToggle(): Locator {
    return this.page.locator('.toggle-switch, [data-testid="location-toggle"]');
  }

  // POI Card
  get poiCard(): Locator {
    return this.page.locator('.poi-card, [data-testid="poi-card"]');
  }

  get poiCardName(): Locator {
    return this.page.locator('.poi-card__name, [data-testid="poi-name"]');
  }

  get poiCardAddress(): Locator {
    return this.page.locator('.poi-card__address, [data-testid="poi-address"]');
  }

  get poiCardRating(): Locator {
    return this.page.locator('.poi-card__rating, [data-testid="poi-rating"]');
  }

  get poiCardDistance(): Locator {
    return this.page.locator('.poi-card__distance, [data-testid="poi-distance"]');
  }

  get directionsButton(): Locator {
    return this.page.locator('.poi-action-btn--directions, button').filter({ hasText: /indicazioni|directions/i });
  }

  get savePoiButton(): Locator {
    return this.page.locator('.poi-action-btn--save, button').filter({ hasText: /salva|save/i });
  }

  get closePoiCardButton(): Locator {
    return this.page.locator('.poi-card__close, [data-testid="close-poi"]');
  }

  // Markers
  get mapMarkers(): Locator {
    return this.page.locator('.leaflet-marker-icon, .custom-marker, .marker-pin');
  }

  get userLocationMarker(): Locator {
    return this.page.locator('.user-location-marker, .user-marker-dot');
  }

  // Mascot
  get mascotBubble(): Locator {
    return this.page.locator('.mascot-bubble, .speech-bubble');
  }

  // Promo
  get promoBanner(): Locator {
    return this.page.locator('.promo-banner, [data-testid="promo-banner"]');
  }

  // Navigation methods
  async goto(): Promise<void> {
    await this.page.goto('/map');
    await this.waitForLoadingToFinish();
  }

  // Filter actions
  async toggleFilter(type: string): Promise<void> {
    await this.filterPills.filter({ hasText: new RegExp(type, 'i') }).click();
  }

  async activateFilter(type: string): Promise<void> {
    const filter = this.filterPills.filter({ hasText: new RegExp(type, 'i') });
    const isActive = await filter.evaluate(el => el.classList.contains('filter-chip--active'));
    if (!isActive) {
      await filter.click();
    }
  }

  async deactivateFilter(type: string): Promise<void> {
    const filter = this.filterPills.filter({ hasText: new RegExp(type, 'i') });
    const isActive = await filter.evaluate(el => el.classList.contains('filter-chip--active'));
    if (isActive) {
      await filter.click();
    }
  }

  async deactivateAllFilters(): Promise<void> {
    const activeFilters = await this.activeFilters.all();
    for (const filter of activeFilters) {
      await filter.click();
    }
  }

  // Search actions
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  // Location actions
  async centerOnUserLocation(): Promise<void> {
    await this.myLocationButton.click();
  }

  async toggleLocationSharing(): Promise<void> {
    await this.locationToggle.click();
  }

  // POI actions
  async closePOICard(): Promise<void> {
    if (await this.poiCard.isVisible()) {
      await this.closePoiCardButton.click();
    }
  }

  async openDirections(): Promise<void> {
    await this.directionsButton.click();
  }

  async savePOI(): Promise<void> {
    await this.savePoiButton.click();
  }

  // Navigation
  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  // Wait helpers
  async waitForMapToLoad(): Promise<void> {
    await this.map.waitFor({ state: 'visible', timeout: 10000 });
  }

  async waitForMarkersToLoad(): Promise<void> {
    await this.page.waitForTimeout(1000); // Allow markers to render
  }
}
