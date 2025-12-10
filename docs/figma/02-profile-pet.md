# Profile Pet - Figma Design Specification

> Complete technical documentation for the Pet Profile screen in Fiutami mobile app.

---

## Overview

| Property | Value |
|----------|-------|
| **Frame** | `mob_profile_pet` |
| **Node ID** | `4046:953` |
| **Dimensions** | 393 x 852px |
| **Platform** | Mobile |
| **Purpose** | Display individual pet profile with key information, actions, and interactive features |

### Related Frames

| Frame | Node ID | Dimensions | Description |
|-------|---------|------------|-------------|
| `mob_profile_pet` | `4046:953` | 393 x 852px | Main profile view |
| `Banner_info_Profile` | `12207:6047` | 399 x 771px | Info banner overlay |

---

## Component Architecture

```
mob_profile_pet
├── Image_profile_pet (Hero image container)
│   └── Profile_pet (Ellipse mask)
├── Profile_name ("THOR")
├── Info_buttons_row
│   ├── Btn_saxe (Sex)
│   ├── Btn_age (Age)
│   ├── Btn_weight (Weight)
│   └── Btn_breed (Breed)
├── Feature_buttons_row
│   ├── Btn_friend ("BANDA PELOSA")
│   ├── Btn_doc ("FATTI BESTIALI")
│   ├── Btn_Foto ("RULLINO FEROCE")
│   └── Btn_Promo (Promo banner)
├── Btn_maps (Interactive map)
└── Interactive_mascot (Animated character)
```

---

## Design Tokens

### Profile Pet Specific Tokens

```scss
// ==============================================
// PROFILE PET - DESIGN TOKENS
// File: src/styles/_tokens-profile-pet.scss
// ==============================================

:root {
  // ========== PROFILE IMAGE ==========
  --profile-pet-image-width: 513px;
  --profile-pet-image-height: 587px;
  --profile-pet-image-x: 36px;
  --profile-pet-image-y: 35px;
  --profile-pet-ellipse-width: 400px;
  --profile-pet-ellipse-height: 587px;

  // ========== NAME BADGE ==========
  --profile-name-width: 131.04px;
  --profile-name-height: 44px;
  --profile-name-x: 5.66px;
  --profile-name-y: 76px;
  --profile-name-font-size: 32px;
  --profile-name-font-weight: 700;

  // ========== INFO BUTTONS ==========
  --info-btn-width: 84.57px;
  --info-btn-height: 70px;
  --info-btn-row-gap: 11.58px;
  --info-btn-y-offset: 164px;
  --info-label-height: 21.48px;
  --info-value-y-offset: 20px;

  // Info button positions (X coordinates)
  --info-btn-sex-x: 11px;
  --info-btn-age-x: 107.14px;
  --info-btn-weight-x: 203.28px;
  --info-btn-breed-x: 299.43px;

  // ========== FEATURE BUTTONS ==========
  --feature-btn-small-width: 74px;
  --feature-btn-small-height: 95px;
  --feature-btn-medium-width: 78px;
  --feature-btn-medium-height: 93px;
  --feature-btn-large-width: 138px;
  --feature-btn-large-height: 93px;
  --feature-btn-gap: 3px;

  // ========== MAP BUTTON ==========
  --map-btn-width: 362px;
  --map-btn-height: 211px;
  --map-btn-border-radius: 16px;

  // ========== MASCOT ==========
  --mascot-width: 237px;
  --mascot-height: 121px;
  --mascot-x: 155px;
  --mascot-y: 367px;

  // ========== SPACING ==========
  --profile-section-gap: 16px;
  --profile-content-padding: 16px;
}
```

---

## Component Specifications

### 1. Image_profile_pet (Hero Container)

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 513px | `--profile-pet-image-width` |
| Height | 587px | `--profile-pet-image-height` |
| Position X | 36px | `--profile-pet-image-x` |
| Position Y | 35px | `--profile-pet-image-y` |
| Object Fit | cover | - |
| Overflow | hidden | - |

**Angular Implementation:**

