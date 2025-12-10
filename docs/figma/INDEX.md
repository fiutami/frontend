# Fiutami - Figma Design Documentation

> Documentazione tecnica completa dei componenti Figma con dati numerici, mapping Angular e variabili SCSS.

---

## Quick Stats

| Metric | Value |
|--------|-------|
| **Figma File** | L8szQDjo11vjP5EuUUXa7l |
| **Total Frames** | 15 |
| **Components Documented** | 50+ |
| **Design Tokens** | 30+ |
| **Last Updated** | 2024-11-28 |

---

## Documentation Index

### Screen Documentation

| File | Description | Frame Count |
|------|-------------|-------------|
| [01-home-navigation.md](./01-home-navigation.md) | Home screen & Navigation components | 1 |
| [02-profile-pet.md](./02-profile-pet.md) | Pet profile screens & info components | 2 |
| [03-gallery-memories.md](./03-gallery-memories.md) | Gallery grid & Memories timeline | 5 |
| [04-friends-calendar.md](./04-friends-calendar.md) | Friends list & Calendar views | 3 |
| [05-map-fattibestiali.md](./05-map-fattibestiali.md) | Map screen & Pet details accordion | 3 |

### Supporting Documentation

| Folder | Description |
|--------|-------------|
| [tokens/](./tokens/) | Design tokens (spacing, sizing, breakpoints) |
| [specs/](./specs/) | Individual component specifications |
| [responsive/](./responsive/) | Responsive behavior documentation |

---

## Frame Reference Table

| Frame Name | Node ID | Width | Height | Documentation |
|------------|---------|-------|--------|---------------|
| mob_home_main | 2002:3191 | 390 | 844 | [01-home-navigation](./01-home-navigation.md) |
| mob_profile_pet | 4046:953 | 393 | 852 | [02-profile-pet](./02-profile-pet.md) |
| Banner_info_Profile | 12207:6047 | 399 | 771 | [02-profile-pet](./02-profile-pet.md) |
| mob_profile_gallery | 2002:3626 | 393 | 852 | [03-gallery-memories](./03-gallery-memories.md) |
| mob_profile_gallery_empty | 12191:4959 | 393 | 852 | [03-gallery-memories](./03-gallery-memories.md) |
| mob_profile_memories | 2002:3717 | 393 | 852 | [03-gallery-memories](./03-gallery-memories.md) |
| mob_profile_memories_empty | 12191:5232 | 393 | 852 | [03-gallery-memories](./03-gallery-memories.md) |
| Banner_Gallery | 12209:6551 | 376 | 1306 | [03-gallery-memories](./03-gallery-memories.md) |
| mob_profile_friends | 12193:5738 | 393 | 852 | [04-friends-calendar](./04-friends-calendar.md) |
| mob_profile_friends_empty | 12194:6430 | 393 | 852 | [04-friends-calendar](./04-friends-calendar.md) |
| mob_calendar_month_jan | 2002:3490 | 393 | 852 | [04-friends-calendar](./04-friends-calendar.md) |
| mob_profile_map | 2002:3801 | 393 | 852 | [05-map-fattibestiali](./05-map-fattibestiali.md) |
| mob_profile_map_variant | 12083:3858 | 393 | 852 | [05-map-fattibestiali](./05-map-fattibestiali.md) |
| mob_profile_fattibestiali | 12151:4598 | 393 | 852 | [05-map-fattibestiali](./05-map-fattibestiali.md) |

---

## Component Quick Reference

### Common Components (Used Across Screens)

| Component | Dimensions | Angular Selector |
|-----------|------------|------------------|
| Tab_bar_menu | 390 x 79 | `app-tab-bar` |
| Logo Fiutami | 142 x 34 | `app-logo` |
| Btn_TornaIndietro | 34 x 34 | `app-back-button` |
| Btn_drawer_menu | 34 x 61 | `app-drawer-menu` |
| Btn_Profile | 34 x 34 | `app-profile-button` |
| Interactive Mascot | 237-260 x 118-159 | `app-mascot` |
| Promotion Banner | 360 x 80-108 | `app-promo-banner` |

### Profile Components

| Component | Dimensions | Angular Selector |
|-----------|------------|------------------|
| Btn_saxe/age/weight/breed | 84.57 x 70 | `app-pet-info-button` |
| Btn_friend | 74 x 95 | `app-feature-button` |
| Btn_doc | 74 x 95 | `app-feature-button` |
| Btn_Foto | 78 x 93 | `app-feature-button` |
| Btn_Promo | 138 x 93 | `app-promo-card` |

