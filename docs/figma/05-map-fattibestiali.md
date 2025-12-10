# Map & Fatti Bestiali - Figma Design Specifications

> Documentazione tecnica per le schermate Map e Fatti Bestiali del progetto Fiutami.
> Generata per l'integrazione Figma-to-Angular Code.

---

## Indice

1. [Overview](#overview)
2. [Frame Specifications](#frame-specifications)
3. [Map Screen Components](#map-screen-components)
4. [Fatti Bestiali Screen Components](#fatti-bestiali-screen-components)
5. [Angular Implementation Guide](#angular-implementation-guide)
6. [SCSS Variables & Tokens](#scss-variables--tokens)
7. [Responsive Considerations](#responsive-considerations)
8. [Accessibility Guidelines](#accessibility-guidelines)

---

## Overview

### Frames Documentati

| Frame ID | Nome | Dimensioni | Descrizione |
|----------|------|------------|-------------|
| `2002:3801` | mob_profile_map | 393x852px | Schermata mappa principale con ricerca e filtri |
| `12083:3858` | mob_profile_map_variant | 393x852px | Variante mappa con interazioni attive |
| `12151:4598` | mob_profile_fattibestiali | 393x852px | Schermata "Fatti Bestiali" con info pet e accordion |

### Scopo Funzionale

- **Map Screen**: Permette all'utente di esplorare luoghi pet-friendly, eventi e attivita sulla mappa interattiva
- **Fatti Bestiali**: Sezione dedicata alle informazioni dettagliate del pet (documenti, vaccinazioni, diario attivita, etc.)

---

## Frame Specifications

### mob_profile_map (2002:3801)

```yaml
frame:
  id: "2002:3801"
  name: "mob_profile_map"
  width: 393px
  height: 852px
  background: "#FFFFFF"
  layout: "vertical"

structure:
  - header (status bar)
  - search_section
  - filter_buttons_row
  - map_container
  - horizontal_scroll_cards
  - bottom_navigation
```

### mob_profile_map_variant (12083:3858)

```yaml
frame:
  id: "12083:3858"
  name: "mob_profile_map_variant"
  width: 393px
  height: 852px
  background: "#FFFFFF"
  variant: "active_interaction"

notes:
  - Mostra stato attivo della mascotte interattiva
  - Possibile overlay informativo su location selezionata
```

### mob_profile_fattibestiali (12151:4598)

```yaml
frame:
  id: "12151:4598"
  name: "mob_profile_fattibestiali"
  width: 393px
  height: 852px
  background: "#FFFFFF"
  layout: "vertical"

structure:
  - header (status bar)
  - pet_card_hero
  - pet_info_accordion
  - bottom_navigation
```

---

## Map Screen Components

### 1. Search Input (Input Text)

**Figma Specs:**
```yaml
component: "Input Text"
position:
  x: 15px
  y: 220px
dimensions:
  width: 358px
  height: 42px

children:
  - search_icon:
      position: { x: 16px, y: 12px }
      size: { width: 18px, height: 18px }
      color: "#666666"
  - placeholder_text:
      position: { x: 42px, y: 12px }
      size: { width: 274px, height: 18px }
      text: "Cerca luoghi, eventi, attivita..."
      font_size: "14px"
      color: "#999999"
  - filter_icon:
      position: { x: 324px, y: 12px }
      size: { width: 18px, height: 18px }
      color: "#666666"
```

**Angular Implementation:**

```typescript
// search-input.component.ts
@Component({
  selector: 'app-map-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class MapSearchInputComponent {
  @Input() placeholder: string = 'Cerca luoghi, eventi, attivita...';
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterClick = new EventEmitter<void>();

  searchValue: string = '';
}
```

```html
<!-- search-input.component.html -->
<div class="map-search-input">
  <div class="search-icon">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <!-- search icon SVG -->
    </svg>
  </div>
  <input
    type="text"
    [placeholder]="placeholder"
    [(ngModel)]="searchValue"
    (input)="searchChange.emit(searchValue)"
    class="search-field"
    aria-label="Cerca sulla mappa"
  />
  <button
    class="filter-button"
    (click)="filterClick.emit()"
    aria-label="Apri filtri"
  >
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <!-- filter icon SVG -->
    </svg>
  </button>
</div>
```

```scss
// search-input.component.scss
.map-search-input {
  position: relative;
  width: 358px;
  height: 42px;
  display: flex;
  align-items: center;
  background: var(--input-bg, #F5F5F5);
  border: 1px solid var(--input-border-color, #E0E0E0);
  border-radius: var(--radius-md);
  padding: 0 16px;

  .search-icon {
    width: 18px;
    height: 18px;
    color: #666666;
    flex-shrink: 0;
  }

  .search-field {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0 12px;
    font-size: 14px;
    color: var(--text);

    &::placeholder {
      color: #999999;
    }

    &:focus {
      outline: none;
    }
  }

  .filter-button {
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    background: transparent;
    color: #666666;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      color: var(--brand);
    }
  }
}
```

---

### 2. Filter Buttons Row (Navigation Buttons)

**Figma Specs:**
```yaml
component: "Filter Buttons Row"
position:
  y: 281px
layout:
  type: "horizontal"
  gap_1: 4px  # Between Btn_activity and Btn_Event
  gap_2: 8px  # Between Btn_Event and Btn_location

children:
  - btn_activity:
      position: { x: 17px }
      size: { width: 85px, height: 25px }
      label: "Attivita"
      variant: "default"
  - btn_event:
      position: { x: 106px }
      size: { width: 85px, height: 25px }
      label: "Eventi"
      variant: "default"
  - btn_location:
      position: { x: 199px }
      size: { width: 174px, height: 25px }
      label: "Luoghi pet-friendly"
      variant: "active"
```

**Angular Implementation:**

```typescript
// map-filter-buttons.component.ts
export interface FilterOption {
  id: string;
  label: string;
  width: number;
  active: boolean;
}

@Component({
  selector: 'app-map-filter-buttons',
  templateUrl: './map-filter-buttons.component.html',
  styleUrls: ['./map-filter-buttons.component.scss']
})
export class MapFilterButtonsComponent {
  @Input() filters: FilterOption[] = [
    { id: 'activity', label: 'Attivita', width: 85, active: false },
    { id: 'event', label: 'Eventi', width: 85, active: false },
    { id: 'location', label: 'Luoghi pet-friendly', width: 174, active: true }
  ];

  @Output() filterSelected = new EventEmitter<string>();

  onFilterClick(filterId: string): void {
    this.filters.forEach(f => f.active = f.id === filterId);
    this.filterSelected.emit(filterId);
  }
}
```

```html
<!-- map-filter-buttons.component.html -->
<div class="map-filter-buttons" role="tablist" aria-label="Filtri mappa">
  <button
    *ngFor="let filter of filters; let i = index"
    [class.active]="filter.active"
    [style.width.px]="filter.width"
    [class.gap-small]="i === 0"
    [class.gap-medium]="i === 1"
    (click)="onFilterClick(filter.id)"
    role="tab"
    [attr.aria-selected]="filter.active"
  >
    {{ filter.label }}
  </button>
</div>
```

```scss
// map-filter-buttons.component.scss
.map-filter-buttons {
  display: flex;
  align-items: center;
  padding: 0 17px;

  button {
    height: 25px;
    padding: 0 12px;
    border: 1px solid var(--brand);
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--text);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-fast);
    white-space: nowrap;

    &.active {
      background: var(--brand);
      color: var(--text-inverse);
    }

    &:hover:not(.active) {
      background: rgba(245, 166, 35, 0.1);
    }

    // Gap handling
    &.gap-small {
      margin-right: 4px;
    }

    &.gap-medium {
      margin-right: 8px;
    }
  }
}
```

---

### 3. Interactive Map Container (Btn_maps + MAPPA_interattiva)

**Figma Specs:**
```yaml
component: "Btn_maps"
position:
  x: 15px
  y: 319px
dimensions:
  width: 362px
  height: 238px

child_component: "MAPPA_interattiva"
  position:
    x: 15px
    y: 346px
  dimensions:
    width: 362px
    height: 211px

overlay_component: "MAPPA_doveseistato"
  position:
    x: 22px
    y: 495px
  dimensions:
    width: 58px
    height: 56px
  description: "Marker 'Dove sei stato' - location history indicator"
```

**Angular Implementation:**

```typescript
// interactive-map.component.ts
@Component({
  selector: 'app-interactive-map',
  templateUrl: './interactive-map.component.html',
  styleUrls: ['./interactive-map.component.scss']
})
export class InteractiveMapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() markers: MapMarker[] = [];
  @Output() markerClick = new EventEmitter<MapMarker>();
  @Output() locationHistoryClick = new EventEmitter<void>();

  private map: any; // Leaflet or Google Maps instance

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    // Map initialization logic (Leaflet/Google Maps)
  }
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'activity' | 'event' | 'location';
  title: string;
}
```

```html
<!-- interactive-map.component.html -->
<div class="map-wrapper">
  <div
    #mapContainer
    class="map-container"
    role="application"
    aria-label="Mappa interattiva"
  ></div>

  <button
    class="location-history-button"
    (click)="locationHistoryClick.emit()"
    aria-label="Visualizza dove sei stato"
  >
    <svg width="24" height="24" viewBox="0 0 24 24">
      <!-- location history icon -->
    </svg>
    <span class="label">Dove sei stato</span>
  </button>
</div>
```

```scss
// interactive-map.component.scss
.map-wrapper {
  position: relative;
  width: 362px;
  height: 238px;
  margin: 0 15px;
  border-radius: var(--radius-lg);
  overflow: hidden;

  .map-container {
    width: 100%;
    height: 211px;
    margin-top: 27px; // Offset from Btn_maps top
  }

  .location-history-button {
    position: absolute;
    left: 7px; // 22px - 15px margin
    bottom: 22px; // Calculated from Y:495 within container
    width: 58px;
    height: 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--brand);
    border: none;
    border-radius: var(--radius-md);
    color: var(--text-inverse);
    cursor: pointer;
    box-shadow: var(--shadow-md);

    svg {
      width: 24px;
      height: 24px;
      margin-bottom: 4px;
    }

    .label {
      font-size: 8px;
      font-weight: 600;
      text-align: center;
      line-height: 1.2;
    }

    &:hover {
      transform: scale(1.05);
      box-shadow: var(--shadow-lg);
    }
  }
}
```

---

### 4. Interactive Mascot

**Figma Specs:**
```yaml
component: "Interactive Mascot"
position:
  x: 113px
  y: 398px
dimensions:
  width: 260px
  height: 159px
description: "Mascotte animata che appare sulla mappa con interazioni"
variants:
  - default: Mascotte base
  - pointing: Mascotte che indica una location
  - celebrating: Mascotte per eventi/achievement
```

**Angular Implementation:**

```typescript
// map-mascot.component.ts
@Component({
  selector: 'app-map-mascot',
  templateUrl: './map-mascot.component.html',
  styleUrls: ['./map-mascot.component.scss'],
  animations: [
    trigger('mascotAnimation', [
      state('default', style({ transform: 'translateY(0)' })),
      state('bounce', style({ transform: 'translateY(-10px)' })),
      transition('default <=> bounce', animate('300ms ease-in-out'))
    ])
  ]
})
export class MapMascotComponent {
  @Input() variant: 'default' | 'pointing' | 'celebrating' = 'default';
  @Input() message?: string;
  @Output() mascotClick = new EventEmitter<void>();

  animationState = 'default';

  onMascotInteraction(): void {
    this.animationState = 'bounce';
    setTimeout(() => this.animationState = 'default', 300);
    this.mascotClick.emit();
  }
}
```

```html
<!-- map-mascot.component.html -->
<div
  class="mascot-container"
  [class]="'variant-' + variant"
  [@mascotAnimation]="animationState"
  (click)="onMascotInteraction()"
  role="button"
  tabindex="0"
  aria-label="Mascotte interattiva"
>
  <img
    [src]="'assets/mascot/mascot-' + variant + '.svg'"
    [alt]="'Mascotte Fiutami - ' + variant"
    class="mascot-image"
  />
  <div *ngIf="message" class="mascot-bubble">
    {{ message }}
  </div>
</div>
```

```scss
// map-mascot.component.scss
.mascot-container {
  position: absolute;
  left: 113px;
  top: 398px;
  width: 260px;
  height: 159px;
  cursor: pointer;
  z-index: 10;

  .mascot-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .mascot-bubble {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 8px 16px;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    font-size: 12px;
    white-space: nowrap;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      border: 8px solid transparent;
      border-top-color: white;
    }
  }

  &.variant-celebrating {
    animation: celebrate 0.5s ease-in-out;
  }
}

@keyframes celebrate {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
}
```

---

### 5. Horizontal Scroll Cards

**Figma Specs:**
```yaml
component: "Horizontal boxes"
position:
  x: -77px  # Scroll offset (partially visible left card)
  y: 599px
dimensions:
  total_width: 694px  # Total scrollable content
  visible_width: 393px
layout:
  type: "horizontal_scroll"

card_specs:
  width: 109px
  height: 67px
  children:
    - rectangle:
        height: 43.85px
        description: "Image/thumbnail area"
    - text:
        height: 18.88px
        description: "Location/event name"
  gap: 12px  # Estimated gap between cards
```

**Angular Implementation:**

```typescript
// horizontal-scroll-cards.component.ts
export interface ScrollCard {
  id: string;
  image: string;
  title: string;
  type: 'activity' | 'event' | 'location';
}

@Component({
  selector: 'app-horizontal-scroll-cards',
  templateUrl: './horizontal-scroll-cards.component.html',
  styleUrls: ['./horizontal-scroll-cards.component.scss']
})
export class HorizontalScrollCardsComponent {
  @Input() cards: ScrollCard[] = [];
  @Output() cardClick = new EventEmitter<ScrollCard>();
}
```

```html
<!-- horizontal-scroll-cards.component.html -->
<div
  class="scroll-container"
  role="list"
  aria-label="Luoghi e attivita nelle vicinanze"
>
  <div class="scroll-content">
    <div
      *ngFor="let card of cards"
      class="scroll-card"
      (click)="cardClick.emit(card)"
      role="listitem"
      tabindex="0"
    >
      <div class="card-image">
        <img [src]="card.image" [alt]="card.title" loading="lazy" />
      </div>
      <div class="card-title">{{ card.title }}</div>
    </div>
  </div>
</div>
```

```scss
// horizontal-scroll-cards.component.scss
.scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.scroll-content {
  display: flex;
  gap: 12px;
  padding: 0 15px;
  width: max-content;
}

.scroll-card {
  flex-shrink: 0;
  width: 109px;
  height: 67px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: white;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover, &:focus {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .card-image {
    width: 100%;
    height: 43.85px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .card-title {
    height: 18.88px;
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 500;
    color: var(--text);
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
```

---

## Fatti Bestiali Screen Components

### 1. Pet Card Hero

**Figma Specs:**
```yaml
component: "Pet Card"
position:
  x: 22px
  y: 232px
dimensions:
  width: 349px
  height: 200px

children:
  - date_text:
      position: { x: 16px, y: 8px }
      size: { width: 170px, height: 21px }
      text: "Da quando e' con te: 12/03/2020"
      font_size: "12px"
      color: "#666666"
  - pet_image:
      size: { width: 109px, height: 109px }
      position: "left-center"
      border_radius: "8px"
  - pet_name:
      text: "Thor"
      size: { width: 38px, height: 24px }
      font_size: "18px"
      font_weight: "700"
      color: "#111111"
  - breed_badge:
      position: { x: 229px, y: 24px }
      size: { width: 104px, height: 44px }
      background: "#F5A623"
      text: "Golden Retriever"
      font_size: "10px"
```

**Angular Implementation:**

```typescript
// pet-card-hero.component.ts
export interface PetInfo {
  id: string;
  name: string;
  breed: string;
  image: string;
  adoptionDate: Date;
  age?: string;
}

@Component({
  selector: 'app-pet-card-hero',
  templateUrl: './pet-card-hero.component.html',
  styleUrls: ['./pet-card-hero.component.scss']
})
export class PetCardHeroComponent {
  @Input() pet!: PetInfo;
  @Output() editClick = new EventEmitter<void>();

  get formattedDate(): string {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(this.pet.adoptionDate);
  }
}
```

```html
<!-- pet-card-hero.component.html -->
<div class="pet-card-hero" role="region" aria-label="Informazioni pet">
  <div class="date-info">
    Da quando e' con te: {{ formattedDate }}
  </div>

  <div class="card-content">
    <div class="pet-image">
      <img
        [src]="pet.image"
        [alt]="'Foto di ' + pet.name"
        loading="lazy"
      />
    </div>

    <div class="pet-details">
      <h2 class="pet-name">{{ pet.name }}</h2>
      <div class="breed-badge">
        {{ pet.breed }}
      </div>
    </div>
  </div>

  <button
    class="edit-button"
    (click)="editClick.emit()"
    aria-label="Modifica informazioni pet"
  >
    <svg width="16" height="16" viewBox="0 0 16 16">
      <!-- edit icon -->
    </svg>
  </button>
</div>
```

```scss
// pet-card-hero.component.scss
.pet-card-hero {
  position: relative;
  width: 349px;
  height: 200px;
  margin: 0 22px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 16px;

  .date-info {
    position: absolute;
    top: 8px;
    left: 16px;
    width: 170px;
    height: 21px;
    font-size: 12px;
    color: #666666;
    line-height: 21px;
  }

  .card-content {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 30px;
  }

  .pet-image {
    width: 109px;
    height: 109px;
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .pet-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pet-name {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    margin: 0;
  }

  .breed-badge {
    width: 104px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--brand);
    color: var(--text-inverse);
    border-radius: var(--radius-sm);
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    padding: 4px 8px;
    line-height: 1.3;
  }

  .edit-button {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: #666666;
    cursor: pointer;
    border-radius: 50%;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
      color: var(--brand);
    }
  }
}
```

---

### 2. Pet Info Accordion

**Figma Specs:**
```yaml
component: "Pet Info Accordion"
position:
  x: 21px
  y: 444px
dimensions:
  width: 350px
  height: 183px

accordion_items:
  - appuntamenti:
      height: 22.47px
      y_offset: 0
      label: "Appuntamenti"
  - documenti:
      height: 22.47px
      y_offset: 30.47px
      label: "Documenti"
  - lista_vaccinazione:
      height: 22.47px
      y_offset: 60.94px
      label: "Lista Vaccinazione"
  - allergie_note_mediche:
      height: 23px
      y_offset: 91.41px
      label: "Allergie e note mediche"
  - diario_attivita:
      height: 22.47px
      y_offset: 122.41px
      label: "Diario attivita"
  - peso_condizione_fisica:
      height: 22px
      y_offset: 152.88px
      label: "Peso e condizione fisica"

chevron_icon:
  size: { width: 11px, height: 6px }
  position: { x: 341px }
  color: "#666666"
```

**Angular Implementation:**

```typescript
// pet-info-accordion.component.ts
export interface AccordionSection {
  id: string;
  label: string;
  icon?: string;
  expanded: boolean;
  content?: any;
}

@Component({
  selector: 'app-pet-info-accordion',
  templateUrl: './pet-info-accordion.component.html',
  styleUrls: ['./pet-info-accordion.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0', opacity: 0 })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('collapsed <=> expanded', animate('200ms ease-in-out'))
    ])
  ]
})
export class PetInfoAccordionComponent {
  @Input() petId!: string;
  @Output() sectionClick = new EventEmitter<string>();

  sections: AccordionSection[] = [
    { id: 'appuntamenti', label: 'Appuntamenti', expanded: false },
    { id: 'documenti', label: 'Documenti', expanded: false },
    { id: 'lista-vaccinazione', label: 'Lista Vaccinazione', expanded: false },
    { id: 'allergie-note-mediche', label: 'Allergie e note mediche', expanded: false },
    { id: 'diario-attivita', label: 'Diario attivita', expanded: false },
    { id: 'peso-condizione-fisica', label: 'Peso e condizione fisica', expanded: false }
  ];

  toggleSection(section: AccordionSection): void {
    section.expanded = !section.expanded;
    this.sectionClick.emit(section.id);
  }
}
```

```html
<!-- pet-info-accordion.component.html -->
<div class="pet-info-accordion" role="list">
  <div
    *ngFor="let section of sections; let i = index"
    class="accordion-item"
    role="listitem"
  >
    <button
      class="accordion-header"
      [class.expanded]="section.expanded"
      (click)="toggleSection(section)"
      [attr.aria-expanded]="section.expanded"
      [attr.aria-controls]="'section-content-' + section.id"
    >
      <span class="section-label">{{ section.label }}</span>
      <svg
        class="chevron-icon"
        [class.rotated]="section.expanded"
        width="11"
        height="6"
        viewBox="0 0 11 6"
        fill="currentColor"
      >
        <path d="M1 1L5.5 5L10 1" stroke="currentColor" stroke-width="1.5" fill="none"/>
      </svg>
    </button>

    <div
      [id]="'section-content-' + section.id"
      class="accordion-content"
      [@expandCollapse]="section.expanded ? 'expanded' : 'collapsed'"
    >
      <ng-container [ngSwitch]="section.id">
        <app-appointments-content
          *ngSwitchCase="'appuntamenti'"
          [petId]="petId"
        ></app-appointments-content>

        <app-documents-content
          *ngSwitchCase="'documenti'"
          [petId]="petId"
        ></app-documents-content>

        <app-vaccinations-content
          *ngSwitchCase="'lista-vaccinazione'"
          [petId]="petId"
        ></app-vaccinations-content>

        <app-allergies-content
          *ngSwitchCase="'allergie-note-mediche'"
          [petId]="petId"
        ></app-allergies-content>

        <app-activity-diary-content
          *ngSwitchCase="'diario-attivita'"
          [petId]="petId"
        ></app-activity-diary-content>

        <app-weight-condition-content
          *ngSwitchCase="'peso-condizione-fisica'"
          [petId]="petId"
        ></app-weight-condition-content>
      </ng-container>
    </div>
  </div>
</div>
```

```scss
// pet-info-accordion.component.scss
$accordion-item-height: 22.47px;
$accordion-gap: 8px;

.pet-info-accordion {
  width: 350px;
  margin: 0 21px;
}

.accordion-item {
  border-bottom: 1px solid #E0E0E0;

  &:last-child {
    border-bottom: none;
  }
}

.accordion-header {
  width: 100%;
  height: $accordion-item-height;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
  margin-bottom: $accordion-gap;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  &.expanded {
    background: rgba(245, 166, 35, 0.05);
  }

  .section-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
  }

  .chevron-icon {
    width: 11px;
    height: 6px;
    color: #666666;
    transition: transform 0.2s ease;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.accordion-content {
  overflow: hidden;
  padding: 0 12px;

  // Content-specific padding when expanded
  &:not([style*="height: 0"]) {
    padding-bottom: 16px;
  }
}

// Specific heights from Figma (for reference)
.accordion-item {
  &:nth-child(1) .accordion-header { height: 22.47px; }
  &:nth-child(2) .accordion-header { height: 22.47px; }
  &:nth-child(3) .accordion-header { height: 22.47px; }
  &:nth-child(4) .accordion-header { height: 23px; }
  &:nth-child(5) .accordion-header { height: 22.47px; }
  &:nth-child(6) .accordion-header { height: 22px; }
}
```

---

## Angular Implementation Guide

### Module Structure

```typescript
// map-fatti-bestiali.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Map Components
import { MapPageComponent } from './map/map-page.component';
import { MapSearchInputComponent } from './map/search-input/search-input.component';
import { MapFilterButtonsComponent } from './map/filter-buttons/filter-buttons.component';
import { InteractiveMapComponent } from './map/interactive-map/interactive-map.component';
import { MapMascotComponent } from './map/mascot/mascot.component';
import { HorizontalScrollCardsComponent } from './map/scroll-cards/scroll-cards.component';

// Fatti Bestiali Components
import { FattiBestialiPageComponent } from './fatti-bestiali/fatti-bestiali-page.component';
import { PetCardHeroComponent } from './fatti-bestiali/pet-card-hero/pet-card-hero.component';
import { PetInfoAccordionComponent } from './fatti-bestiali/accordion/accordion.component';

// Accordion Content Components
import { AppointmentsContentComponent } from './fatti-bestiali/accordion-content/appointments/appointments.component';
import { DocumentsContentComponent } from './fatti-bestiali/accordion-content/documents/documents.component';
import { VaccinationsContentComponent } from './fatti-bestiali/accordion-content/vaccinations/vaccinations.component';
import { AllergiesContentComponent } from './fatti-bestiali/accordion-content/allergies/allergies.component';
import { ActivityDiaryContentComponent } from './fatti-bestiali/accordion-content/activity-diary/activity-diary.component';
import { WeightConditionContentComponent } from './fatti-bestiali/accordion-content/weight-condition/weight-condition.component';

const routes: Routes = [
  { path: 'map', component: MapPageComponent },
  { path: 'fatti-bestiali', component: FattiBestialiPageComponent },
  { path: 'fatti-bestiali/:petId', component: FattiBestialiPageComponent }
];

@NgModule({
  declarations: [
    MapPageComponent,
    MapSearchInputComponent,
    MapFilterButtonsComponent,
    InteractiveMapComponent,
    MapMascotComponent,
    HorizontalScrollCardsComponent,
    FattiBestialiPageComponent,
    PetCardHeroComponent,
    PetInfoAccordionComponent,
    AppointmentsContentComponent,
    DocumentsContentComponent,
    VaccinationsContentComponent,
    AllergiesContentComponent,
    ActivityDiaryContentComponent,
    WeightConditionContentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    MapPageComponent,
    FattiBestialiPageComponent
  ]
})
export class MapFattiBestialiModule { }
```

### Folder Structure

```
src/app/
├── map-fatti-bestiali/
│   ├── map-fatti-bestiali.module.ts
│   ├── map/
│   │   ├── map-page.component.ts
│   │   ├── map-page.component.html
│   │   ├── map-page.component.scss
│   │   ├── search-input/
│   │   │   ├── search-input.component.ts
│   │   │   ├── search-input.component.html
│   │   │   └── search-input.component.scss
│   │   ├── filter-buttons/
│   │   │   ├── filter-buttons.component.ts
│   │   │   ├── filter-buttons.component.html
│   │   │   └── filter-buttons.component.scss
│   │   ├── interactive-map/
│   │   │   ├── interactive-map.component.ts
│   │   │   ├── interactive-map.component.html
│   │   │   └── interactive-map.component.scss
│   │   ├── mascot/
│   │   │   ├── mascot.component.ts
│   │   │   ├── mascot.component.html
│   │   │   └── mascot.component.scss
│   │   └── scroll-cards/
│   │       ├── scroll-cards.component.ts
│   │       ├── scroll-cards.component.html
│   │       └── scroll-cards.component.scss
│   └── fatti-bestiali/
│       ├── fatti-bestiali-page.component.ts
│       ├── fatti-bestiali-page.component.html
│       ├── fatti-bestiali-page.component.scss
│       ├── pet-card-hero/
│       │   ├── pet-card-hero.component.ts
│       │   ├── pet-card-hero.component.html
│       │   └── pet-card-hero.component.scss
│       ├── accordion/
│       │   ├── accordion.component.ts
│       │   ├── accordion.component.html
│       │   └── accordion.component.scss
│       └── accordion-content/
│           ├── appointments/
│           ├── documents/
│           ├── vaccinations/
│           ├── allergies/
│           ├── activity-diary/
│           └── weight-condition/
```

---

## SCSS Variables & Tokens

### Design Tokens Reference

```scss
// _map-fatti-bestiali-tokens.scss

// === MAP SCREEN TOKENS ===
$map-search-height: 42px;
$map-search-width: 358px;
$map-search-icon-size: 18px;
$map-search-placeholder-x: 42px;
$map-search-filter-x: 324px;

$map-filter-btn-height: 25px;
$map-filter-btn-gap-small: 4px;
$map-filter-btn-gap-medium: 8px;

$map-container-width: 362px;
$map-container-height: 238px;
$map-interactive-height: 211px;

$map-location-history-width: 58px;
$map-location-history-height: 56px;

$map-mascot-width: 260px;
$map-mascot-height: 159px;

$map-scroll-card-width: 109px;
$map-scroll-card-height: 67px;
$map-scroll-card-image-height: 43.85px;
$map-scroll-card-text-height: 18.88px;
$map-scroll-total-width: 694px;

// === FATTI BESTIALI TOKENS ===
$pet-card-width: 349px;
$pet-card-height: 200px;
$pet-card-image-size: 109px;
$pet-card-breed-badge-width: 104px;
$pet-card-breed-badge-height: 44px;

$accordion-width: 350px;
$accordion-total-height: 183px;
$accordion-item-height: 22.47px;
$accordion-item-height-allergie: 23px;
$accordion-item-height-peso: 22px;
$accordion-chevron-width: 11px;
$accordion-chevron-height: 6px;

// === POSITIONS (Y-axis from frame top) ===
$map-search-y: 220px;
$map-filter-y: 281px;
$map-container-y: 319px;
$map-scroll-y: 599px;
$map-mascot-x: 113px;
$map-mascot-y: 398px;

$pet-card-y: 232px;
$pet-card-x: 22px;
$accordion-y: 444px;
$accordion-x: 21px;
```

### Component Mixins

```scss
// _map-fatti-bestiali-mixins.scss

@mixin map-filter-button($active: false) {
  height: $map-filter-btn-height;
  padding: 0 12px;
  border: 1px solid var(--brand);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;

  @if $active {
    background: var(--brand);
    color: var(--text-inverse);
  } @else {
    background: transparent;
    color: var(--text);

    &:hover {
      background: rgba(245, 166, 35, 0.1);
    }
  }
}

@mixin scroll-card-base {
  flex-shrink: 0;
  width: $map-scroll-card-width;
  height: $map-scroll-card-height;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: white;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover, &:focus {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

@mixin accordion-header {
  width: 100%;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  &.expanded {
    background: rgba(245, 166, 35, 0.05);
  }
}

@mixin pet-card-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand);
  color: var(--text-inverse);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  padding: 4px 8px;
  line-height: 1.3;
}
```

---

## Responsive Considerations

### Breakpoint Adjustments

```scss
// Mobile-first approach (393px base)

// Map Screen
@media (min-width: 480px) {
  .map-search-input {
    width: calc(100% - 30px);
    max-width: 450px;
  }

  .map-wrapper {
    width: calc(100% - 30px);
    max-width: 500px;
  }

  .scroll-card {
    width: 130px;
    height: 80px;
  }
}

@media (min-width: 768px) {
  .map-filter-buttons {
    justify-content: center;
    gap: 12px;

    button {
      min-width: 120px;
    }
  }

  .map-wrapper {
    height: 350px;
  }
}

// Fatti Bestiali Screen
@media (min-width: 480px) {
  .pet-card-hero {
    width: calc(100% - 44px);
    max-width: 450px;
  }

  .pet-info-accordion {
    width: calc(100% - 42px);
    max-width: 450px;
  }
}

@media (min-width: 768px) {
  .pet-card-hero {
    max-width: 600px;
    height: 250px;

    .pet-image {
      width: 150px;
      height: 150px;
    }

    .pet-name {
      font-size: 24px;
    }

    .breed-badge {
      width: 130px;
      height: 50px;
      font-size: 12px;
    }
  }

  .accordion-header {
    height: 40px;

    .section-label {
      font-size: 16px;
    }
  }
}
```

---

## Accessibility Guidelines

### ARIA Landmarks & Roles

```html
<!-- Map Page Structure -->
<main role="main" aria-label="Mappa pet-friendly">
  <section aria-label="Ricerca e filtri">
    <div role="search">
      <!-- Search input -->
    </div>
    <div role="tablist" aria-label="Filtri categoria">
      <!-- Filter buttons -->
    </div>
  </section>

  <section aria-label="Mappa interattiva">
    <div role="application" aria-label="Mappa navigabile">
      <!-- Map container -->
    </div>
  </section>

  <section aria-label="Luoghi nelle vicinanze">
    <div role="list">
      <!-- Horizontal scroll cards -->
    </div>
  </section>
</main>

<!-- Fatti Bestiali Page Structure -->
<main role="main" aria-label="Informazioni del tuo pet">
  <section aria-label="Profilo pet">
    <!-- Pet card hero -->
  </section>

  <section aria-label="Dettagli e documenti">
    <div role="list" aria-label="Sezioni informative">
      <!-- Accordion -->
    </div>
  </section>
</main>
```

### Keyboard Navigation

```typescript
// Keyboard navigation for accordion
@HostListener('keydown', ['$event'])
handleKeydown(event: KeyboardEvent): void {
  const sections = this.sections;
  const currentIndex = sections.findIndex(s => s.id === this.focusedSection);

  switch(event.key) {
    case 'ArrowDown':
      event.preventDefault();
      this.focusSection(currentIndex + 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      this.focusSection(currentIndex - 1);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      this.toggleSection(sections[currentIndex]);
      break;
    case 'Home':
      event.preventDefault();
      this.focusSection(0);
      break;
    case 'End':
      event.preventDefault();
      this.focusSection(sections.length - 1);
      break;
  }
}
```

### Screen Reader Announcements

```typescript
// Live region announcements
@Injectable({ providedIn: 'root' })
export class A11yAnnouncerService {
  private announcer = inject(LiveAnnouncer);

  announceMapAction(action: string): void {
    this.announcer.announce(action, 'polite');
  }

  announceAccordionState(section: string, expanded: boolean): void {
    const state = expanded ? 'aperta' : 'chiusa';
    this.announcer.announce(`Sezione ${section} ${state}`, 'polite');
  }
}
```

### Color Contrast Compliance

| Element | Foreground | Background | Ratio | WCAG Level |
|---------|------------|------------|-------|------------|
| Filter button text | #111111 | transparent | 15.3:1 | AAA |
| Filter button active | #FFFFFF | #F5A623 | 2.8:1 | AA (large text) |
| Accordion label | #111111 | #FFFFFF | 21:1 | AAA |
| Date text | #666666 | #FFFFFF | 5.7:1 | AA |
| Breed badge | #FFFFFF | #F5A623 | 2.8:1 | AA (large text) |

---

## Component Checklist

### Map Screen Components

- [ ] `app-map-search-input` - Search with filter icon
- [ ] `app-map-filter-buttons` - Activity/Event/Location tabs
- [ ] `app-interactive-map` - Leaflet/Google Maps integration
- [ ] `app-map-mascot` - Animated mascot overlay
- [ ] `app-horizontal-scroll-cards` - Location cards carousel
- [ ] `app-location-history-button` - "Dove sei stato" button

### Fatti Bestiali Components

- [ ] `app-pet-card-hero` - Pet profile card
- [ ] `app-pet-info-accordion` - Expandable sections container
- [ ] `app-appointments-content` - Appuntamenti section
- [ ] `app-documents-content` - Documenti section
- [ ] `app-vaccinations-content` - Lista Vaccinazione section
- [ ] `app-allergies-content` - Allergie e note mediche section
- [ ] `app-activity-diary-content` - Diario attivita section
- [ ] `app-weight-condition-content` - Peso e condizione fisica section

---

## Related Documentation

- [01-design-tokens.md](./01-design-tokens.md) - Design system tokens
- [02-typography.md](./02-typography.md) - Typography specifications
- [03-shared-components.md](./03-shared-components.md) - Shared UI components
- [04-navigation.md](./04-navigation.md) - Navigation patterns

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-28
**Figma File:** NvUkFVzSPKJEzfvLPZ2mFv
**Author:** Documentation Architect (Claude Code)