```typescript
// src/app/profile/components/pet-profile-image/pet-profile-image.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pet-profile-image',
  templateUrl: './pet-profile-image.component.html',
  styleUrls: ['./pet-profile-image.component.scss']
})
export class PetProfileImageComponent {
  @Input() imageUrl: string = '';
  @Input() altText: string = 'Pet profile image';
}
```

```html
<!-- pet-profile-image.component.html -->
<div class="pet-profile-image">
  <div class="pet-profile-image__mask">
    <img
      [src]="imageUrl"
      [alt]="altText"
      class="pet-profile-image__photo"
      loading="lazy">
  </div>
</div>
```

```scss
// pet-profile-image.component.scss
@use 'src/styles/tokens' as *;

.pet-profile-image {
  position: relative;
  width: var(--profile-pet-image-width, 513px);
  height: var(--profile-pet-image-height, 587px);
  margin-left: var(--profile-pet-image-x, 36px);
  margin-top: var(--profile-pet-image-y, 35px);

  &__mask {
    width: var(--profile-pet-ellipse-width, 400px);
    height: var(--profile-pet-ellipse-height, 587px);
    border-radius: 50%;
    overflow: hidden;
  }

  &__photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
```

---

### 2. Profile_pet (Ellipse Mask)

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 400px | `--profile-pet-ellipse-width` |
| Height | 587px | `--profile-pet-ellipse-height` |
| Shape | Ellipse | - |
| Border Radius | 50% | - |
| Overflow | hidden | - |

**CSS Implementation:**

```scss
.profile-pet-mask {
  width: var(--profile-pet-ellipse-width, 400px);
  height: var(--profile-pet-ellipse-height, 587px);
  border-radius: 50%;
  overflow: hidden;

  // Soft shadow for depth
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
```

---

### 3. Profile_name (Name Badge)

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 131.04px | `--profile-name-width` |
| Height | 44px | `--profile-name-height` |
| Position X | 5.66px | `--profile-name-x` |
| Position Y | 76px | `--profile-name-y` |
| Sample Text | "THOR" | - |
| Font Family | Display | `--font-display` |
| Font Size | 32px | `--profile-name-font-size` |
| Font Weight | 700 | `--profile-name-font-weight` |
| Text Transform | uppercase | - |

**Angular Implementation:**

```typescript
// src/app/profile/components/pet-name-badge/pet-name-badge.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pet-name-badge',
  templateUrl: './pet-name-badge.component.html',
  styleUrls: ['./pet-name-badge.component.scss']
})
export class PetNameBadgeComponent {
  @Input() name: string = '';
  @Input() verified: boolean = false;
}
```

```html
<!-- pet-name-badge.component.html -->
<div class="pet-name-badge">
  <h1 class="pet-name-badge__name">{{ name }}</h1>
  <span *ngIf="verified" class="pet-name-badge__verified" aria-label="Verified pet">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 0L12.24 3.76L16.5 2.55L15.29 6.81L19 9L15.29 11.19L16.5 15.45L12.24 14.24L10 18L7.76 14.24L3.5 15.45L4.71 11.19L1 9L4.71 6.81L3.5 2.55L7.76 3.76L10 0Z"/>
    </svg>
  </span>
</div>
```

```scss
// pet-name-badge.component.scss
@use 'src/styles/tokens' as *;

.pet-name-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  left: var(--profile-name-x, 5.66px);
  top: var(--profile-name-y, 76px);
  min-width: var(--profile-name-width, 131.04px);
  height: var(--profile-name-height, 44px);

  &__name {
    font-family: var(--font-display);
    font-size: var(--profile-name-font-size, 32px);
    font-weight: var(--profile-name-font-weight, 700);
    text-transform: uppercase;
    color: var(--text);
    margin: 0;
    letter-spacing: 0.02em;
  }

  &__verified {
    color: var(--accent);
    display: flex;
    align-items: center;
  }
}
```

---

### 4. Info Buttons Row

Four horizontal buttons displaying pet quick-info.

#### 4.1 Btn_saxe (Sex Button)

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 84.57px | `--info-btn-width` |
| Height | 70px | `--info-btn-height` |
| Position X | 11px | `--info-btn-sex-x` |
| Position Y | 164px | `--info-btn-y-offset` |
| Label | "SESSO" | - |
| Icon | Gender symbol | - |

