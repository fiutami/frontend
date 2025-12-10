# Fiutami - Home & Navigation Components

> Documentazione tecnica Figma per i componenti di Home e Navigation del progetto Fiutami.
>
> **Frame Principale:** mob_home_main (node-id: 2002:3191)
> **Dimensioni:** 390x844px (iPhone 14 Pro)
> **Last Updated:** 2025-11-28

---

## Indice

1. [Overview Frame Principale](#overview-frame-principale)
2. [Tab_bar_menu](#tab_bar_menu)
3. [logo_Fiutami_1536](#logo_fiutami_1536)
4. [Btn_TornaIndietro](#btn_tornaindietro)
5. [Btn_drawer_menu](#btn_drawer_menu)
6. [Btn_Profile](#btn_profile)
7. [Design Tokens Reference](#design-tokens-reference)
8. [Angular Component Mapping](#angular-component-mapping)

---

## Overview Frame Principale

### mob_home_main

- **Figma Node ID:** 2002:3191
- **Tipo:** Frame (Mobile Screen)
- **Dimensioni:** W: 390px, H: 844px
- **Breakpoint:** Mobile (xs/sm)

### Layout Structure

```
mob_home_main (390x844)
|-- Header Area (Y: 0-150)
|   |-- Btn_TornaIndietro (left)
|   |-- logo_Fiutami_1536 (center)
|   |-- Btn_drawer_menu (right)
|   |-- Btn_Profile (optional)
|
|-- Content Area (Y: 150-773)
|   |-- [Page-specific content]
|
|-- Tab_bar_menu (Y: 773-852)
    |-- Navigation icons
```

### SCSS Variables - Frame

```scss
// Frame Dimensions
$mob-home-main-width: 390px;
$mob-home-main-height: 844px;

// Safe Areas
$safe-area-top: 47px;    // iPhone notch
$safe-area-bottom: 34px; // Home indicator

// Content Areas
$header-height: 150px;
$tab-bar-height: 79px;
$content-area-height: calc(100vh - #{$header-height} - #{$tab-bar-height});
```

---

## Tab_bar_menu

Barra di navigazione inferiore con icone per le sezioni principali dell'app.

- **Figma Node ID:** (da Tab_bar_menu frame)
- **Posizione:** X: 0px, Y: 773px (bottom-fixed su viewport 844px)
- **Dimensioni:** W: 390px, H: 79px
- **Tipo:** Frame/Instance

### Gerarchia Figli

| Elemento | Posizione Relativa | Dimensioni | Descrizione |
|----------|-------------------|------------|-------------|
| Tab_Home | X: ~39px | 50x50px | Icona Home (attiva) |
| Tab_Search | X: ~117px | 50x50px | Icona Cerca |
| Tab_Add | X: ~195px | 60x60px | Icona Aggiungi (centrale, elevated) |
| Tab_Favorites | X: ~273px | 50x50px | Icona Preferiti |
| Tab_Profile | X: ~351px | 50x50px | Icona Profilo |

### Specifiche Visive

- **Background Color:** $color-background-primary (#FFFFFF)
- **Border Top:** 1px solid $color-border-secondary
- **Shadow:** $shadow-elevated (0 -2px 10px rgba(0,0,0,0.08))
- **Safe Area Padding:** 34px (Home Indicator)

### Angular Mapping

- **Selector:** `app-tab-bar-menu`
- **Template:** `tab-bar-menu.component.html`
- **Module:** `SharedModule` o `NavigationModule`

### SCSS Variables

```scss
// Tab Bar Dimensions
$tab-bar-menu-width: 390px;
$tab-bar-menu-height: 79px;
$tab-bar-menu-position-y: 773px;

// Tab Bar Spacing
$tab-bar-padding-horizontal: 16px;
$tab-bar-safe-area-bottom: 34px;
$tab-bar-icon-size: 50px;
$tab-bar-icon-size-center: 60px;

// Tab Bar Colors
$tab-bar-bg: $color-background-primary;
$tab-bar-border: $color-border-secondary;
$tab-bar-icon-active: $color-primary-500;
$tab-bar-icon-inactive: $color-text-secondary;

// Tab Bar Shadow
$tab-bar-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
```

### Responsive Behavior

| Breakpoint | Comportamento |
|------------|---------------|
| Mobile (xs) | Fixed bottom, full width, 5 tabs visibili |
| Tablet (md) | Fixed bottom, max-width 480px, centered |
| Desktop (lg) | Nascosta - usa sidebar navigation |

### Angular Component Interface

```typescript
interface TabBarMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  isActive: boolean;
  badge?: number;
}

@Input() items: TabBarMenuItem[];
@Input() activeTab: string;
@Output() tabSelected = new EventEmitter<string>();
```

---

## logo_Fiutami_1536

Logo wordmark principale di Fiutami, posizionato al centro dell'header.

- **Figma Node ID:** 1:14
- **Posizione:** X: 126px, Y: 99px (centrato orizzontalmente)
- **Dimensioni:** W: 142px, H: 34px
- **Tipo:** Instance (Logo Component)

### Gerarchia Figli

| Elemento | Tipo | Descrizione |
|----------|------|-------------|
| Wordmark SVG | Vector | Testo "FiutaMi" stilizzato |
| Color Fill | Style | $color-primary-500 o $color-text-inverse |

### Specifiche Visive

- **Aspect Ratio:** 4.18:1 (width/height)
- **Color Variants:**
  - Primary: $color-primary-500 (#F5A623)
  - Inverse: $color-text-inverse (#FFFFFF)
  - Dark: $color-text-primary (#111111)
- **Drop Shadow:** 0 2px 12px rgba(0, 0, 0, 0.4)

### Angular Mapping

- **Selector:** `app-logo-fiutami`
- **Template:** `logo-fiutami.component.html`
- **Module:** `SharedModule`

### SCSS Variables

```scss
// Logo Dimensions
$logo-fiutami-width: 142px;
$logo-fiutami-height: 34px;
$logo-fiutami-position-x: 126px;
$logo-fiutami-position-y: 99px;

// Logo Responsive Sizes
$logo-fiutami-width-mobile: clamp(140px, 38vw, 170px);
$logo-fiutami-width-tablet: clamp(170px, 25vw, 210px);
$logo-fiutami-width-desktop: clamp(200px, 16vw, 250px);

// Logo Colors
$logo-color-primary: $color-primary-500;
$logo-color-inverse: $color-text-inverse;
$logo-color-dark: $color-text-primary;

// Logo Effects
$logo-drop-shadow: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.4));
```

### Responsive Behavior

| Breakpoint | Width | Height | Behavior |
|------------|-------|--------|----------|
| Mobile (xs) | 140-170px | auto | Centered, clamp sizing |
| Tablet (md) | 170-210px | auto | Centered, clamp sizing |
| Desktop (lg) | 200-250px | auto | Centered, clamp sizing |
| Desktop (xl) | 230-280px | auto | Max size capped |

### Angular Component Interface

```typescript
type LogoVariant = 'full' | 'icon' | 'wordmark';
type LogoColor = 'primary' | 'white' | 'dark';
type LogoSize = 'small' | 'medium' | 'large';

@Input() variant: LogoVariant = 'full';
@Input() color: LogoColor = 'primary';
@Input() size: LogoSize = 'medium';
@Input() clickable: boolean = true;
@Output() logoClick = new EventEmitter<void>();
```

---

## Btn_TornaIndietro

Pulsante di navigazione "Back" per tornare alla schermata precedente.

- **Figma Node ID:** 1:38
- **Posizione:** X: 16px, Y: 99px (tipicamente top-left con padding)
- **Dimensioni:** W: 34px, H: 34px
- **Tipo:** Instance (Icon Button)

### Gerarchia Figli

| Elemento | Tipo | Dimensioni | Descrizione |
|----------|------|------------|-------------|
| Icon Container | Frame | 34x34px | Wrapper con hit area |
| Arrow Icon | Vector | 24x24px | Icona freccia sinistra |
| Touch Target | Invisible | 44x44px | Area touch espansa (A11Y) |

### Specifiche Visive

- **Icon Size:** 24x24px (dentro container 34x34px)
- **Icon Color:** $color-text-primary (#111111)
- **Icon Hover:** $color-primary-500
- **Background:** transparent
- **Touch Target:** 44x44px (WCAG 2.1 compliant)

### Angular Mapping

- **Selector:** `app-btn-torna-indietro` o `app-back-button`
- **Template:** `back-button.component.html`
- **Module:** `SharedModule`

### SCSS Variables

```scss
// Back Button Dimensions
$btn-back-width: 34px;
$btn-back-height: 34px;
$btn-back-icon-size: 24px;
$btn-back-touch-target: 44px;

// Back Button Position
$btn-back-position-x: 16px;
$btn-back-position-y: 99px;

// Back Button Colors
$btn-back-color: $color-text-primary;
$btn-back-color-hover: $color-primary-500;
$btn-back-background: transparent;

// Back Button Spacing
$btn-back-padding: $spacing-sm;
$btn-back-gap: $spacing-sm;
```

### Responsive Behavior

| Breakpoint | Comportamento |
|------------|---------------|
| Mobile (xs) | Solo icona, 34x34px |
| Tablet (md) | Icona + label opzionale |
| Desktop (lg) | Icona + label "Indietro" |

### Angular Component Interface

```typescript
type BackButtonVariant = 'icon' | 'text' | 'both';

@Input() variant: BackButtonVariant = 'icon';
@Input() label: string = 'Indietro';
@Input() showLabel: boolean = false;
@Input() disabled: boolean = false;
@Output() backClick = new EventEmitter<void>();
```

### Accessibility

```html
<button
  type="button"
  class="back-button"
  [attr.aria-label]="'Torna alla pagina precedente'"
  (click)="onBackClick()"
  (keydown.enter)="onBackClick()"
  (keydown.space)="onBackClick()">
  <svg class="back-button__icon" aria-hidden="true">...</svg>
  <span class="back-button__label" *ngIf="showLabel">{{ label }}</span>
</button>
```

---

## Btn_drawer_menu

Pulsante per aprire il menu drawer laterale (hamburger menu).

- **Figma Node ID:** (Btn_drawer_menu)
- **Posizione:** X: 339px, Y: 32px
- **Dimensioni:** W: 34px, H: 60.99px
- **Tipo:** Instance (Icon Button)

### Gerarchia Figli

| Elemento | Tipo | Dimensioni | Descrizione |
|----------|------|------------|-------------|
| Icon Container | Frame | 34x34px | Wrapper principale |
| Hamburger Lines | Vector Group | 24x18px | 3 linee orizzontali |
| Touch Target | Invisible | 44x44px | Area touch espansa |

### Specifiche Visive

- **Icon Pattern:** 3 linee orizzontali (hamburger)
- **Line Width:** 24px
- **Line Height:** 2px
- **Line Gap:** 6px
- **Icon Color:** $color-text-primary (#111111)
- **Background:** transparent

### Angular Mapping

- **Selector:** `app-btn-drawer-menu` o `app-hamburger-menu`
- **Template:** `drawer-menu-button.component.html`
- **Module:** `SharedModule` o `NavigationModule`

### SCSS Variables

```scss
// Drawer Menu Button Dimensions
$btn-drawer-width: 34px;
$btn-drawer-height: 60.99px;
$btn-drawer-icon-width: 24px;
$btn-drawer-icon-height: 18px;

// Drawer Menu Button Position
$btn-drawer-position-x: 339px;
$btn-drawer-position-y: 32px;

// Hamburger Icon Specs
$hamburger-line-width: 24px;
$hamburger-line-height: 2px;
$hamburger-line-gap: 6px;
$hamburger-line-count: 3;

// Drawer Menu Button Colors
$btn-drawer-color: $color-text-primary;
$btn-drawer-color-hover: $color-primary-500;
$btn-drawer-background: transparent;
```

### Responsive Behavior

| Breakpoint | Comportamento |
|------------|---------------|
| Mobile (xs) | Visibile, hamburger icon |
| Tablet (md) | Visibile, hamburger icon |
| Desktop (lg) | Nascosto - sidebar sempre visibile |

### Angular Component Interface

```typescript
@Input() isOpen: boolean = false;
@Input() disabled: boolean = false;
@Output() menuToggle = new EventEmitter<boolean>();

// Animation state for hamburger-to-X transform
animationState: 'hamburger' | 'close' = 'hamburger';
```

### Accessibility

```html
<button
  type="button"
  class="drawer-menu-button"
  [attr.aria-expanded]="isOpen"
  [attr.aria-label]="isOpen ? 'Chiudi menu' : 'Apri menu'"
  aria-controls="drawer-menu"
  (click)="onToggle()">
  <span class="drawer-menu-button__line"></span>
  <span class="drawer-menu-button__line"></span>
  <span class="drawer-menu-button__line"></span>
</button>
```

---

## Btn_Profile

Pulsante circolare per accedere al profilo utente.

- **Figma Node ID:** (Btn_Profile)
- **Posizione:** X: [variabile], Y: [variabile] (tipicamente top-right)
- **Dimensioni:** W: 34px, H: 34px
- **Tipo:** Ellipse/Circle (Avatar Button)

### Gerarchia Figli

| Elemento | Tipo | Dimensioni | Descrizione |
|----------|------|------------|-------------|
| Circle Container | Ellipse | 34x34px | Wrapper circolare |
| Avatar Image | Image | 34x34px | Foto profilo (se presente) |
| Default Icon | Vector | 24x24px | Icona utente (fallback) |
| Status Indicator | Ellipse | 10x10px | Indicatore online (opzionale) |

### Specifiche Visive

- **Shape:** Circle (border-radius: 50%)
- **Size:** 34x34px
- **Border:** 2px solid $color-border-primary
- **Background:** $color-background-secondary (se no avatar)
- **Avatar Object Fit:** cover

### Angular Mapping

- **Selector:** `app-btn-profile` o `app-avatar-button`
- **Template:** `profile-button.component.html`
- **Module:** `SharedModule`

### SCSS Variables

```scss
// Profile Button Dimensions
$btn-profile-width: 34px;
$btn-profile-height: 34px;
$btn-profile-border-radius: 50%;

// Profile Button Border
$btn-profile-border-width: 2px;
$btn-profile-border-color: $color-border-primary;

// Profile Button Colors
$btn-profile-background: $color-background-secondary;
$btn-profile-icon-color: $color-text-secondary;

// Status Indicator
$btn-profile-status-size: 10px;
$btn-profile-status-online: $color-semantic-success;
$btn-profile-status-offline: $color-text-disabled;
```

### Responsive Behavior

| Breakpoint | Comportamento |
|------------|---------------|
| Mobile (xs) | 34x34px, solo avatar/icon |
| Tablet (md) | 40x40px, con status indicator |
| Desktop (lg) | 44x44px, con dropdown menu |

### Angular Component Interface

```typescript
interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

@Input() user: UserProfile | null = null;
@Input() size: 'small' | 'medium' | 'large' = 'small';
@Input() showStatus: boolean = false;
@Input() disabled: boolean = false;
@Output() profileClick = new EventEmitter<void>();
```

### Accessibility

```html
<button
  type="button"
  class="profile-button"
  [attr.aria-label]="user?.name ? 'Profilo di ' + user.name : 'Apri profilo'"
  (click)="onProfileClick()">
  <img
    *ngIf="user?.avatarUrl"
    [src]="user.avatarUrl"
    [alt]="user.name + ' avatar'"
    class="profile-button__avatar" />
  <svg
    *ngIf="!user?.avatarUrl"
    class="profile-button__icon"
    aria-hidden="true">...</svg>
  <span
    *ngIf="showStatus"
    class="profile-button__status"
    [class.profile-button__status--online]="user?.isOnline"
    [attr.aria-label]="user?.isOnline ? 'Online' : 'Offline'">
  </span>
</button>
```

---

## Design Tokens Reference

Riferimento completo ai design tokens utilizzati nei componenti di navigazione.

### Colors

```scss
// Primary Colors
$color-primary-500: #F5A623;
$color-primary-600: #E09520;

// Text Colors
$color-text-primary: #111111;
$color-text-secondary: #666666;
$color-text-inverse: #FFFFFF;
$color-text-disabled: #AAAAAA;

// Background Colors
$color-background-primary: #FFFFFF;
$color-background-secondary: #F5F5F5;
$color-background-overlay: rgba(0, 0, 0, 0.5);

// Border Colors
$color-border-primary: #E0E0E0;
$color-border-secondary: #F0F0F0;
$color-border-focus: $color-primary-500;

// Semantic Colors
$color-semantic-success: #4CAF50;
$color-semantic-error: #F44336;
$color-semantic-warning: #FF9800;
```

### Spacing

```scss
// Spacing Scale
$spacing-xs: 8px;
$spacing-sm: 12px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;
```

### Typography

```scss
// Font Families
$font-family-display: 'Moul', cursive;
$font-family-body: 'Montserrat', sans-serif;

// Font Sizes
$typography-h1-size: 48px;
$typography-h2-size: 32px;
$typography-body-size: 16px;
$typography-caption-size: 12px;
```

### Shadows

```scss
// Shadow Scale
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
$shadow-elevated: 0 -2px 10px rgba(0, 0, 0, 0.08);
```

### Transitions

```scss
// Transition Durations
$transition-fast: all 0.15s ease;
$transition-base: all 0.2s ease;
$transition-slow: all 0.3s ease;
```

### Breakpoints

```scss
// Breakpoint Values
$breakpoint-xs: 0px;
$breakpoint-sm: 480px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
```

---

## Angular Component Mapping

Tabella riassuntiva del mapping Figma -> Angular per tutti i componenti.

| Figma Component | Angular Selector | File Path | Module |
|-----------------|------------------|-----------|--------|
| Tab_bar_menu | `app-tab-bar-menu` | `shared/components/tab-bar-menu/` | SharedModule |
| logo_Fiutami_1536 | `app-logo-fiutami` | `shared/components/logo-fiutami/` | SharedModule |
| Btn_TornaIndietro | `app-back-button` | `shared/components/back-button/` | SharedModule |
| Btn_drawer_menu | `app-drawer-menu-button` | `shared/components/drawer-menu-button/` | SharedModule |
| Btn_Profile | `app-profile-button` | `shared/components/profile-button/` | SharedModule |

### Directory Structure

```
src/app/shared/components/
|-- tab-bar-menu/
|   |-- tab-bar-menu.component.ts
|   |-- tab-bar-menu.component.html
|   |-- tab-bar-menu.component.scss
|   |-- tab-bar-menu.component.spec.ts
|
|-- logo-fiutami/
|   |-- logo-fiutami.component.ts
|   |-- logo-fiutami.component.html
|   |-- logo-fiutami.component.scss
|   |-- logo-fiutami.component.spec.ts
|
|-- back-button/
|   |-- back-button.component.ts
|   |-- back-button.component.html
|   |-- back-button.component.scss
|   |-- back-button.component.spec.ts
|
|-- drawer-menu-button/
|   |-- drawer-menu-button.component.ts
|   |-- drawer-menu-button.component.html
|   |-- drawer-menu-button.component.scss
|   |-- drawer-menu-button.component.spec.ts
|
|-- profile-button/
|   |-- profile-button.component.ts
|   |-- profile-button.component.html
|   |-- profile-button.component.scss
|   |-- profile-button.component.spec.ts
```

---

## Usage Examples

### Tab Bar Menu Implementation

```html
<!-- app.component.html -->
<app-tab-bar-menu
  [items]="tabItems"
  [activeTab]="currentTab"
  (tabSelected)="onTabChange($event)">
</app-tab-bar-menu>
```

```typescript
// app.component.ts
tabItems: TabBarMenuItem[] = [
  { id: 'home', label: 'Home', icon: 'home', route: '/', isActive: true },
  { id: 'search', label: 'Cerca', icon: 'search', route: '/search', isActive: false },
  { id: 'add', label: 'Aggiungi', icon: 'add', route: '/add', isActive: false },
  { id: 'favorites', label: 'Preferiti', icon: 'heart', route: '/favorites', isActive: false },
  { id: 'profile', label: 'Profilo', icon: 'user', route: '/profile', isActive: false }
];
```

### Header with Navigation

```html
<!-- header.component.html -->
<header class="app-header">
  <app-back-button
    *ngIf="showBackButton"
    (backClick)="onBack()">
  </app-back-button>

  <app-logo-fiutami
    variant="wordmark"
    color="primary"
    size="medium"
    (logoClick)="onLogoClick()">
  </app-logo-fiutami>

  <div class="header-actions">
    <app-profile-button
      [user]="currentUser"
      size="small"
      (profileClick)="onProfileClick()">
    </app-profile-button>

    <app-drawer-menu-button
      [isOpen]="isMenuOpen"
      (menuToggle)="onMenuToggle($event)">
    </app-drawer-menu-button>
  </div>
</header>
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-28 | Initial documentation created |

---

**Document Author:** DocArchitect Agent
**Figma Source:** mob_home_main (node-id: 2002:3191)
**Project:** Fiutami Angular WebApp
