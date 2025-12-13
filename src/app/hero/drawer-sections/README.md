# Drawer Sections - Fiutami

> Documentazione tecnica per i componenti delle sezioni del drawer menu laterale.

---

## Overview

Le **Drawer Sections** sono le 14 schermate accessibili dal menu drawer laterale dell'app Fiutami. Ogni sezione è un componente Angular standalone che segue pattern comuni per garantire consistenza UI/UX.

---

## Componenti (14 sezioni)

| # | Componente | Route | Descrizione | Stato |
|---|------------|-------|-------------|-------|
| 1 | `AccountComponent` | `/user/account` | Gestione account utente | Completo |
| 2 | `ActivityComponent` | `/home/activity` | Cronologia attività | Completo |
| 3 | `NotificationsComponent` | `/home/notifications` | Centro notifiche | Completo |
| 4 | `SavedComponent` | `/home/saved` | Elementi salvati/preferiti | Completo |
| 5 | `AdoptComponent` | `/home/adopt` | Annunci adozione | Completo |
| 6 | `PetFriendsComponent` | `/home/friends` | Amici dei pet | Completo |
| 7 | `InviteComponent` | `/home/invite` | Invita amici | Completo |
| 8 | `LostPetsComponent` | `/home/lost-pets` | Animali smarriti | Completo |
| 9 | `BlockedUsersComponent` | `/home/blocked` | Utenti bloccati | Completo |
| 10 | `SubscriptionsComponent` | `/home/subscriptions` | Piani abbonamento | Completo |
| 11 | `ContactComponent` | `/home/contact` | Contattaci | Completo |
| 12 | `TermsComponent` | `/home/terms` | Termini servizio | Completo |
| 13 | `PrivacyComponent` | `/home/privacy` | Privacy policy | Completo |
| 14 | `PetRegisterComponent` | `/home/pet-register` | Registrazione pet | In Hero module |

---

## Architettura

### Struttura Directory

```
src/app/hero/drawer-sections/
├── index.ts                    # Barrel exports
├── README.md                   # Questa documentazione
├── account/
│   ├── account.component.ts
│   ├── account.component.html
│   └── account.component.scss
├── activity/
│   ├── activity.component.ts
│   ├── activity.component.html
│   └── activity.component.scss
├── notifications/
│   └── ...
└── [altre sezioni]/
```

### Pattern Comune

Ogni componente drawer section segue questo pattern:

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SpecificService } from '../../../core/services/specific.service';
import { BottomTabBarComponent, TabItem } from '../../../shared/components/bottom-tab-bar';