#### 4.2 Btn_age (Age Button)

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 84.57px | `--info-btn-width` |
| Height | 70px | `--info-btn-height` |
| Position X | 107.14px | `--info-btn-age-x` |
| Position Y | 164px | `--info-btn-y-offset` |
| Label | "ETA'" | - |
| Value | "9 ANNI" | - |

#### 4.3 Btn_weight (Weight Button)

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 84.57px | `--info-btn-width` |
| Height | 70px | `--info-btn-height` |
| Position X | 203.28px | `--info-btn-weight-x` |
| Position Y | 164px | `--info-btn-y-offset` |
| Label | "PESO" | - |
| Value | "30KG" | - |

#### 4.4 Btn_breed (Breed Button)

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 84.57px | `--info-btn-width` |
| Height | 70px | `--info-btn-height` |
| Position X | 299.43px | `--info-btn-breed-x` |
| Position Y | 164px | `--info-btn-y-offset` |
| Label | "RAZZA" | - |
| Value | "Ameri.." | - |

**Angular Implementation (Shared Info Button):**

```typescript
// src/app/profile/components/pet-info-button/pet-info-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

export type InfoButtonType = 'sex' | 'age' | 'weight' | 'breed';

@Component({
  selector: 'app-pet-info-button',
  templateUrl: './pet-info-button.component.html',
  styleUrls: ['./pet-info-button.component.scss']
})
export class PetInfoButtonComponent {
  @Input() type: InfoButtonType = 'sex';
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() icon?: string;
  @Output() clicked = new EventEmitter<InfoButtonType>();

  onClick(): void {
    this.clicked.emit(this.type);
  }
}
```

```html
<!-- pet-info-button.component.html -->
<button
  class="pet-info-btn"
  [class.pet-info-btn--sex]="type === 'sex'"
  [class.pet-info-btn--age]="type === 'age'"
  [class.pet-info-btn--weight]="type === 'weight'"
  [class.pet-info-btn--breed]="type === 'breed'"
  (click)="onClick()"
  type="button"
  [attr.aria-label]="label + ': ' + value">

  <span class="pet-info-btn__label">{{ label }}</span>

  <ng-container *ngIf="icon; else valueTemplate">
    <img [src]="icon" [alt]="value" class="pet-info-btn__icon">
  </ng-container>

  <ng-template #valueTemplate>
    <span class="pet-info-btn__value">{{ value }}</span>
  </ng-template>
</button>
```

```scss
// pet-info-button.component.scss
@use 'src/styles/tokens' as *;

.pet-info-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: var(--info-btn-width, 84.57px);
  height: var(--info-btn-height, 70px);
  padding: 8px 4px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--shadow-sm);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }

  &__label {
    font-family: var(--font-sans);
    font-size: var(--fs-micro, 11px);
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text);
    opacity: 0.7;
    height: var(--info-label-height, 21.48px);
    display: flex;
    align-items: center;
  }

  &__value {
    font-family: var(--font-sans);
    font-size: var(--fs-small, 13px);
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text);
    margin-top: var(--info-value-y-offset, 4px);
  }

  &__icon {
    width: 24px;
    height: 24px;
    margin-top: 4px;
  }
}
```

**Info Buttons Row Container:**

```typescript
// src/app/profile/components/pet-info-row/pet-info-row.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { InfoButtonType } from '../pet-info-button/pet-info-button.component';

export interface PetInfo {
  sex: string;
  sexIcon?: string;
  age: string;
  weight: string;
  breed: string;
}

@Component({
  selector: 'app-pet-info-row',
  templateUrl: './pet-info-row.component.html',
  styleUrls: ['./pet-info-row.component.scss']
})
export class PetInfoRowComponent {
  @Input() petInfo: PetInfo = {
    sex: '',
    age: '',
    weight: '',
    breed: ''
  };
  @Output() infoClicked = new EventEmitter<InfoButtonType>();

  onInfoClick(type: InfoButtonType): void {
    this.infoClicked.emit(type);
  }
}
```

