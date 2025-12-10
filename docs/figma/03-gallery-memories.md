# Gallery & Memories - Figma Design Specifications

> Documentazione tecnica per i componenti Gallery e Memories del profilo utente Fiutami.
> Generata per integrazione Angular con design system tokens.

---

## Indice

1. [Overview](#overview)
2. [Frames di Riferimento](#frames-di-riferimento)
3. [Layout Gallery](#layout-gallery)
4. [Layout Memories](#layout-memories)
5. [Componenti UI](#componenti-ui)
6. [Empty States](#empty-states)
7. [Banner Gallery](#banner-gallery)
8. [Design Tokens](#design-tokens)
9. [Angular Implementation](#angular-implementation)
10. [Responsive Behavior](#responsive-behavior)

---

## Overview

La sezione Gallery & Memories consente agli utenti di gestire le proprie foto e ricordi organizzati cronologicamente. Il design segue un approccio mobile-first con grid responsive per la visualizzazione delle immagini.

### Funzionalita Principali

- **Gallery**: Griglia foto con supporto upload, modifica, eliminazione
- **Memories**: Organizzazione temporale (Giorni, Mesi, Anni)
- **Empty States**: Stati vuoti con mascotte interattiva
- **Banner Gallery**: Visualizzazione dettaglio espansa con metadata

---

## Frames di Riferimento

### Specifiche Dimensionali

| Frame | Node ID | Dimensioni | Descrizione |
|-------|---------|------------|-------------|
| `mob_profile_gallery` | `2002:3626` | 393x852px | Gallery con contenuti |
| `mob_profile_gallery_empty` | `12191:4959` | 393x852px | Gallery stato vuoto |
| `mob_profile_memories` | `2002:3717` | 393x852px | Memories con contenuti |
| `mob_profile_memories_empty` | `12191:5232` | 393x852px | Memories stato vuoto |
| `Banner_Gallery` | `12209:6551` | 376x1306px | Banner dettaglio espanso |

### Gerarchia Navigazione

```
Profile
  |-- Gallery (default tab)
  |     |-- Grid View
  |     |-- Photo Upload Card
  |     `-- Photo Detail Banner
  |
  `-- Memories
        |-- GIORNI Section
        |-- MESI Section
        `-- ANNI Section
```

---

## Layout Gallery

### Grid System

La gallery utilizza un sistema di griglia con card di dimensioni variabili per creare interesse visivo.

#### Specifiche Grid

```scss
// Grid Configuration
$gallery-grid-columns: 2;
$gallery-grid-columns-expanded: 3;
$gallery-horizontal-padding: 12px; // Min: 12px, Max: 14px
$gallery-vertical-spacing: 130px;
$gallery-card-gap: 8px;
```

#### Tipologie Card

| Tipo | Dimensioni (WxH) | Posizione Esempio | Uso |
|------|------------------|-------------------|-----|
| Large | 239x245px | X:14, Y:352 | Foto principale / Featured |
| Medium | 126x118px | Variabile | Foto standard |
| Small | 120x118px | Variabile | Foto compatte |

### Struttura HTML Gallery Grid

```html
<!-- app-gallery-grid selector -->
<div class="gallery-grid">
  <!-- Large Card -->
  <div class="gallery-card gallery-card--large">
    <img [src]="photo.url" [alt]="photo.description">
    <div class="gallery-card__overlay">
      <app-btn-favorites [isFavorite]="photo.favorite"></app-btn-favorites>
    </div>
  </div>

  <!-- Medium Cards -->
  <div class="gallery-card gallery-card--medium">
    <img [src]="photo.url" [alt]="photo.description">
  </div>

  <!-- Small Cards -->
  <div class="gallery-card gallery-card--small">
    <img [src]="photo.url" [alt]="photo.description">
  </div>
</div>
```

### Posizionamento Gallery

```scss
.gallery-container {
  padding-inline: 14px;
  margin-top: 352px; // Y offset dal top
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.gallery-card {
  border-radius: $border-radius-lg;
  overflow: hidden;
  position: relative;

  &--large {
    width: 239px;
    height: 245px;
    grid-column: span 2;

    @media (min-width: 768px) {
      grid-column: span 1;
    }
  }

  &--medium {
    width: 126px;
    height: 118px;
  }

  &--small {
    width: 120px;
    height: 118px;
  }
}
```

---

## Layout Memories

### Sezioni Temporali

Memories organizza i ricordi in tre sezioni cronologiche orizzontali scrollabili.

#### Specifiche Sezioni

| Sezione | Dimensioni (WxH) | Posizione (X, Y) |
|---------|------------------|------------------|
| GIORNI | 371x164px | X:12, Y:351 |
| MESI | 371x164px | X:12, Y:527 |
| ANNI | 371x164px | X:12, Y:711 |

### Struttura HTML Memories

```html
<!-- app-memories selector -->
<div class="memories-container">
  <!-- GIORNI Section -->
  <section class="memories-section" aria-label="Ricordi per giorni">
    <h3 class="memories-section__title">GIORNI</h3>
    <div class="memories-section__scroll">
      <app-memory-card
        *ngFor="let memory of memoriesByDays"
        [memory]="memory">
      </app-memory-card>
    </div>
  </section>

  <!-- MESI Section -->
  <section class="memories-section" aria-label="Ricordi per mesi">
    <h3 class="memories-section__title">MESI</h3>
    <div class="memories-section__scroll">
      <app-memory-card
        *ngFor="let memory of memoriesByMonths"
        [memory]="memory">
      </app-memory-card>
    </div>
  </section>

  <!-- ANNI Section -->
  <section class="memories-section" aria-label="Ricordi per anni">
    <h3 class="memories-section__title">ANNI</h3>
    <div class="memories-section__scroll">
      <app-memory-card
        *ngFor="let memory of memoriesByYears"
        [memory]="memory">
      </app-memory-card>
    </div>
  </section>
</div>
```

### SCSS Memories Layout

```scss
.memories-container {
  padding-inline: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.memories-section {
  width: 371px;
  height: 164px;

  &__title {
    font-family: $font-family-body;
    font-size: $typography-button-size;
    font-weight: $typography-h2-weight;
    color: $color-text-primary;
    margin-bottom: $spacing-sm;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  &__scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.memory-card {
  flex: 0 0 auto;
  scroll-snap-align: start;
  border-radius: $border-radius-lg;
  overflow: hidden;
}
```

---

## Componenti UI

### 1. PhotoUpload_Card

Card per upload nuove foto nella gallery.

| Proprieta | Valore |
|-----------|--------|
| Width | 239px |
| Height | 245px |
| Selector | `app-photo-upload-card` |

```typescript
// photo-upload-card.component.ts
@Component({
  selector: 'app-photo-upload-card',
  templateUrl: './photo-upload-card.component.html',
  styleUrls: ['./photo-upload-card.component.scss']
})
export class PhotoUploadCardComponent {
  @Output() fileSelected = new EventEmitter<File>();

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fileSelected.emit(input.files[0]);
    }
  }
}
```

```html
<!-- photo-upload-card.component.html -->
<div class="photo-upload-card"
     (click)="fileInput.click()"
     role="button"
     tabindex="0"
     aria-label="Carica una nuova foto">
  <input
    #fileInput
    type="file"
    accept="image/*"
    (change)="onFileChange($event)"
    hidden>
  <div class="photo-upload-card__icon">
    <svg width="48" height="48" viewBox="0 0 48 48">
      <!-- Plus icon -->
      <path d="M24 10v28M10 24h28" stroke="currentColor" stroke-width="3"/>
    </svg>
  </div>
  <span class="photo-upload-card__text">Aggiungi foto</span>
</div>
```

```scss
.photo-upload-card {
  width: 239px;
  height: 245px;
  background: rgba($color-primary-500, 0.1);
  border: 2px dashed $color-primary-500;
  border-radius: $border-radius-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  cursor: pointer;
  transition: $transition-base;

  &:hover, &:focus {
    background: rgba($color-primary-500, 0.2);
    border-color: darken($color-primary-500, 10%);
  }

  &__icon {
    color: $color-primary-500;
  }

  &__text {
    font-family: $font-family-body;
    font-size: $typography-body-size;
    color: $color-primary-500;
    font-weight: $typography-body-weight;
  }
}
```

---

### 2. Btn_emotion

Bottone per visualizzare calorie/emozioni associate alla foto.

| Proprieta | Valore |
|-----------|--------|
| Width | 87.5px |
| Height | 29px |
| Position | X:132, Y:563 |
| Text Example | "120 Kcal" |
| Selector | `app-btn-emotion` |

```typescript
// btn-emotion.component.ts
@Component({
  selector: 'app-btn-emotion',
  templateUrl: './btn-emotion.component.html',
  styleUrls: ['./btn-emotion.component.scss']
})
export class BtnEmotionComponent {
  @Input() calories: number = 0;
  @Input() unit: string = 'Kcal';
  @Output() clicked = new EventEmitter<void>();
}
```

```html
<!-- btn-emotion.component.html -->
<button
  class="btn-emotion"
  type="button"
  (click)="clicked.emit()">
  <span class="btn-emotion__value">{{ calories }}</span>
  <span class="btn-emotion__unit">{{ unit }}</span>
</button>
```

```scss
.btn-emotion {
  width: 87.5px;
  height: 29px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: $color-cta-primary;
  border: none;
  border-radius: $border-radius-md;
  font-family: $font-family-body;
  font-size: $typography-small-size;
  color: $color-text-dark;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: darken($color-cta-primary, 5%);
  }

  &__value {
    font-weight: $typography-h2-weight;
  }

  &__unit {
    font-weight: $typography-body-weight;
  }
}
```

---

### 3. Btn_calendar

Bottone per filtro temporale (mese).

| Proprieta | Valore |
|-----------|--------|
| Width | 76.38px |
| Height | 26.09px |
| Position | X:26, Y:564.9 |
| Text Example | "Marzo" |
| Selector | `app-btn-calendar` |

```typescript
// btn-calendar.component.ts
@Component({
  selector: 'app-btn-calendar',
  templateUrl: './btn-calendar.component.html',
  styleUrls: ['./btn-calendar.component.scss']
})
export class BtnCalendarComponent {
  @Input() month: string = '';
  @Input() showIcon: boolean = true;
  @Output() clicked = new EventEmitter<void>();
}
```

```html
<!-- btn-calendar.component.html -->
<button
  class="btn-calendar"
  type="button"
  (click)="clicked.emit()">
  <svg *ngIf="showIcon" class="btn-calendar__icon" width="16" height="16" viewBox="0 0 16 16">
    <!-- Calendar icon -->
    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" fill="none"/>
    <line x1="2" y1="7" x2="14" y2="7" stroke="currentColor"/>
    <line x1="5" y1="1" x2="5" y2="4" stroke="currentColor"/>
    <line x1="11" y1="1" x2="11" y2="4" stroke="currentColor"/>
  </svg>
  <span class="btn-calendar__text">{{ month }}</span>
</button>
```

```scss
.btn-calendar {
  width: 76.38px;
  height: 26.09px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: 1px solid $color-text-primary;
  border-radius: $border-radius-full;
  font-family: $font-family-body;
  font-size: $typography-small-size;
  color: $color-text-primary;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: rgba($color-text-primary, 0.1);
  }

  &__icon {
    flex-shrink: 0;
  }

  &__text {
    white-space: nowrap;
  }
}
```

---

### 4. Btn_position

Bottone per visualizzare/filtrare per localita.

| Proprieta | Valore |
|-----------|--------|
| Width | 105px |
| Height | 24px |
| Position | X:25, Y:531 |
| Text Example | "Bergamo" |
| Selector | `app-btn-position` |

```typescript
// btn-position.component.ts
@Component({
  selector: 'app-btn-position',
  templateUrl: './btn-position.component.html',
  styleUrls: ['./btn-position.component.scss']
})
export class BtnPositionComponent {
  @Input() location: string = '';
  @Input() showIcon: boolean = true;
  @Output() clicked = new EventEmitter<void>();
}
```

```html
<!-- btn-position.component.html -->
<button
  class="btn-position"
  type="button"
  (click)="clicked.emit()">
  <svg *ngIf="showIcon" class="btn-position__icon" width="14" height="18" viewBox="0 0 14 18">
    <!-- Location pin icon -->
    <path d="M7 0C3.13 0 0 3.13 0 7c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
          fill="currentColor"/>
  </svg>
  <span class="btn-position__text">{{ location }}</span>
</button>
```

```scss
.btn-position {
  width: 105px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 0;
  font-family: $font-family-body;
  font-size: $typography-small-size;
  color: $color-text-secondary;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    color: $color-text-primary;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
```

---

### 5. Btn_favorites

Bottone stella per aggiungere/rimuovere dai preferiti.

| Proprieta | Valore |
|-----------|--------|
| Width | 28.43px |
| Height | 28.43px |
| Icon | Star (filled/outline) |
| Selector | `app-btn-favorites` |

```typescript
// btn-favorites.component.ts
@Component({
  selector: 'app-btn-favorites',
  templateUrl: './btn-favorites.component.html',
  styleUrls: ['./btn-favorites.component.scss']
})
export class BtnFavoritesComponent {
  @Input() isFavorite: boolean = false;
  @Output() toggled = new EventEmitter<boolean>();

  toggle(): void {
    this.isFavorite = !this.isFavorite;
    this.toggled.emit(this.isFavorite);
  }
}
```

```html
<!-- btn-favorites.component.html -->
<button
  class="btn-favorites"
  [class.btn-favorites--active]="isFavorite"
  type="button"
  [attr.aria-pressed]="isFavorite"
  aria-label="Aggiungi ai preferiti"
  (click)="toggle()">
  <!-- Star Outline -->
  <svg *ngIf="!isFavorite" width="28" height="28" viewBox="0 0 28 28">
    <path d="M14 2l3.09 6.26L24 9.27l-5 4.87 1.18 6.88L14 17.77l-6.18 3.25L9 14.14 4 9.27l6.91-1.01L14 2z"
          stroke="currentColor"
          fill="none"
          stroke-width="1.5"/>
  </svg>
  <!-- Star Filled -->
  <svg *ngIf="isFavorite" width="28" height="28" viewBox="0 0 28 28">
    <path d="M14 2l3.09 6.26L24 9.27l-5 4.87 1.18 6.88L14 17.77l-6.18 3.25L9 14.14 4 9.27l6.91-1.01L14 2z"
          fill="currentColor"/>
  </svg>
</button>
```

```scss
.btn-favorites {
  width: 28.43px;
  height: 28.43px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: $border-radius-full;
  color: $color-text-secondary;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: rgba(255, 255, 255, 1);
    color: $color-cta-primary;
    transform: scale(1.1);
  }

  &--active {
    color: $color-cta-primary;

    &:hover {
      color: darken($color-cta-primary, 10%);
    }
  }
}
```

---

### 6. Button Group (Gallery/Memories Toggle)

Gruppo di bottoni per switch tra Gallery e Memories.

| Proprieta | Valore |
|-----------|--------|
| Button Width | 172px each |
| Button Height | 48px |
| Total Width | 344px |
| Position | X:26, Y:240 |
| Selector | `app-tab-toggle` |

```typescript
// tab-toggle.component.ts
@Component({
  selector: 'app-tab-toggle',
  templateUrl: './tab-toggle.component.html',
  styleUrls: ['./tab-toggle.component.scss']
})
export class TabToggleComponent {
  @Input() tabs: { id: string; label: string }[] = [];
  @Input() activeTab: string = '';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(tabId: string): void {
    this.activeTab = tabId;
    this.tabChange.emit(tabId);
  }
}
```

```html
<!-- tab-toggle.component.html -->
<div class="tab-toggle" role="tablist">
  <button
    *ngFor="let tab of tabs"
    class="tab-toggle__btn"
    [class.tab-toggle__btn--active]="activeTab === tab.id"
    role="tab"
    [attr.aria-selected]="activeTab === tab.id"
    [attr.tabindex]="activeTab === tab.id ? 0 : -1"
    (click)="selectTab(tab.id)">
    {{ tab.label }}
  </button>
</div>
```

```scss
.tab-toggle {
  display: flex;
  width: 344px;
  background: rgba($color-text-primary, 0.1);
  border-radius: $border-radius-lg;
  padding: 4px;

  &__btn {
    flex: 1;
    width: 172px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: $border-radius-md;
    font-family: $font-family-body;
    font-size: $typography-button-size;
    font-weight: $typography-body-weight;
    color: $color-text-secondary;
    cursor: pointer;
    transition: $transition-base;

    &:hover:not(&--active) {
      background: rgba($color-text-primary, 0.05);
    }

    &--active {
      background: $color-cta-primary;
      color: $color-text-dark;
      font-weight: $typography-h2-weight;
      box-shadow: $shadow-sm;
    }
  }
}
```

---

### 7. Btn_modify

Bottone per modificare contenuto.

| Proprieta | Valore |
|-----------|--------|
| Width | 142px |
| Height | 25px |
| Position | X:237, Y:303 |
| Selector | `app-btn-modify` |

```typescript
// btn-modify.component.ts
@Component({
  selector: 'app-btn-modify',
  templateUrl: './btn-modify.component.html',
  styleUrls: ['./btn-modify.component.scss']
})
export class BtnModifyComponent {
  @Input() label: string = 'Modifica';
  @Output() clicked = new EventEmitter<void>();
}
```

```html
<!-- btn-modify.component.html -->
<button
  class="btn-modify"
  type="button"
  (click)="clicked.emit()">
  <svg class="btn-modify__icon" width="16" height="16" viewBox="0 0 16 16">
    <!-- Edit/Pencil icon -->
    <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61z"
          fill="currentColor"/>
  </svg>
  <span class="btn-modify__text">{{ label }}</span>
</button>
```

```scss
.btn-modify {
  width: 142px;
  height: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: 1px solid $color-text-primary;
  border-radius: $border-radius-full;
  font-family: $font-family-body;
  font-size: $typography-small-size;
  color: $color-text-primary;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: $color-text-primary;
    color: $color-text-inverse;
  }

  &__icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
}
```

---

### 8. Btn_delete

Bottone per eliminare contenuto.

| Proprieta | Valore |
|-----------|--------|
| Width | 32px |
| Height | 32px |
| Position | X:152, Y:300 |
| Selector | `app-btn-delete` |

```typescript
// btn-delete.component.ts
@Component({
  selector: 'app-btn-delete',
  templateUrl: './btn-delete.component.html',
  styleUrls: ['./btn-delete.component.scss']
})
export class BtnDeleteComponent {
  @Output() clicked = new EventEmitter<void>();

  confirmDelete(): void {
    // Emit only after confirmation (can add modal logic)
    this.clicked.emit();
  }
}
```

```html
<!-- btn-delete.component.html -->
<button
  class="btn-delete"
  type="button"
  aria-label="Elimina"
  (click)="confirmDelete()">
  <svg width="18" height="20" viewBox="0 0 18 20">
    <!-- Trash icon -->
    <path d="M1 5h16M7 5V3a2 2 0 012-2h0a2 2 0 012 2v2m3 0v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5h12zM7 9v6M11 9v6"
          stroke="currentColor"
          stroke-width="1.5"
          fill="none"
          stroke-linecap="round"/>
  </svg>
</button>
```

```scss
.btn-delete {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 53, 69, 0.1);
  border: none;
  border-radius: $border-radius-full;
  color: #DC3545; // Semantic: danger
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: #DC3545;
    color: $color-text-inverse;
    transform: scale(1.05);
  }

  &:focus {
    outline: 2px solid #DC3545;
    outline-offset: 2px;
  }
}
```

---

### 9. Interactive Mascot (Empty State)

Mascotte interattiva mostrata negli stati vuoti.

| Proprieta | Valore |
|-----------|--------|
| Width | 243px |
| Height | 118px |
| Position | X:116, Y:655 |
| Selector | `app-mascot-empty` |

```typescript
// mascot-empty.component.ts
@Component({
  selector: 'app-mascot-empty',
  templateUrl: './mascot-empty.component.html',
  styleUrls: ['./mascot-empty.component.scss']
})
export class MascotEmptyComponent {
  @Input() message: string = '';
  @Input() ctaLabel: string = '';
  @Input() showCta: boolean = false;
  @Output() ctaClicked = new EventEmitter<void>();
}
```

```html
<!-- mascot-empty.component.html -->
<div class="mascot-empty">
  <div class="mascot-empty__image">
    <img
      src="assets/images/mascot-thinking.svg"
      alt="Fiutami mascot"
      width="118"
      height="118">
  </div>
  <div class="mascot-empty__bubble">
    <p class="mascot-empty__message">{{ message }}</p>
    <button
      *ngIf="showCta"
      class="mascot-empty__cta"
      (click)="ctaClicked.emit()">
      {{ ctaLabel }}
    </button>
  </div>
</div>
```

```scss
.mascot-empty {
  width: 243px;
  height: 118px;
  display: flex;
  align-items: center;
  gap: $spacing-md;

  &__image {
    flex-shrink: 0;
    width: 118px;
    height: 118px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__bubble {
    flex: 1;
    background: $color-background-primary;
    border-radius: $border-radius-lg;
    padding: $spacing-md;
    position: relative;
    box-shadow: $shadow-md;

    // Speech bubble tail
    &::before {
      content: '';
      position: absolute;
      left: -8px;
      top: 50%;
      transform: translateY(-50%);
      border: 8px solid transparent;
      border-right-color: $color-background-primary;
    }
  }

  &__message {
    font-family: $font-family-body;
    font-size: $typography-body-size;
    color: $color-text-primary;
    margin: 0 0 $spacing-sm;
    line-height: $typography-body-line-height;
  }

  &__cta {
    display: inline-block;
    background: $color-cta-primary;
    border: none;
    border-radius: $border-radius-md;
    padding: $spacing-xs $spacing-md;
    font-family: $font-family-body;
    font-size: $typography-small-size;
    font-weight: $typography-h2-weight;
    color: $color-text-dark;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      background: darken($color-cta-primary, 5%);
    }
  }
}
```

---

## Empty States

### Gallery Empty State

Frame: `mob_profile_gallery_empty` (12191:4959)

```html
<!-- gallery-empty.component.html -->
<div class="gallery-empty">
  <div class="gallery-empty__content">
    <h3 class="gallery-empty__title">La tua gallery e vuota</h3>
    <p class="gallery-empty__description">
      Inizia a caricare le tue foto per creare la tua collezione personale.
    </p>
  </div>

  <app-mascot-empty
    message="Carica la tua prima foto!"
    ctaLabel="Aggiungi foto"
    [showCta]="true"
    (ctaClicked)="openUpload()">
  </app-mascot-empty>

  <app-photo-upload-card
    class="gallery-empty__upload"
    (fileSelected)="onFileSelected($event)">
  </app-photo-upload-card>
</div>
```

```scss
.gallery-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: $spacing-xl;
  text-align: center;

  &__content {
    margin-bottom: $spacing-xl;
  }

  &__title {
    font-family: $font-family-body;
    font-size: $typography-h2-size;
    font-weight: $typography-h1-weight;
    color: $color-text-primary;
    margin: 0 0 $spacing-sm;
  }

  &__description {
    font-family: $font-family-body;
    font-size: $typography-body-size;
    color: $color-text-secondary;
    margin: 0;
    max-width: 280px;
  }

  &__upload {
    margin-top: $spacing-xl;
  }
}
```

### Memories Empty State

Frame: `mob_profile_memories_empty` (12191:5232)

```html
<!-- memories-empty.component.html -->
<div class="memories-empty">
  <div class="memories-empty__content">
    <h3 class="memories-empty__title">Nessun ricordo ancora</h3>
    <p class="memories-empty__description">
      Le tue foto diventeranno ricordi quando passeranno giorni, mesi e anni.
    </p>
  </div>

  <app-mascot-empty
    message="Torna tra qualche giorno!"
    [showCta]="false">
  </app-mascot-empty>

  <div class="memories-empty__placeholder">
    <!-- Placeholder timeline illustration -->
    <div class="memories-empty__timeline">
      <span class="memories-empty__timeline-dot"></span>
      <span class="memories-empty__timeline-line"></span>
      <span class="memories-empty__timeline-dot"></span>
      <span class="memories-empty__timeline-line"></span>
      <span class="memories-empty__timeline-dot"></span>
    </div>
    <div class="memories-empty__labels">
      <span>Giorni</span>
      <span>Mesi</span>
      <span>Anni</span>
    </div>
  </div>
</div>
```

---

## Banner Gallery

### Overview

Frame: `Banner_Gallery` (12209:6551) - Visualizzazione dettaglio foto espansa.

| Proprieta | Valore |
|-----------|--------|
| Width | 376px |
| Height | 1306px (scrollable) |
| Behavior | Slide-up modal |

### Struttura Banner

```html
<!-- gallery-banner.component.html -->
<div class="gallery-banner"
     [class.gallery-banner--open]="isOpen"
     role="dialog"
     aria-modal="true"
     aria-labelledby="banner-title">

  <!-- Header with close -->
  <header class="gallery-banner__header">
    <button
      class="gallery-banner__close"
      aria-label="Chiudi"
      (click)="close()">
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>
    <div class="gallery-banner__actions">
      <app-btn-favorites [isFavorite]="photo.favorite"></app-btn-favorites>
      <app-btn-delete (clicked)="deletePhoto()"></app-btn-delete>
    </div>
  </header>

  <!-- Main Image -->
  <div class="gallery-banner__image">
    <img [src]="photo.url" [alt]="photo.description">
  </div>

  <!-- Metadata Section -->
  <div class="gallery-banner__meta">
    <app-btn-position [location]="photo.location"></app-btn-position>

    <div class="gallery-banner__tags">
      <app-btn-calendar [month]="photo.month"></app-btn-calendar>
      <app-btn-emotion [calories]="photo.calories"></app-btn-emotion>
    </div>
  </div>

  <!-- Description -->
  <div class="gallery-banner__description">
    <h2 id="banner-title" class="gallery-banner__title">{{ photo.title }}</h2>
    <p class="gallery-banner__text">{{ photo.description }}</p>
    <app-btn-modify
      label="Modifica descrizione"
      (clicked)="editDescription()">
    </app-btn-modify>
  </div>

  <!-- Related Photos -->
  <div class="gallery-banner__related">
    <h3 class="gallery-banner__section-title">Altre foto di questo periodo</h3>
    <div class="gallery-banner__related-grid">
      <div
        *ngFor="let related of relatedPhotos"
        class="gallery-banner__related-item"
        (click)="selectPhoto(related)">
        <img [src]="related.thumbnail" [alt]="related.title">
      </div>
    </div>
  </div>
</div>

<!-- Backdrop -->
<div
  class="gallery-banner-backdrop"
  [class.gallery-banner-backdrop--visible]="isOpen"
  (click)="close()">
</div>
```

### SCSS Banner

```scss
.gallery-banner {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  width: 376px;
  max-width: 100%;
  max-height: 90vh;
  background: $color-background-primary;
  border-radius: $border-radius-page $border-radius-page 0 0;
  box-shadow: $shadow-xl;
  overflow-y: auto;
  z-index: 1000;
  transition: transform 0.3s ease-out;

  &--open {
    transform: translateX(-50%) translateY(0);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md;
    position: sticky;
    top: 0;
    background: $color-background-primary;
    z-index: 1;
  }

  &__close {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: $color-text-primary;
    cursor: pointer;
    border-radius: $border-radius-full;
    transition: $transition-base;

    &:hover {
      background: rgba($color-text-primary, 0.1);
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-sm;
  }

  &__image {
    width: 100%;
    aspect-ratio: 1;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__meta {
    padding: $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__tags {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }

  &__description {
    padding: $spacing-md;
    border-top: 1px solid rgba($color-text-primary, 0.1);
  }

  &__title {
    font-family: $font-family-body;
    font-size: $typography-h2-size;
    font-weight: $typography-h1-weight;
    color: $color-text-primary;
    margin: 0 0 $spacing-sm;
  }

  &__text {
    font-family: $font-family-body;
    font-size: $typography-body-size;
    color: $color-text-secondary;
    line-height: $typography-body-line-height;
    margin: 0 0 $spacing-md;
  }

  &__related {
    padding: $spacing-md;
    border-top: 1px solid rgba($color-text-primary, 0.1);
  }

  &__section-title {
    font-family: $font-family-body;
    font-size: $typography-button-size;
    font-weight: $typography-h2-weight;
    color: $color-text-primary;
    margin: 0 0 $spacing-md;
  }

  &__related-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-sm;
  }

  &__related-item {
    aspect-ratio: 1;
    border-radius: $border-radius-md;
    overflow: hidden;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: $transition-base;
    }

    &:hover img {
      transform: scale(1.05);
    }
  }
}

.gallery-banner-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  z-index: 999;
  transition: opacity 0.3s ease;

  &--visible {
    opacity: 1;
    visibility: visible;
  }
}
```

---

## Design Tokens

### Tokens Specifici Gallery/Memories

```scss
// _tokens-gallery.scss

// Grid
$gallery-grid-gap: 8px;
$gallery-card-radius: $border-radius-lg;
$gallery-horizontal-padding: 14px;

// Card Sizes
$gallery-card-large-width: 239px;
$gallery-card-large-height: 245px;
$gallery-card-medium-width: 126px;
$gallery-card-medium-height: 118px;
$gallery-card-small-width: 120px;
$gallery-card-small-height: 118px;

// Memories Sections
$memories-section-width: 371px;
$memories-section-height: 164px;
$memories-section-gap: 12px;

// Banner
$banner-width: 376px;
$banner-max-height: 1306px;
$banner-radius: $border-radius-page;

// Button Sizes
$btn-emotion-width: 87.5px;
$btn-emotion-height: 29px;
$btn-calendar-width: 76.38px;
$btn-calendar-height: 26.09px;
$btn-position-width: 105px;
$btn-position-height: 24px;
$btn-favorites-size: 28.43px;
$btn-modify-width: 142px;
$btn-modify-height: 25px;
$btn-delete-size: 32px;

// Tab Toggle
$tab-toggle-width: 344px;
$tab-toggle-btn-width: 172px;
$tab-toggle-btn-height: 48px;

// Mascot
$mascot-width: 243px;
$mascot-height: 118px;
```

---

## Angular Implementation

### Module Structure

```typescript
// gallery-memories.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { GalleryComponent } from './gallery/gallery.component';
import { GalleryGridComponent } from './gallery/gallery-grid/gallery-grid.component';
import { GalleryEmptyComponent } from './gallery/gallery-empty/gallery-empty.component';
import { GalleryBannerComponent } from './gallery/gallery-banner/gallery-banner.component';
import { MemoriesComponent } from './memories/memories.component';
import { MemoriesEmptyComponent } from './memories/memories-empty/memories-empty.component';
import { MemorySectionComponent } from './memories/memory-section/memory-section.component';

// Shared UI Components
import { PhotoUploadCardComponent } from './shared/photo-upload-card/photo-upload-card.component';
import { BtnEmotionComponent } from './shared/btn-emotion/btn-emotion.component';
import { BtnCalendarComponent } from './shared/btn-calendar/btn-calendar.component';
import { BtnPositionComponent } from './shared/btn-position/btn-position.component';
import { BtnFavoritesComponent } from './shared/btn-favorites/btn-favorites.component';
import { BtnModifyComponent } from './shared/btn-modify/btn-modify.component';
import { BtnDeleteComponent } from './shared/btn-delete/btn-delete.component';
import { TabToggleComponent } from './shared/tab-toggle/tab-toggle.component';
import { MascotEmptyComponent } from './shared/mascot-empty/mascot-empty.component';

const routes: Routes = [
  {
    path: '',
    component: GalleryComponent,
    children: [
      { path: '', redirectTo: 'photos', pathMatch: 'full' },
      { path: 'photos', component: GalleryGridComponent },
      { path: 'memories', component: MemoriesComponent }
    ]
  }
];

@NgModule({
  declarations: [
    GalleryComponent,
    GalleryGridComponent,
    GalleryEmptyComponent,
    GalleryBannerComponent,
    MemoriesComponent,
    MemoriesEmptyComponent,
    MemorySectionComponent,
    PhotoUploadCardComponent,
    BtnEmotionComponent,
    BtnCalendarComponent,
    BtnPositionComponent,
    BtnFavoritesComponent,
    BtnModifyComponent,
    BtnDeleteComponent,
    TabToggleComponent,
    MascotEmptyComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    GalleryComponent,
    MemoriesComponent
  ]
})
export class GalleryMemoriesModule { }
```

### Component Selectors Reference

| Component | Selector | Module |
|-----------|----------|--------|
| GalleryComponent | `app-gallery` | GalleryMemoriesModule |
| GalleryGridComponent | `app-gallery-grid` | GalleryMemoriesModule |
| GalleryEmptyComponent | `app-gallery-empty` | GalleryMemoriesModule |
| GalleryBannerComponent | `app-gallery-banner` | GalleryMemoriesModule |
| MemoriesComponent | `app-memories` | GalleryMemoriesModule |
| MemoriesEmptyComponent | `app-memories-empty` | GalleryMemoriesModule |
| MemorySectionComponent | `app-memory-section` | GalleryMemoriesModule |
| PhotoUploadCardComponent | `app-photo-upload-card` | GalleryMemoriesModule |
| BtnEmotionComponent | `app-btn-emotion` | GalleryMemoriesModule |
| BtnCalendarComponent | `app-btn-calendar` | GalleryMemoriesModule |
| BtnPositionComponent | `app-btn-position` | GalleryMemoriesModule |
| BtnFavoritesComponent | `app-btn-favorites` | GalleryMemoriesModule |
| BtnModifyComponent | `app-btn-modify` | GalleryMemoriesModule |
| BtnDeleteComponent | `app-btn-delete` | GalleryMemoriesModule |
| TabToggleComponent | `app-tab-toggle` | GalleryMemoriesModule |
| MascotEmptyComponent | `app-mascot-empty` | GalleryMemoriesModule |

---

## Responsive Behavior

### Breakpoints

```scss
// Responsive Grid Configuration
@mixin gallery-responsive {
  // Mobile (default)
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding-inline: 12px;
  }

  // Tablet (768px+)
  @media (min-width: 768px) {
    .gallery-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding-inline: 24px;
    }

    .gallery-card--large {
      grid-column: span 1; // No longer spans 2
    }
  }

  // Desktop (1024px+)
  @media (min-width: 1024px) {
    .gallery-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      max-width: 1200px;
      margin-inline: auto;
    }
  }
}

// Memories Responsive
@mixin memories-responsive {
  // Mobile (default)
  .memories-section {
    width: 100%;

    &__scroll {
      padding-inline: 12px;
    }
  }

  // Tablet (768px+)
  @media (min-width: 768px) {
    .memories-section {
      &__scroll {
        padding-inline: 24px;
      }
    }

    .memory-card {
      width: 140px; // Slightly larger
    }
  }

  // Desktop (1024px+)
  @media (min-width: 1024px) {
    .memories-container {
      max-width: 1200px;
      margin-inline: auto;
    }
  }
}

// Banner Responsive
@mixin banner-responsive {
  .gallery-banner {
    // Mobile (default)
    width: 100%;
    max-width: 100%;

    // Tablet (768px+)
    @media (min-width: 768px) {
      width: 500px;
    }

    // Desktop (1024px+)
    @media (min-width: 1024px) {
      width: 600px;
      max-height: 80vh;
    }
  }
}
```

### Touch Interactions

```scss
// Touch-friendly enhancements
@media (hover: none) and (pointer: coarse) {
  .gallery-card {
    // Larger tap targets
    min-height: 100px;

    &__overlay {
      // Always show on touch devices
      opacity: 1;
    }
  }

  .btn-favorites,
  .btn-delete {
    // Larger touch targets
    min-width: 44px;
    min-height: 44px;
  }

  .memories-section__scroll {
    // Better touch scrolling
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
}
```

---

## Accessibilita (a11y)

### ARIA Attributes

```html
<!-- Gallery Grid -->
<div class="gallery-grid"
     role="grid"
     aria-label="Galleria foto">
  <div class="gallery-card"
       role="gridcell"
       tabindex="0"
       aria-label="Foto: {{ photo.title }}">
  </div>
</div>

<!-- Tab Toggle -->
<div class="tab-toggle" role="tablist" aria-label="Navigazione galleria">
  <button role="tab"
          [attr.aria-selected]="isActive"
          [attr.tabindex]="isActive ? 0 : -1">
  </button>
</div>

<!-- Memories Sections -->
<section aria-labelledby="giorni-title">
  <h3 id="giorni-title">GIORNI</h3>
  <div role="list" class="memories-section__scroll">
    <div role="listitem" class="memory-card">
    </div>
  </div>
</section>

<!-- Banner Modal -->
<div class="gallery-banner"
     role="dialog"
     aria-modal="true"
     aria-labelledby="banner-title">
  <h2 id="banner-title">{{ photo.title }}</h2>
</div>
```

### Keyboard Navigation

```typescript
// gallery-grid.component.ts
@HostListener('keydown', ['$event'])
onKeyDown(event: KeyboardEvent): void {
  const cards = this.el.nativeElement.querySelectorAll('.gallery-card');
  const currentIndex = Array.from(cards).indexOf(document.activeElement);

  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault();
      this.focusCard(cards, currentIndex + 1);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      this.focusCard(cards, currentIndex - 1);
      break;
    case 'ArrowDown':
      event.preventDefault();
      this.focusCard(cards, currentIndex + this.columnsCount);
      break;
    case 'ArrowUp':
      event.preventDefault();
      this.focusCard(cards, currentIndex - this.columnsCount);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      this.openPhoto(currentIndex);
      break;
  }
}
```

---

## File Structure

```
src/app/
  profile/
    gallery-memories/
      gallery/
        gallery.component.ts
        gallery.component.html
        gallery.component.scss
        gallery-grid/
          gallery-grid.component.ts
          gallery-grid.component.html
          gallery-grid.component.scss
        gallery-empty/
          gallery-empty.component.ts
          gallery-empty.component.html
          gallery-empty.component.scss
        gallery-banner/
          gallery-banner.component.ts
          gallery-banner.component.html
          gallery-banner.component.scss
      memories/
        memories.component.ts
        memories.component.html
        memories.component.scss
        memories-empty/
          memories-empty.component.ts
          memories-empty.component.html
          memories-empty.component.scss
        memory-section/
          memory-section.component.ts
          memory-section.component.html
          memory-section.component.scss
      shared/
        photo-upload-card/
        btn-emotion/
        btn-calendar/
        btn-position/
        btn-favorites/
        btn-modify/
        btn-delete/
        tab-toggle/
        mascot-empty/
      gallery-memories.module.ts
      gallery-memories-routing.module.ts
```

---

## Changelog

| Data | Versione | Modifiche |
|------|----------|-----------|
| 2025-11-28 | 1.0.0 | Documentazione iniziale Gallery & Memories |

---

**Autore:** DocArchitect Agent
**Progetto:** Fiutami
**Fonte Figma:** File Hp2WbvotldjVyTCHxXXSlH
