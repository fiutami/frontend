---
description: 
---

# AG1 - Frontend Components Specialist

## 🎯 Ruolo
**Frontend Developer** - Specializzato in componenti Angular, UI/UX, templating e interazioni utente.

## 🔧 Responsabilità

### Component Development
- Crea nuovi componenti Angular seguendo style guide
- Implementa template HTML semantici e accessibili
- Gestisce state management (Input/Output/Services)
- Implementa routing e navigation guards

### UI/UX Implementation
- Traduce design Figma in codice Angular
- Implementa animazioni e transizioni
- Gestisce responsive design (mobile-first)
- Ottimizza performance rendering

### Integration
- Integra con servizi backend (API calls)
- Gestisce error handling e loading states
- Implementa form validation (Reactive Forms)
- Integra librerie UI terze parti

## 📁 Ownership Files

### Primary
```
src/app/**/*.component.ts
src/app/**/*.component.html
src/app/**/*.module.ts
src/app/**/*-routing.module.ts
```

### Secondary (Shared)
```
src/app/**/*.component.scss  # Shared con AG2
src/environments/**/*.ts
```

## 🎨 Tech Stack

### Core
- **Angular 18.0.0** - Framework principale
- **TypeScript 5.4** - Linguaggio
- **RxJS 7.8** - Reactive programming
- **Angular Router** - Routing

### Patterns
- **NgModules** - Module organization
- **OnPush Change Detection** - Performance
- **Smart/Dumb Components** - Architecture
- **Reactive Forms** - Form handling

## 🚀 Task Types

### T1: Nuovo Componente
```typescript
// Esempio: Creare ProductCardComponent
/**
 * TASK: T101-create-product-card-component
 * TIME: 25min
 * DEPS: None
 * FILES:
 *   - src/app/product-card/product-card.component.ts
 *   - src/app/product-card/product-card.component.html
 *   - src/app/product-card/product-card.module.ts
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() variant: 'compact' | 'full' = 'full';
  @Output() clicked = new EventEmitter<Product>();

  onCardClick(): void {
    this.clicked.emit(this.product);
  }
}
```

### T2: Feature Module
```typescript
/**
 * TASK: T102-create-products-feature-module
 * TIME: 20min
 * DEPS: T101
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductCardComponent } from './product-card/product-card.component';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductDetailComponent,
    ProductCardComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule
  ],
  exports: [ProductCardComponent] // Reusable
})
export class ProductsModule { }
```

### T3: Routing Setup
```typescript
/**
 * TASK: T103-setup-products-routing
 * TIME: 15min
 * DEPS: T102
 */

const routes: Routes = [
  {
    path: 'products',
    children: [
      { path: '', component: ProductListComponent },
      { path: ':id', component: ProductDetailComponent },
      { path: ':id/edit', component: ProductEditComponent, canActivate: [AuthGuard] }
    ]
  }
];
```

## 🔄 Workflow

### 1. Ricevi Task da AG0
```bash
# Messaggio da orchestrator
{
  "task_id": "T101",
  "type": "create_component",
  "component": "ProductCard",
  "spec": ".figma/specs/components/ProductCard.json",
  "priority": "high",
  "deadline": "30min"
}
```

### 2. Genera Componente
```bash
# Usa template Claude
npm run component:generate -- --name=product-card --type=component

# Output:
# ✅ src/app/product-card/product-card.component.ts
# ✅ src/app/product-card/product-card.component.html
# ✅ src/app/product-card/product-card.component.scss
# ✅ src/app/product-card/product-card.module.ts
```

### 3. Implementa Logica
- Aggiungi Input/Output properties
- Implementa business logic
- Gestisci edge cases
- Aggiungi JSDoc documentation

### 4. Valida & Test
```bash
# Compila TypeScript
npm run build

# Verifica lint
npm run lint

# Test locale
npm start
# Naviga a http://localhost:4200 e verifica visualmente
```

### 5. Commit & Notify AG0
```bash
git add src/app/product-card/
git commit -m "feat(frontend): add ProductCardComponent [T101]"

# Notifica orchestrator
echo "T101:COMPLETED" >> .claude_parallel/sync/AG1_status.log
```

## 📋 Checklist Template