```html
<!-- pet-info-row.component.html -->
<div class="pet-info-row" role="group" aria-label="Pet information">
  <app-pet-info-button
    type="sex"
    label="SESSO"
    [value]="petInfo.sex"
    [icon]="petInfo.sexIcon"
    (clicked)="onInfoClick($event)">
  </app-pet-info-button>

  <app-pet-info-button
    type="age"
    label="ETA'"
    [value]="petInfo.age"
    (clicked)="onInfoClick($event)">
  </app-pet-info-button>

  <app-pet-info-button
    type="weight"
    label="PESO"
    [value]="petInfo.weight"
    (clicked)="onInfoClick($event)">
  </app-pet-info-button>

  <app-pet-info-button
    type="breed"
    label="RAZZA"
    [value]="petInfo.breed"
    (clicked)="onInfoClick($event)">
  </app-pet-info-button>
</div>
```

```scss
// pet-info-row.component.scss
@use 'src/styles/tokens' as *;

.pet-info-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: var(--info-btn-row-gap, 11.58px);
  padding: 0 var(--profile-content-padding, 16px);
  margin-top: var(--info-btn-y-offset, 164px);

  // Responsive: scroll on very small screens
  @media (max-width: 380px) {
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 8px;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
```

---

### 5. Feature Buttons Row

Four action buttons for pet-related features.

#### 5.1 Btn_friend ("BANDA PELOSA")

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 74px | `--feature-btn-small-width` |
| Height | 95px | `--feature-btn-small-height` |
| Label | "BANDA PELOSA" | - |
| Icon | Friends/Group icon | - |
| Action | Navigate to pet friends | - |

#### 5.2 Btn_doc ("FATTI BESTIALI")

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 74px | `--feature-btn-small-width` |
| Height | 95px | `--feature-btn-small-height` |
| Label | "FATTI BESTIALI" | - |
| Icon | Document/Facts icon | - |
| Action | Navigate to pet facts | - |

#### 5.3 Btn_Foto ("RULLINO FEROCE")

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 78px | `--feature-btn-medium-width` |
| Height | 93px | `--feature-btn-medium-height` |
| Label | "RULLINO FEROCE" | - |
| Icon | Camera/Gallery icon | - |
| Action | Navigate to photo gallery | - |

#### 5.4 Btn_Promo (Promo Banner)

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 138px | `--feature-btn-large-width` |
| Height | 93px | `--feature-btn-large-height` |
| Type | Promotional banner | - |
| Action | Navigate to promotions | - |

**Angular Implementation:**

```typescript
// src/app/profile/components/pet-feature-button/pet-feature-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

export type FeatureButtonSize = 'small' | 'medium' | 'large';
export type FeatureButtonType = 'friends' | 'facts' | 'photos' | 'promo';

@Component({
  selector: 'app-pet-feature-button',
  templateUrl: './pet-feature-button.component.html',
  styleUrls: ['./pet-feature-button.component.scss']
})
export class PetFeatureButtonComponent {
  @Input() type: FeatureButtonType = 'friends';
  @Input() size: FeatureButtonSize = 'small';
  @Input() label: string = '';
  @Input() icon?: string;
  @Input() backgroundImage?: string;
  @Output() clicked = new EventEmitter<FeatureButtonType>();

  onClick(): void {
    this.clicked.emit(this.type);
  }
}
```

```html
<!-- pet-feature-button.component.html -->
<button
  class="pet-feature-btn"
  [class.pet-feature-btn--small]="size === 'small'"
  [class.pet-feature-btn--medium]="size === 'medium'"
  [class.pet-feature-btn--large]="size === 'large'"
  [class.pet-feature-btn--promo]="type === 'promo'"
  [style.background-image]="backgroundImage ? 'url(' + backgroundImage + ')' : null"
  (click)="onClick()"
  type="button"
  [attr.aria-label]="label">

  <div class="pet-feature-btn__content">
    <img *ngIf="icon" [src]="icon" [alt]="''" class="pet-feature-btn__icon" aria-hidden="true">
    <span class="pet-feature-btn__label">{{ label }}</span>
  </div>
</button>
```