@Component({
  selector: 'app-section-name',
  standalone: true,
  imports: [CommonModule, RouterModule, BottomTabBarComponent],
  templateUrl: './section-name.component.html',
  styleUrls: ['./section-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionNameComponent implements OnInit {
  // Dependency injection
  private readonly location = inject(Location);
  private readonly service = inject(SpecificService);

  // State signals (reactive)
  readonly data = signal<DataType[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  // Bottom tab bar configuration
  tabs: TabItem[] = [
    { id: 'home', icon: 'home', route: '/home/main', label: 'Home' },
    { id: 'calendar', icon: 'calendar_today', route: '/home/calendar', label: 'Calendario' },
    { id: 'location', icon: 'place', route: '/home/map', label: 'Mappa' },
    { id: 'pet', icon: 'pets', route: '/home/pet-profile', label: 'Pet' },
    { id: 'profile', icon: 'person', route: '/user/profile', label: 'Profilo' },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  goBack(): void {
    this.location.back();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.service.getData().subscribe({
      next: (data) => {
        this.data.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  retry(): void {
    this.loadData();
  }
}
```

---

## Template Pattern

### Struttura HTML Standard

```html
<div class="section-page">
  <!-- Header -->
  <header class="page-header">
    <button class="back-btn" (click)="goBack()" aria-label="Torna indietro">
      <span class="material-icons">arrow_back</span>
    </button>
    <h1>Titolo Sezione</h1>
  </header>

  <!-- Main Content -->
  <main class="page-content">
    @if (isLoading()) {
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Caricamento...</p>
      </div>
    } @else if (hasError()) {
      <div class="error-state">
        <span class="material-icons">error_outline</span>
        <p>Errore nel caricamento</p>
        <button class="retry-btn" (click)="loadData()">Riprova</button>
      </div>
    } @else if (data().length === 0) {
      <div class="empty-state">
        <span class="material-icons">inbox</span>
        <p>Nessun elemento</p>
      </div>
    } @else {
      <!-- Content list/grid -->
      <div class="content-list">
        @for (item of data(); track item.id) {
          <article class="item-card">
            <!-- Item content -->
          </article>
        }
      </div>
    }
  </main>

  <!-- Bottom Tab Bar -->
  <app-bottom-tab-bar [tabs]="tabs"></app-bottom-tab-bar>
</div>
```

---

## SCSS Pattern

### Struttura Base

```scss
.section-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-primary, #f5f5f5);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;

  .back-btn {
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    border-radius: 50%;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  h1 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }
}

.page-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 100px; // Space for bottom tab bar
}

// States
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  gap: 16px;

  .material-icons {
    font-size: 48px;
    color: #9e9e9e;
  }
}

// Responsive
@media (min-width: 768px) {
  .page-content {
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .page-content {
    max-width: 800px;
  }
}
```

---

## Servizi Correlati

Ogni sezione ha un servizio dedicato in `src/app/core/services/`:

| Componente | Servizio | File |
|------------|----------|------|
| Activity | `ActivityService` | `activity.service.ts` |
| Notifications | `NotificationsService` | `notifications.service.ts` |
| Saved | `SavedService` | `saved.service.ts` |
| Adopt | `AdoptionService` | `adoption.service.ts` |
| Pet Friends | `FriendsService` | `friends.service.ts` |
| Invite | `InviteService` | `invite.service.ts` |
| Lost Pets | `LostPetsService` | `lost-pets.service.ts` |
| Blocked Users | `BlockedUsersService` | `blocked-users.service.ts` |
| Subscriptions | `SubscriptionsService` | `subscriptions.service.ts` |
| Contact | `ContactService` | `contact.service.ts` |

---

## Routing

Le route sono configurate in `hero-routing.module.ts`:

```typescript
const routes: Routes = [
  // Drawer sections
  { path: 'activity', component: ActivityComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'saved', component: SavedComponent },
  { path: 'adopt', component: AdoptComponent },
  { path: 'friends', component: PetFriendsComponent },
  { path: 'invite', component: InviteComponent },
  { path: 'lost-pets', component: LostPetsComponent },
  { path: 'blocked', component: BlockedUsersComponent },
  { path: 'subscriptions', component: SubscriptionsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
];
```

---

## Testing

### Playwright E2E

Test file: `e2e/tests/drawer-menu.spec.ts`

```bash
# Eseguire test drawer su mobile
cd e2e && MOCK_API=true npx playwright test drawer-menu.spec.ts --project=drawer-mobile

# Eseguire su tutti i device
cd e2e && MOCK_API=true npx playwright test drawer-menu.spec.ts --project="drawer-*"
```

### Device Matrix (8 viewport)

| Device | Viewport | Test Project |
|--------|----------|--------------|
| Mobile | 375x667 | `drawer-mobile` |
| Tablet | 768x1024 | `drawer-tablet` |
| Desktop | 1440x900 | `drawer-desktop` |
| Foldable Folded | 717x512 | `drawer-foldable-folded` |
| Foldable Unfolded | 1485x720 | `drawer-foldable-unfolded` |
| iPhone 2025 | 430x932 | `drawer-iphone-2025` |
| Honor Magic V3 | 795x720 | `drawer-honor-magic-v3` |
| Honor Magic V5 | 795x720 | `drawer-honor-magic-v5` |

---

## Guida Sviluppo Nuove Sezioni

### 1. Creare Component

```bash
ng generate component hero/drawer-sections/new-section --standalone --skip-tests
```

### 2. Implementare Pattern Standard

- Copiare pattern da componente esistente (es. `ActivityComponent`)
- Adattare servizio e tipi dati
- Mantenere struttura HTML/SCSS consistente

### 3. Creare Servizio

```bash
ng generate service core/services/new-section
```

### 4. Aggiungere Route

In `hero-routing.module.ts`:
```typescript
{ path: 'new-section', component: NewSectionComponent }
```

### 5. Aggiungere a Barrel Export

In `drawer-sections/index.ts`:
```typescript
export { NewSectionComponent } from './new-section/new-section.component';
```

### 6. Aggiungere Link nel Drawer

In `drawer.component.ts`, aggiungere alla lista menu items.

### 7. Scrivere Test E2E

Aggiungere sezione in `DRAWER_SECTIONS` array in `drawer-menu.spec.ts`.

---

## Best Practices

1. **Standalone Components**: Tutti i componenti devono essere standalone
2. **OnPush Change Detection**: Usare sempre `ChangeDetectionStrategy.OnPush`
3. **Signals**: Usare signals per stato reattivo (no BehaviorSubject)
4. **inject()**: Preferire `inject()` a constructor injection
5. **BottomTabBar**: Sempre includere per navigazione consistente
6. **Loading/Error/Empty States**: Gestire sempre tutti e tre gli stati
7. **Accessibility**: Includere aria-labels sui bottoni
8. **Mobile-First SCSS**: Scrivere CSS mobile-first con breakpoint crescenti

---

*Ultimo aggiornamento: 2025-12-13*