### Gallery Components

| Component | Dimensions | Angular Selector |
|-----------|------------|------------------|
| Gallery Card Large | 239 x 245 | `app-photo-card[size="large"]` |
| Gallery Card Medium | 126 x 118 | `app-photo-card[size="medium"]` |
| Gallery Card Small | 120 x 118 | `app-photo-card[size="small"]` |
| Button Group | 172 x 48 (each) | `app-tab-toggle` |

### Calendar Components

| Component | Dimensions | Angular Selector |
|-----------|------------|------------------|
| Calendar Grid | 344 x 235 | `app-calendar-grid` |
| Day Cell | 49 x 47 | `app-calendar-day` |
| Month Navigation | 364 x 19 | `app-month-nav` |

### Map Components

| Component | Dimensions | Angular Selector |
|-----------|------------|------------------|
| Map Container | 362 x 211-238 | `app-map-preview` |
| Search Input | 358 x 42 | `app-search-input` |
| Horizontal Scroll | 694 x 67 | `app-category-scroll` |
| Category Box | 109 x 67 | `app-category-card` |

---

## Design Tokens Summary

### Spacing Scale

```scss
$spacing-xs:   3-4px   // Tight buttons
$spacing-sm:   8px     // Standard gap
$spacing-md:   12-16px // Section gap
$spacing-lg:   20-24px // Major sections
$spacing-xl:   48px    // Layout sections
```

### Component Sizing

```scss
// Icons
$icon-sm:  18px;
$icon-md:  22px;
$icon-lg:  34px;

// Buttons
$button-height-sm: 25px;
$button-height-md: 34-37px;
$button-height-lg: 48px;

// Cards
$card-height-sm: 67-70px;
$card-height-md: 93-95px;
$card-height-lg: 118-200px;

// Layout
$tab-bar-height: 79px;
$header-height: 212px;
$logo-height: 34px;
$mobile-width: 390-393px;
```

### Breakpoints

```scss
$breakpoint-xs:  0px      // Mobile portrait
$breakpoint-sm:  480px    // Mobile landscape
$breakpoint-md:  768px    // Tablet
$breakpoint-lg:  1024px   // Desktop
$breakpoint-xl:  1280px   // Wide desktop
```

---

## Figma Links

### Original Links
- [mob_home_main](https://www.figma.com/design/L8szQDjo11vjP5EuUUXa7l/MVP-LAST--originale---Copy-?node-id=2002-3191)
- [mob_profile_pet](https://www.figma.com/design/L8szQDjo11vjP5EuUUXa7l/MVP-LAST--originale---Copy-?node-id=4046-953)
- [mob_profile_gallery](https://www.figma.com/design/L8szQDjo11vjP5EuUUXa7l/MVP-LAST--originale---Copy-?node-id=2002-3626)
- [mob_profile_friends](https://www.figma.com/design/L8szQDjo11vjP5EuUUXa7l/MVP-LAST--originale---Copy-?node-id=12193-5738)
- [mob_profile_memories](https://www.figma.com/design/L8szQDjo11vjP5EuUUXa7l/MVP-LAST--originale---Copy-?node-id=2002-3717)
- [mob_calendar_month_jan](https://www.figma.com/design/L8szQDjo11vjP5EuUUXa7l/MVP-LAST--originale---Copy-?node-id=2002-3490)
- [mob_profile_map](https://www.figma.com/design/L8szQDjo11vjP5EuUUXa7l/MVP-LAST--originale---Copy-?node-id=2002-3801)
- [mob_profile_fattibestiali](https://www.figma.com/design/L8szQDjo11vjP5EuUUXa7l/MVP-LAST--originale---Copy-?node-id=12151-4598)

---

## Usage

### Importing SCSS Tokens

```scss
// In your component SCSS
@import 'docs/figma/tokens/spacing.tokens';
@import 'docs/figma/tokens/sizing.tokens';

.my-component {
  padding: $spacing-md;
  height: $button-height-lg;
}
```

### Angular Component Usage

```typescript
// Import shared components
import { TabBarComponent } from '@shared/components/tab-bar';
import { BackButtonComponent } from '@shared/components/back-button';
import { MascotComponent } from '@shared/components/mascot';
```

---

## Contributing

When updating Figma designs:
1. Export new metadata using Figma MCP
2. Update relevant documentation file
3. Update this INDEX.md if new frames are added
4. Run `npm run figma:sync-tokens` to update SCSS tokens

---

*Generated by DocArchitect Agent - Fiutami Project*