```scss
// pet-feature-button.component.scss
@use 'src/styles/tokens' as *;

.pet-feature-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: var(--brand);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
  background-size: cover;
  background-position: center;

  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: scale(0.98);
  }

  // Size variants
  &--small {
    width: var(--feature-btn-small-width, 74px);
    height: var(--feature-btn-small-height, 95px);
  }

  &--medium {
    width: var(--feature-btn-medium-width, 78px);
    height: var(--feature-btn-medium-height, 93px);
  }

  &--large {
    width: var(--feature-btn-large-width, 138px);
    height: var(--feature-btn-large-height, 93px);
  }

  &--promo {
    background: linear-gradient(135deg, var(--accent) 0%, var(--brand) 100%);
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  &__label {
    font-family: var(--font-sans);
    font-size: var(--fs-micro, 11px);
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-inverse);
    text-align: center;
    line-height: 1.2;
    max-width: 100%;
    word-wrap: break-word;
  }
}
```

**Feature Buttons Row Container:**

```typescript
// src/app/profile/components/pet-feature-row/pet-feature-row.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { FeatureButtonType } from '../pet-feature-button/pet-feature-button.component';

@Component({
  selector: 'app-pet-feature-row',
  templateUrl: './pet-feature-row.component.html',
  styleUrls: ['./pet-feature-row.component.scss']
})
export class PetFeatureRowComponent {
  @Output() featureClicked = new EventEmitter<FeatureButtonType>();

  onFeatureClick(type: FeatureButtonType): void {
    this.featureClicked.emit(type);
  }
}
```

```html
<!-- pet-feature-row.component.html -->
<div class="pet-feature-row" role="group" aria-label="Pet features">
  <app-pet-feature-button
    type="friends"
    size="small"
    label="BANDA PELOSA"
    icon="assets/icons/friends.svg"
    (clicked)="onFeatureClick($event)">
  </app-pet-feature-button>

  <app-pet-feature-button
    type="facts"
    size="small"
    label="FATTI BESTIALI"
    icon="assets/icons/document.svg"
    (clicked)="onFeatureClick($event)">
  </app-pet-feature-button>

  <app-pet-feature-button
    type="photos"
    size="medium"
    label="RULLINO FEROCE"
    icon="assets/icons/camera.svg"
    (clicked)="onFeatureClick($event)">
  </app-pet-feature-button>

  <app-pet-feature-button
    type="promo"
    size="large"
    label="PROMO"
    backgroundImage="assets/images/promo-banner.jpg"
    (clicked)="onFeatureClick($event)">
  </app-pet-feature-button>
</div>
```

```scss
// pet-feature-row.component.scss
@use 'src/styles/tokens' as *;

.pet-feature-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--feature-btn-gap, 3px);
  padding: 0 var(--profile-content-padding, 16px);
  margin-top: var(--profile-section-gap, 16px);

  @media (max-width: 380px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
}
```

---

### 6. Btn_maps (Interactive Map)

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 362px | `--map-btn-width` |
| Height | 211px | `--map-btn-height` |
| Border Radius | 16px | `--map-btn-border-radius` |
| Content | Interactive map preview | - |
| Action | Navigate to full map view | - |

**Angular Implementation:**

```typescript
// src/app/profile/components/pet-map-button/pet-map-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface MapLocation {
  lat: number;
  lng: number;
  label?: string;
}

@Component({
  selector: 'app-pet-map-button',
  templateUrl: './pet-map-button.component.html',
  styleUrls: ['./pet-map-button.component.scss']
})
export class PetMapButtonComponent {
  @Input() location?: MapLocation;
  @Input() previewImage?: string;
  @Input() label: string = 'Visualizza mappa';
  @Output() clicked = new EventEmitter<MapLocation | undefined>();

  onClick(): void {
    this.clicked.emit(this.location);
  }
}
```