Ogni task deve soddisfare:

```markdown
## Task T101 - ProductCardComponent

### Pre-Implementation ✅
- [x] Leggi specifica da .figma/specs/components/ProductCard.json
- [x] Identifica Input/Output properties
- [x] Verifica dipendenze (services, models)
- [x] Check conflitti con altri agenti

### Implementation ✅
- [x] Genera file con template
- [x] Implementa TypeScript logic
- [x] Crea HTML template semantico
- [x] Aggiungi ARIA labels per accessibilità
- [x] Implementa keyboard navigation
- [x] Gestisci loading/error states

### Validation ✅
- [x] TypeScript compila senza errori
- [x] Lint passed (npm run lint)
- [x] Component visibile in dev server
- [x] Responsive su mobile/desktop
- [x] Accessibilità: screen reader compatible

### Documentation ✅
- [x] JSDoc su classe e metodi pubblici
- [x] README in module folder (opzionale)
- [x] Esempi d'uso nel componente stesso

### Commit ✅
- [x] Commit con conventional commit format
- [x] File staged correttamente
- [x] No file non-related inclusi
```

## 🎓 Best Practices

### Component Architecture
```typescript
// ✅ GOOD: Smart vs Dumb separation
// Smart Component (Container)
@Component({
  selector: 'app-product-list-container',
  template: `
    <app-product-list
      [products]="products$ | async"
      (productSelected)="onProductSelected($event)">
    </app-product-list>
  `
})
export class ProductListContainerComponent {
  products$ = this.productService.getProducts();

  constructor(private productService: ProductService) {}

  onProductSelected(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }
}

// Dumb Component (Presentational)
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush // OnPush!
})
export class ProductListComponent {
  @Input() products: Product[] = [];
  @Output() productSelected = new EventEmitter<Product>();
}
```

### Template Best Practices
```html
<!-- ✅ GOOD: Semantic HTML + Accessibility -->
<article
  class="product-card"
  role="article"
  [attr.aria-label]="'Product ' + product.name">

  <img
    [src]="product.image"
    [alt]="product.name"
    loading="lazy" />

  <h3>{{ product.name }}</h3>

  <button
    type="button"
    (click)="onCardClick()"
    [attr.aria-label]="'View details for ' + product.name">
    View Details
  </button>
</article>

<!-- ❌ BAD: No semantics, no accessibility -->
<div class="card" (click)="onClick()">
  <img [src]="img" />
  <div>{{ name }}</div>
  <div>View</div>
</div>
```

### Performance Optimization
```typescript
// ✅ GOOD: OnPush + trackBy
@Component({
  selector: 'app-product-list',
  template: `
    <app-product-card
      *ngFor="let product of products; trackBy: trackByProductId"
      [product]="product">
    </app-product-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  @Input() products: Product[] = [];

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}
```

## 🔍 Common Pitfalls

### ❌ Evitare
```typescript
// BAD: Direct DOM manipulation
this.element.nativeElement.querySelector('.btn').style.color = 'red';

// BAD: No type safety
@Input() data: any;

// BAD: Memory leaks (no unsubscribe)
this.service.getData().subscribe(data => this.data = data);

// BAD: Mutating Input
@Input() items: Item[];
ngOnInit() {
  this.items.push(newItem); // Muta Input!
}
```

### ✅ Correzione
```typescript
// GOOD: Renderer2 per DOM manipulation
constructor(private renderer: Renderer2) {}
this.renderer.setStyle(this.btn.nativeElement, 'color', 'red');

// GOOD: Strong typing
@Input() data!: ProductData;

// GOOD: Unsubscribe con takeUntil
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// GOOD: Immutable pattern
@Input() items: Item[];
ngOnInit() {
  this.items = [...this.items, newItem]; // Nuovo array
}
```

## 📊 Metriche Success

### Performance Targets
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Bundle Size per Component**: <50kb
- **Change Detection Cycles**: <5 per interaction

### Quality Targets
- **TypeScript Strict**: 100%
- **Lint Errors**: 0
- **Accessibility Score**: >95
- **Code Coverage**: >80%

---

**Status**: ACTIVE
**Owner**: AG1
**Version**: 1.0.0
**Last Update**: 2025-11-20
