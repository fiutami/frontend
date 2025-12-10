# Fiutami Design System - Friends & Calendar Components

> Documentazione tecnica completa per i componenti Friends e Calendar dell'app Fiutami.
> Generato da: DocArchitect | Data: 2025-11-28

---

## Indice

1. [Overview](#overview)
2. [Frame Specifications](#frame-specifications)
3. [Friends Components](#friends-components)
4. [Calendar Components](#calendar-components)
5. [Angular Implementation](#angular-implementation)
6. [SCSS Tokens & Variables](#scss-tokens--variables)
7. [Responsive Guidelines](#responsive-guidelines)
8. [Accessibility](#accessibility)

---

## Overview

Questa documentazione copre tre frame Figma del modulo sociale e calendario:

| Frame ID | Name | Dimensions | Purpose |
|----------|------|------------|---------|
| `12193:5738` | mob_profile_friends | 393x852px | Friends list with active connections |
| `12194:6430` | mob_profile_friends_empty | 393x852px | Empty state for friends list |
| `2002:3490` | mob_calendar_month_jan | 393x852px | Monthly calendar view (January) |

**Design Context:**
- Mobile-first layout (393px width = iPhone 14/15 viewport)
- Consistent 852px height for full-screen views
- Uses Fiutami brand colors and typography

---

## Frame Specifications

### mob_profile_friends (12193:5738)

```
+------------------------------------------+
|                393 x 852                  |
|  +--------------------------------------+ |
|  |         Header / Navigation          | |
|  +--------------------------------------+ |
|  |       Title Switch (Y:167)           | |
|  |       Group 572: W:350 H:44.59       | |
|  +--------------------------------------+ |
|  |       Frame_icons (Y:233)            | |
|  |       W:156 H:34                     | |
|  +--------------------------------------+ |
|  |       Btn_Friends_online (Y:248)     | |
|  |       W:142 H:25                     | |
|  +--------------------------------------+ |
|  |                                      | |
|  |       Box_Image_Friend (Y:282)       | |
|  |       W:360 H:225                    | |
|  |       X:16                           | |
|  |                                      | |
|  +--------------------------------------+ |
|  |       Btn_boxes_newfriends (Y:671)   | |
|  |       Scrollable: Total W:694        | |
|  |       X:-24 (overflow left)          | |
|  +--------------------------------------+ |
+------------------------------------------+
```

### mob_profile_friends_empty (12194:6430)

Same layout as `mob_profile_friends` but with:
- Empty state illustration/message instead of friend box
- "Aggiungi Amici" CTA button
- Suggestion carousel for new connections

### mob_calendar_month_jan (2002:3490)

```
+------------------------------------------+
|                393 x 852                  |
|  +--------------------------------------+ |
|  |         Header / Navigation          | |
|  +--------------------------------------+ |
|  |       Date Info Box (Y:134)          | |
|  |       W:176 H:101 X:15               | |
|  +--------------------------------------+ |
|  |       Tasto_Crea EVENTO (Y:222)      | |
|  |       W:156 H:28 X:223               | |
|  +--------------------------------------+ |
|  |       Progress Circle                | |
|  |       W:50.86 H:50.86 (80%)          | |
|  +--------------------------------------+ |
|  |       Month Navigation (Y:283)       | |
|  |       W:364 H:19 X:15                | |
|  +--------------------------------------+ |
|  |                                      | |
|  |       Calendar Grid (Y:330)          | |
|  |       W:344 H:235 X:23               | |
|  |       7 cols x 5 rows                | |
|  |       Cell: 49x47px                  | |
|  |                                      | |
|  +--------------------------------------+ |
+------------------------------------------+
```

---

## Friends Components

### 1. Box_Image_Friend

Main friend profile card with image and details.

**Specifications:**
| Property | Value |
|----------|-------|
| Width | 360px |
| Height | 225px |
| Position X | 16px |
| Position Y | 282px |
| Border Radius | `$border-radius-lg` (12px) |

**Angular Selector:** `app-friend-card`

```html
<app-friend-card
  [friend]="friendData"
  [showOnlineStatus]="true"
  [size]="'large'"
  (onProfileClick)="viewProfile($event)"
  (onMessageClick)="openChat($event)">
</app-friend-card>
```

**Component Interface:**
```typescript
interface FriendCardData {
  id: string;
  name: string;
  avatarUrl: string;
  coverImageUrl?: string;
  isOnline: boolean;
  lastSeen?: Date;
  mutualFriends?: number;
}
```

---

### 2. Btn_boxes_newfriends (Scrollable)

Horizontal scrollable list of friend suggestions.

**Container Specifications:**
| Property | Value |
|----------|-------|
| Total Width | 694px (overflow) |
| Position X | -24px (extends beyond viewport) |
| Position Y | 671px |
| Scroll Direction | Horizontal |
| Snap | Scroll-snap-type: x mandatory |

**Individual Box Specifications:**
| Property | Value |
|----------|-------|
| Width | 109px |
| Height | 107.52px |
| Rectangle Height | 83.13px |
| Text Height | 24.52px |
| Gap Between Boxes | 12px (`$spacing-sm`) |

**Angular Selector:** `app-friend-suggestions`

```html
<app-friend-suggestions
  [suggestions]="suggestedFriends"
  [maxVisible]="6"
  (onAddFriend)="sendRequest($event)"
  (onViewAll)="navigateToDiscover()">
</app-friend-suggestions>
```

**SCSS Structure:**
```scss
.friend-suggestions {
  &__container {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding: 0 24px;
    margin: 0 -24px; // Extend to viewport edges
    gap: $spacing-sm;
  }

  &__box {
    flex: 0 0 109px;
    scroll-snap-align: start;

    &-image {
      width: 109px;
      height: 83.13px;
      border-radius: $border-radius-md;
      object-fit: cover;
    }

    &-text {
      height: 24.52px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $typography-small-size;
    }
  }
}
```

---

### 3. Group 572 - Title Switch

Toggle switch for Friends/Followers views.

**Specifications:**
| Property | Value |
|----------|-------|
| Width | 350px |
| Height | 44.59px |
| Position X | 43px (centered) |
| Position Y | 167px |

**Angular Selector:** `app-tab-switch`

```html
<app-tab-switch
  [tabs]="['Amici', 'Follower']"
  [activeIndex]="0"
  (tabChange)="onTabChange($event)">
</app-tab-switch>
```

---

### 4. Btn_online / Btn_offline Indicators

Status indicator badges.

**Specifications:**
| Property | Value |
|----------|-------|
| Width | 50px |
| Height | 13px |
| Dot Size | 8px diameter |
| Online Color | `#4CAF50` (green) |
| Offline Color | `#9E9E9E` (gray) |

**Angular Selector:** `app-status-badge`

```html
<app-status-badge [status]="'online'" [showLabel]="true"></app-status-badge>
<app-status-badge [status]="'offline'" [showLabel]="true"></app-status-badge>
```

---

### 5. Frame_icons

Action icons row (message, call, more).

**Specifications:**
| Property | Value |
|----------|-------|
| Width | 156px |
| Height | 34px |
| Position X | 12px |
| Position Y | 233px |
| Icon Size | 24x24px |
| Gap | 20px |

**Angular Selector:** `app-action-icons`

```html
<app-action-icons
  [actions]="['message', 'call', 'more']"
  [disabled]="!friend.isOnline"
  (onAction)="handleAction($event)">
</app-action-icons>
```

---

### 6. Btn_Friends_online

Online friends counter button.

**Specifications:**
| Property | Value |
|----------|-------|
| Width | 142px |
| Height | 25px |
| Position X | 230px |
| Position Y | 248px |
| Font Size | `$typography-small-size` (13px) |

**Angular Selector:** `app-online-friends-count`

```html
<app-online-friends-count
  [count]="12"
  [total]="45"
  (onClick)="filterOnlineFriends()">
</app-online-friends-count>
```

---

## Calendar Components

### 1. Calendar Grid

Main calendar display with selectable days.

**Grid Specifications:**
| Property | Value |
|----------|-------|
| Width | 344px |
| Height | 235px |
| Position X | 23px |
| Position Y | 330px |
| Columns | 7 |
| Rows | 5 |
| Cell Width | 49px |
| Cell Height | 47px |
| Cell Gap | 0px (adjacent) |

**Grid Calculation:**
```
Grid Start X: 23px
Grid Start Y: 330px
Cell (row, col) position:
  X = 23 + (col * 49)
  Y = 330 + (row * 47)

Where col = 0-6, row = 0-4
```

**Angular Selector:** `app-calendar-grid`

```html
<app-calendar-grid
  [month]="currentMonth"
  [year]="currentYear"
  [selectedDate]="selectedDate"
  [events]="calendarEvents"
  [markedDates]="markedDates"
  (dateSelected)="onDateSelect($event)"
  (monthChange)="onMonthChange($event)">
</app-calendar-grid>
```

**Component Interface:**
```typescript
interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: 'evento' | 'compleanno' | 'reminder';
  color?: string;
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvent: boolean;
  events: CalendarEvent[];
}
```

**SCSS Structure:**
```scss
.calendar-grid {
  width: 344px;
  display: grid;
  grid-template-columns: repeat(7, 49px);
  grid-template-rows: repeat(5, 47px);
  gap: 0;

  &__cell {
    width: 49px;
    height: 47px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $typography-body-size;
    cursor: pointer;
    border-radius: $border-radius-sm;
    transition: $transition-fast;

    &--today {
      background-color: $color-primary-500;
      color: $color-text-inverse;
      font-weight: $typography-h2-weight;
    }

    &--selected {
      background-color: $color-cta-primary;
      color: $color-text-dark;
    }

    &--has-event {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 4px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: $color-accent-500;
      }
    }

    &--other-month {
      opacity: 0.3;
    }
  }
}
```

---

### 2. Month Navigation

Month selector with arrows.

**Specifications:**
| Property | Value |
|----------|-------|
| Container Width | 364px |
| Container Height | 19px |
| Position X | 15px |
| Position Y | 283px |

**Month Text:**
| Property | Value |
|----------|-------|
| Width | 114px |
| Height | 17px |
| Position X | 140px (centered) |
| Font | Uppercase, bold |
| Example | "GENNAIO" |

**Arrow Buttons:**
| Property | Left Arrow | Right Arrow |
|----------|------------|-------------|
| Width | 15px | 15px |
| Height | 15px | 15px |
| Position X | 30px | 364px |
| Position Y | 287px | 287px |

**Angular Selector:** `app-month-navigation`

```html
<app-month-navigation
  [currentMonth]="currentMonth"
  [currentYear]="currentYear"
  [minDate]="minDate"
  [maxDate]="maxDate"
  (previousMonth)="goToPrevious()"
  (nextMonth)="goToNext()"
  (monthClick)="openMonthPicker()">
</app-month-navigation>
```

**SCSS Structure:**
```scss
.month-navigation {
  width: 364px;
  height: 19px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;

  &__arrow {
    width: 15px;
    height: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      opacity: 0.7;
    }

    &--disabled {
      opacity: 0.3;
      pointer-events: none;
    }
  }

  &__month {
    width: 114px;
    text-align: center;
    font-size: $typography-body-size;
    font-weight: $typography-h2-weight;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}
```

---

### 3. Date Info Box

Current date display with details.

**Specifications:**
| Property | Value |
|----------|-------|
| Width | 176px |
| Height | 101px |
| Position X | 15px |
| Position Y | 134px |
| Border Radius | `$border-radius-md` (8px) |
| Background | Semi-transparent overlay |

**Angular Selector:** `app-date-info-box`

```html
<app-date-info-box
  [date]="selectedDate"
  [format]="'full'"
  [showDayName]="true"
  [showEventsCount]="true"
  [eventsCount]="3">
</app-date-info-box>
```

---

### 4. Tasto_Crea EVENTO

Create event CTA button.

**Specifications:**
| Property | Value |
|----------|-------|
| Width | 156px |
| Height | 28px |
| Position X | 223px |
| Position Y | 222px |
| Background | `$color-cta-primary` |
| Border Radius | `$border-radius-md` (8px) |
| Font Size | `$typography-small-size` (13px) |

**Angular Selector:** `app-create-event-button`

```html
<app-create-event-button
  [label]="'Crea Evento'"
  [icon]="'add'"
  [variant]="'primary'"
  (click)="openEventCreator()">
</app-create-event-button>
```

**SCSS:**
```scss
.create-event-btn {
  width: 156px;
  height: 28px;
  background-color: $color-cta-primary;
  color: $color-text-dark;
  border: none;
  border-radius: $border-radius-md;
  font-size: $typography-small-size;
  font-weight: $typography-button-weight;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background-color: darken($color-cta-primary, 10%);
  }

  &:active {
    transform: scale(0.98);
  }
}
```

---

### 5. Progress Circle

Circular progress indicator (e.g., 80% goals completed).

**Specifications:**
| Property | Value |
|----------|-------|
| Width | 50.86px |
| Height | 50.86px |
| Stroke Width | 4px |
| Progress Color | `$color-accent-500` |
| Track Color | `rgba(0,0,0,0.1)` |
| Center Text | "80%" |

**Angular Selector:** `app-progress-circle`

```html
<app-progress-circle
  [percentage]="80"
  [size]="50.86"
  [strokeWidth]="4"
  [showLabel]="true"
  [color]="'accent'">
</app-progress-circle>
```

**Component Implementation:**
```typescript
@Component({
  selector: 'app-progress-circle',
  template: `
    <svg [attr.width]="size" [attr.height]="size" class="progress-circle">
      <circle
        class="progress-circle__track"
        [attr.cx]="size / 2"
        [attr.cy]="size / 2"
        [attr.r]="radius"
        [style.strokeWidth.px]="strokeWidth"
      />
      <circle
        class="progress-circle__progress"
        [attr.cx]="size / 2"
        [attr.cy]="size / 2"
        [attr.r]="radius"
        [style.strokeWidth.px]="strokeWidth"
        [style.strokeDasharray]="circumference"
        [style.strokeDashoffset]="dashOffset"
      />
      <text
        *ngIf="showLabel"
        class="progress-circle__label"
        [attr.x]="size / 2"
        [attr.y]="size / 2"
        dominant-baseline="middle"
        text-anchor="middle">
        {{ percentage }}%
      </text>
    </svg>
  `
})
export class ProgressCircleComponent {
  @Input() percentage = 0;
  @Input() size = 50.86;
  @Input() strokeWidth = 4;
  @Input() showLabel = true;

  get radius() {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference() {
    return 2 * Math.PI * this.radius;
  }

  get dashOffset() {
    return this.circumference * (1 - this.percentage / 100);
  }
}
```

---

## Angular Implementation

### Module Structure

```typescript
// src/app/features/friends/friends.module.ts
@NgModule({
  declarations: [
    FriendsListComponent,
    FriendCardComponent,
    FriendSuggestionsComponent,
    StatusBadgeComponent,
    ActionIconsComponent,
    OnlineFriendsCountComponent,
    TabSwitchComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: FriendsListComponent }
    ])
  ],
  exports: [
    FriendCardComponent,
    StatusBadgeComponent
  ]
})
export class FriendsModule {}

// src/app/features/calendar/calendar.module.ts
@NgModule({
  declarations: [
    CalendarViewComponent,
    CalendarGridComponent,
    MonthNavigationComponent,
    DateInfoBoxComponent,
    CreateEventButtonComponent,
    ProgressCircleComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: CalendarViewComponent }
    ])
  ],
  exports: [
    CalendarGridComponent,
    ProgressCircleComponent
  ]
})
export class CalendarModule {}
```

### Component Selectors Summary

| Component | Selector | Module |
|-----------|----------|--------|
| FriendCard | `app-friend-card` | FriendsModule |
| FriendSuggestions | `app-friend-suggestions` | FriendsModule |
| StatusBadge | `app-status-badge` | FriendsModule |
| ActionIcons | `app-action-icons` | FriendsModule |
| TabSwitch | `app-tab-switch` | FriendsModule |
| OnlineFriendsCount | `app-online-friends-count` | FriendsModule |
| CalendarGrid | `app-calendar-grid` | CalendarModule |
| MonthNavigation | `app-month-navigation` | CalendarModule |
| DateInfoBox | `app-date-info-box` | CalendarModule |
| CreateEventButton | `app-create-event-button` | CalendarModule |
| ProgressCircle | `app-progress-circle` | CalendarModule |

---

## SCSS Tokens & Variables

### Colors Used

```scss
// Friends Components
$friend-card-bg: $color-background-primary;
$friend-card-shadow: $shadow-md;
$online-indicator: #4CAF50;
$offline-indicator: #9E9E9E;

// Calendar Components
$calendar-cell-bg: transparent;
$calendar-cell-today: $color-primary-500;
$calendar-cell-selected: $color-cta-primary;
$calendar-event-dot: $color-accent-500;
$progress-track: rgba(0, 0, 0, 0.1);
$progress-fill: $color-accent-500;
```

### Spacing Variables

```scss
// Friends Layout
$friends-container-padding: $spacing-md; // 16px
$friends-card-margin: $spacing-md;
$friends-suggestion-gap: $spacing-sm; // 12px
$friends-suggestion-box-width: 109px;
$friends-suggestion-box-height: 107.52px;

// Calendar Layout
$calendar-grid-padding-x: 23px;
$calendar-grid-padding-y: 330px;
$calendar-cell-width: 49px;
$calendar-cell-height: 47px;
$calendar-month-nav-height: 19px;
```

### Typography

```scss
// Friends
$friend-name-size: $typography-body-size; // 16px
$friend-status-size: $typography-micro-size; // 11px
$friend-suggestion-text: $typography-small-size; // 13px

// Calendar
$calendar-day-size: $typography-body-size; // 16px
$calendar-month-size: $typography-body-size; // 16px
$calendar-event-btn-size: $typography-small-size; // 13px
$progress-label-size: $typography-small-size; // 13px
```

---

## Responsive Guidelines

### Breakpoints

```scss
// Mobile First (Base: 393px)
// Tablet: 768px+
// Desktop: 1024px+

@mixin respond-to($breakpoint) {
  @if $breakpoint == 'tablet' {
    @media (min-width: 768px) { @content; }
  }
  @if $breakpoint == 'desktop' {
    @media (min-width: 1024px) { @content; }
  }
}
```

### Friends Responsive

```scss
.friends-list {
  // Mobile (393px)
  padding: $spacing-md;

  @include respond-to('tablet') {
    padding: $spacing-lg;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;
  }

  @include respond-to('desktop') {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
    margin: 0 auto;
  }
}

.friend-suggestions__container {
  // Mobile: horizontal scroll
  overflow-x: auto;

  @include respond-to('tablet') {
    // Tablet: wrap to grid
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    overflow-x: visible;
  }

  @include respond-to('desktop') {
    grid-template-columns: repeat(6, 1fr);
  }
}
```

### Calendar Responsive

```scss
.calendar-grid {
  // Mobile (344px grid)
  width: 344px;
  margin: 0 auto;

  @include respond-to('tablet') {
    width: 100%;
    max-width: 500px;
    grid-template-columns: repeat(7, 1fr);

    &__cell {
      width: auto;
      height: 60px;
    }
  }

  @include respond-to('desktop') {
    max-width: 700px;

    &__cell {
      height: 80px;
    }
  }
}
```

---

## Accessibility

### ARIA Labels

```html
<!-- Friends -->
<button
  class="friend-card"
  [attr.aria-label]="'Visualizza profilo di ' + friend.name"
  role="button">
</button>

<div
  class="status-badge"
  [attr.aria-label]="friend.isOnline ? 'Online' : 'Offline'"
  role="status">
</div>

<!-- Calendar -->
<button
  class="calendar-grid__cell"
  [attr.aria-label]="getDateAriaLabel(day)"
  [attr.aria-selected]="day.isSelected"
  [attr.aria-current]="day.isToday ? 'date' : null"
  role="gridcell">
</button>

<button
  class="month-navigation__arrow--prev"
  aria-label="Mese precedente"
  [attr.aria-disabled]="!canGoPrevious">
</button>

<div
  class="progress-circle"
  role="progressbar"
  [attr.aria-valuenow]="percentage"
  aria-valuemin="0"
  aria-valuemax="100"
  [attr.aria-label]="percentage + '% completato'">
</div>
```

### Keyboard Navigation

```typescript
// Calendar grid keyboard navigation
@HostListener('keydown', ['$event'])
handleKeyboard(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowLeft':
      this.moveFocus(-1);
      break;
    case 'ArrowRight':
      this.moveFocus(1);
      break;
    case 'ArrowUp':
      this.moveFocus(-7);
      break;
    case 'ArrowDown':
      this.moveFocus(7);
      break;
    case 'Enter':
    case ' ':
      this.selectFocusedDate();
      break;
  }
}
```

### Focus Management

```scss
.calendar-grid__cell {
  &:focus {
    outline: 2px solid $color-accent-500;
    outline-offset: 2px;
  }

  &:focus-visible {
    outline: 2px solid $color-accent-500;
    outline-offset: 2px;
  }
}

.friend-card:focus-visible,
.action-icons__button:focus-visible {
  outline: 2px solid $color-accent-500;
  outline-offset: 2px;
}
```

---

## File References

### Source Files

| Component | TypeScript | HTML | SCSS |
|-----------|------------|------|------|
| FriendCard | `friend-card.component.ts` | `friend-card.component.html` | `friend-card.component.scss` |
| FriendSuggestions | `friend-suggestions.component.ts` | `friend-suggestions.component.html` | `friend-suggestions.component.scss` |
| CalendarGrid | `calendar-grid.component.ts` | `calendar-grid.component.html` | `calendar-grid.component.scss` |
| MonthNavigation | `month-navigation.component.ts` | `month-navigation.component.html` | `month-navigation.component.scss` |
| ProgressCircle | `progress-circle.component.ts` | `progress-circle.component.html` | `progress-circle.component.scss` |

### Figma Links

- Friends List: `figma.com/design/jPAnVMzpDsxTvyFpAcclPT?node-id=12193:5738`
- Friends Empty: `figma.com/design/jPAnVMzpDsxTvyFpAcclPT?node-id=12194:6430`
- Calendar Month: `figma.com/design/jPAnVMzpDsxTvyFpAcclPT?node-id=2002:3490`

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-28 | DocArchitect | Initial documentation |

---

**Generated by:** DocArchitect - Fiutami Design System
**Last Updated:** 2025-11-28