```html
<!-- pet-map-button.component.html -->
<button
  class="pet-map-btn"
  (click)="onClick()"
  type="button"
  [attr.aria-label]="label">

  <div class="pet-map-btn__preview"
       [style.background-image]="previewImage ? 'url(' + previewImage + ')' : null">

    <div class="pet-map-btn__overlay">
      <div class="pet-map-btn__pin" *ngIf="location">
        <svg width="24" height="32" viewBox="0 0 24 32" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
        </svg>
      </div>

      <span class="pet-map-btn__label">{{ label }}</span>
    </div>
  </div>
</button>
```

```scss
// pet-map-button.component.scss
@use 'src/styles/tokens' as *;

.pet-map-btn {
  display: block;
  width: var(--map-btn-width, 362px);
  height: var(--map-btn-height, 211px);
  max-width: 100%;
  padding: 0;
  border: none;
  border-radius: var(--map-btn-border-radius, 16px);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
  margin: var(--profile-section-gap, 16px) auto;

  &:hover {
    transform: scale(1.02);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: scale(0.99);
  }

  &__preview {
    width: 100%;
    height: 100%;
    background-color: #e0e0e0;
    background-size: cover;
    background-position: center;
    position: relative;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
  }

  &__pin {
    color: var(--brand);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    margin-bottom: 8px;
    animation: bounce 2s ease-in-out infinite;
  }

  &__label {
    font-family: var(--font-sans);
    font-size: var(--fs-small, 13px);
    font-weight: 600;
    color: var(--text-inverse);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

---

### 7. Interactive Mascot

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 237px | `--mascot-width` |
| Height | 121px | `--mascot-height` |
| Position X | 155px | `--mascot-x` |
| Position Y | 367px | `--mascot-y` |
| Animation | Interactive/Animated | - |
| Purpose | Brand engagement element | - |

**Angular Implementation:**

```typescript
// src/app/shared/components/mascot/mascot.component.ts
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

export type MascotState = 'idle' | 'happy' | 'waving' | 'sleeping';

@Component({
  selector: 'app-mascot',
  templateUrl: './mascot.component.html',
  styleUrls: ['./mascot.component.scss']
})
export class MascotComponent {
  @Input() state: MascotState = 'idle';
  @Input() interactive: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() interacted = new EventEmitter<void>();

  isAnimating: boolean = false;

  @HostListener('click')
  onClick(): void {
    if (this.interactive && !this.isAnimating) {
      this.isAnimating = true;
      this.interacted.emit();

      // Reset animation state after animation completes
      setTimeout(() => {
        this.isAnimating = false;
      }, 1000);
    }
  }
}
```

```html
<!-- mascot.component.html -->
<div
  class="mascot"
  [class.mascot--small]="size === 'small'"
  [class.mascot--medium]="size === 'medium'"
  [class.mascot--large]="size === 'large'"
  [class.mascot--interactive]="interactive"
  [class.mascot--animating]="isAnimating"
  [attr.data-state]="state"
  role="img"
  aria-label="Fiutami mascot">

  <img
    [src]="'assets/mascot/mascot-' + state + '.svg'"
    [alt]="'Fiutami mascot - ' + state"
    class="mascot__image">
</div>
```

```scss
// mascot.component.scss
@use 'src/styles/tokens' as *;

.mascot {
  position: absolute;
  left: var(--mascot-x, 155px);
  top: var(--mascot-y, 367px);
  z-index: 10;

  &--small {
    width: calc(var(--mascot-width, 237px) * 0.6);
    height: calc(var(--mascot-height, 121px) * 0.6);
  }

  &--medium {
    width: var(--mascot-width, 237px);
    height: var(--mascot-height, 121px);
  }

  &--large {
    width: calc(var(--mascot-width, 237px) * 1.4);
    height: calc(var(--mascot-height, 121px) * 1.4);
  }

  &--interactive {
    cursor: pointer;

    &:hover {
      .mascot__image {
        transform: scale(1.05);
      }
    }
  }

  &--animating {
    .mascot__image {
      animation: mascot-bounce 0.6s ease-out;
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.2s ease;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
}

@keyframes mascot-bounce {
  0% { transform: scale(1); }
  25% { transform: scale(1.1) rotate(-5deg); }
  50% { transform: scale(0.95) rotate(5deg); }
  75% { transform: scale(1.05) rotate(-2deg); }
  100% { transform: scale(1) rotate(0); }
}
```

---

## Complete Profile Pet Page Component

```typescript
// src/app/profile/pages/pet-profile/pet-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PetInfo } from '../../components/pet-info-row/pet-info-row.component';
import { InfoButtonType } from '../../components/pet-info-button/pet-info-button.component';
import { FeatureButtonType } from '../../components/pet-feature-button/pet-feature-button.component';
import { MapLocation } from '../../components/pet-map-button/pet-map-button.component';

interface Pet {
  id: string;
  name: string;
  imageUrl: string;
  verified: boolean;
  info: PetInfo;
  location?: MapLocation;
}

@Component({
  selector: 'app-pet-profile',
  templateUrl: './pet-profile.component.html',
  styleUrls: ['./pet-profile.component.scss']
})
export class PetProfileComponent implements OnInit {
  pet: Pet = {
    id: '',
    name: 'THOR',
    imageUrl: 'assets/images/pets/thor.jpg',
    verified: true,
    info: {
      sex: 'M',
      sexIcon: 'assets/icons/male.svg',
      age: '9 ANNI',
      weight: '30KG',
      breed: 'Ameri..'
    },
    location: {
      lat: 41.9028,
      lng: 12.4964,
      label: 'Roma, Italia'
    }
  };

  mapPreviewImage: string = 'assets/images/map-preview.jpg';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const petId = this.route.snapshot.paramMap.get('id');
    if (petId) {
      this.loadPet(petId);
    }
  }

  private loadPet(id: string): void {
    // TODO: Load pet data from service
    console.log('Loading pet:', id);
  }

  onInfoClick(type: InfoButtonType): void {
    console.log('Info clicked:', type);
    // Navigate to edit or show modal
  }

  onFeatureClick(type: FeatureButtonType): void {
    switch (type) {
      case 'friends':
        this.router.navigate(['/pet', this.pet.id, 'friends']);
        break;
      case 'facts':
        this.router.navigate(['/pet', this.pet.id, 'facts']);
        break;
      case 'photos':
        this.router.navigate(['/pet', this.pet.id, 'gallery']);
        break;
      case 'promo':
        this.router.navigate(['/promotions']);
        break;
    }
  }

  onMapClick(location?: MapLocation): void {
    if (location) {
      this.router.navigate(['/map'], {
        queryParams: { lat: location.lat, lng: location.lng }
      });
    }
  }

  onMascotInteract(): void {
    console.log('Mascot interacted!');
    // Play sound, show easter egg, etc.
  }
}
```

```html
<!-- pet-profile.component.html -->
<main class="pet-profile">
  <!-- Hero Section -->
  <section class="pet-profile__hero">
    <app-pet-profile-image
      [imageUrl]="pet.imageUrl"
      [altText]="pet.name + ' profile photo'">
    </app-pet-profile-image>

    <app-pet-name-badge
      [name]="pet.name"
      [verified]="pet.verified">
    </app-pet-name-badge>
  </section>

  <!-- Info Section -->
  <section class="pet-profile__info" aria-label="Pet quick information">
    <app-pet-info-row
      [petInfo]="pet.info"
      (infoClicked)="onInfoClick($event)">
    </app-pet-info-row>
  </section>

  <!-- Features Section -->
  <section class="pet-profile__features" aria-label="Pet features">
    <app-pet-feature-row
      (featureClicked)="onFeatureClick($event)">
    </app-pet-feature-row>
  </section>

  <!-- Map Section -->
  <section class="pet-profile__map" aria-label="Pet location">
    <app-pet-map-button
      [location]="pet.location"
      [previewImage]="mapPreviewImage"
      label="Trova {{ pet.name }}"
      (clicked)="onMapClick($event)">
    </app-pet-map-button>
  </section>

  <!-- Mascot -->
  <app-mascot
    state="idle"
    [interactive]="true"
    size="medium"
    (interacted)="onMascotInteract()">
  </app-mascot>
</main>
```

```scss
// pet-profile.component.scss
@use 'src/styles/tokens' as *;

.pet-profile {
  position: relative;
  width: 100%;
  min-height: 100vh;
  max-width: 393px;
  margin: 0 auto;
  background-color: var(--bg);
  overflow-x: hidden;

  &__hero {
    position: relative;
    width: 100%;
  }

  &__info {
    margin-top: var(--profile-section-gap, 16px);
  }

  &__features {
    margin-top: var(--profile-section-gap, 16px);
  }

  &__map {
    margin-top: var(--profile-section-gap, 16px);
    padding: 0 var(--profile-content-padding, 16px);
  }
}

// Responsive adjustments
@media (min-width: 768px) {
  .pet-profile {
    max-width: 500px;

    &__info,
    &__features {
      padding: 0 24px;
    }
  }
}
```

---

## Spacing System Summary

| Token | Value | Usage |
|-------|-------|-------|
| `--info-btn-row-gap` | 11.58px (~12px) | Gap between info buttons |
| `--feature-btn-gap` | 3px | Gap between feature buttons (tight) |
| `--info-label-height` | 21.48px | Height of info button labels |
| `--info-value-y-offset` | 20px | Vertical offset for info values |
| `--profile-section-gap` | 16px | Gap between major sections |
| `--profile-content-padding` | 16px | Horizontal content padding |

---

## Accessibility Checklist

- [x] All buttons have `aria-label` attributes
- [x] Interactive elements are keyboard accessible
- [x] Image elements have `alt` text
- [x] Sections use semantic `<section>` tags with `aria-label`
- [x] Role groups defined for button rows
- [x] Color contrast meets WCAG 2.1 AA standards
- [x] Touch targets are at least 44x44px

---

## File Structure

```
src/app/profile/
├── profile.module.ts
├── profile-routing.module.ts
├── components/
│   ├── pet-profile-image/
│   │   ├── pet-profile-image.component.ts
│   │   ├── pet-profile-image.component.html
│   │   ├── pet-profile-image.component.scss
│   │   └── pet-profile-image.component.spec.ts
│   ├── pet-name-badge/
│   │   ├── pet-name-badge.component.ts
│   │   ├── pet-name-badge.component.html
│   │   ├── pet-name-badge.component.scss
│   │   └── pet-name-badge.component.spec.ts
│   ├── pet-info-button/
│   │   ├── pet-info-button.component.ts
│   │   ├── pet-info-button.component.html
│   │   ├── pet-info-button.component.scss
│   │   └── pet-info-button.component.spec.ts
│   ├── pet-info-row/
│   │   ├── pet-info-row.component.ts
│   │   ├── pet-info-row.component.html
│   │   ├── pet-info-row.component.scss
│   │   └── pet-info-row.component.spec.ts
│   ├── pet-feature-button/
│   │   ├── pet-feature-button.component.ts
│   │   ├── pet-feature-button.component.html
│   │   ├── pet-feature-button.component.scss
│   │   └── pet-feature-button.component.spec.ts
│   ├── pet-feature-row/
│   │   ├── pet-feature-row.component.ts
│   │   ├── pet-feature-row.component.html
│   │   ├── pet-feature-row.component.scss
│   │   └── pet-feature-row.component.spec.ts
│   └── pet-map-button/
│       ├── pet-map-button.component.ts
│       ├── pet-map-button.component.html
│       ├── pet-map-button.component.scss
│       └── pet-map-button.component.spec.ts
├── pages/
│   └── pet-profile/
│       ├── pet-profile.component.ts
│       ├── pet-profile.component.html
│       ├── pet-profile.component.scss
│       └── pet-profile.component.spec.ts
└── models/
    └── pet.model.ts
```

---

## Related Documentation

- [01-home-start.md](./01-home-start.md) - Home/Start screen
- [03-profile-user.md](./03-profile-user.md) - User profile screen
- [Design Tokens](./tokens/README.md) - Complete token reference
- [Responsive Guidelines](./responsive/README.md) - Breakpoint system

---

**Last Updated:** 2025-11-28
**Figma File:** Fiutami Design System
**Node IDs:** `4046:953`, `12207:6047`
