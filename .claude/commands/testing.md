---
description: 
---

# AG6 - Testing & Quality Assurance

## 🎯 Ruolo
**QA Engineer** - Gestisce unit testing, integration testing, e2e testing, code coverage e quality gates.

## 🔧 Responsabilità

### Unit Testing
- Genera test Jasmine per componenti
- Test services e utilities
- Mock dependencies
- Achieve >80% code coverage

### Integration Testing
- Test interazione tra componenti
- Test API integration
- Test routing e navigation
- Test form validation

### E2E Testing
- Scenari utente end-to-end
- Critical path testing
- Cross-browser testing
- Performance testing

### Quality Assurance
- Code linting (ESLint)
- Code formatting (Prettier)
- Accessibility audits (a11y)
- Bundle size monitoring

## 📁 Ownership Files

### Primary
```
src/app/**/*.spec.ts
e2e/**/*.e2e-spec.ts
karma.conf.js
protractor.conf.js (if e2e)
```

### Configuration
```
.eslintrc.json
.prettierrc
karma.conf.js
```

## 🎨 Tech Stack

### Core
- **Jasmine** - Unit test framework
- **Karma** - Test runner
- **Protractor/Cypress** - E2E testing
- **ESLint** - Linting
- **Prettier** - Code formatting

### Testing Utils
- **TestBed** - Angular testing utilities
- **HttpClientTestingModule** - HTTP mocking
- **RouterTestingModule** - Router mocking
- **jasmine-marbles** - RxJS testing

## 🚀 Task Types

### T1: Unit Test Component
```typescript
/**
 * TASK: T601-test-product-card-component
 * TIME: 25min
 * DEPS: T101
 * FILES: src/app/product-card/product-card.component.spec.ts
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';
import { Product } from '@core/models/product.model';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  let mockProduct: Product;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;

    // Mock product data
    mockProduct = {
      id: '1',
      name: 'Test Product',
      description: 'Test description',
      price: 99.99,
      currency: 'EUR',
      imageUrl: 'test.jpg',
      category: 'Electronics',
      inStock: true,
      stockQuantity: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.product = mockProduct;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display product name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h3');
    expect(title?.textContent).toContain('Test Product');
  });

  it('should display product price', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const price = compiled.querySelector('.price');
    expect(price?.textContent).toContain('99.99');
  });

  it('should emit clicked event when card is clicked', () => {
    spyOn(component.clicked, 'emit');

    component.onCardClick();

    expect(component.clicked.emit).toHaveBeenCalledWith(mockProduct);
  });

  it('should disable button when product out of stock', () => {
    component.product = { ...mockProduct, inStock: false };
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button?.disabled).toBe(true);
  });

  it('should apply compact variant class', () => {
    component.variant = 'compact';
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.product-card');
    expect(card?.classList.contains('product-card--compact')).toBe(true);
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have alt text for image', () => {
      const img = fixture.nativeElement.querySelector('img');
      expect(img?.getAttribute('alt')).toBe('Test Product');
    });
  });
});
```

### T2: Unit Test Service
```typescript
/**
 * TASK: T602-test-product-service
 * TIME: 30min
 * DEPS: T503
 * FILES: src/app/core/services/product.service.spec.ts
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product, ProductDTO } from '../models/product.model';
import { environment } from '@env/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.api.baseUrl}/products`;

  const mockProductDTO: ProductDTO = {
    id: '1',
    name: 'Test Product',
    description: 'Test description',
    price: 99.99,
    currency: 'EUR',
    image_url: 'test.jpg',
    category: 'Electronics',
    in_stock: true,
    stock_quantity: 10,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should fetch products with pagination', () => {
      const mockResponse = {
        data: [mockProductDTO],
        total: 1,
        page: 1,
        pageSize: 20
      };

      service.getProducts(1, 20).subscribe(response => {
        expect(response.data.length).toBe(1);
        expect(response.data[0].name).toBe('Test Product');
        expect(response.total).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&pageSize=20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error response', () => {
      service.getProducts().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Server Error');
        }
      });

      const req = httpMock.expectOne((request) => request.url.includes(apiUrl));
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getProductById', () => {
    it('should fetch single product', () => {
      service.getProductById('1').subscribe(product => {
        expect(product.id).toBe('1');
        expect(product.name).toBe('Test Product');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProductDTO);
    });

    it('should cache product requests', () => {
      // First request
      service.getProductById('1').subscribe();
      const req1 = httpMock.expectOne(`${apiUrl}/1`);
      req1.flush(mockProductDTO);

      // Second request (should use cache, no HTTP call)
      service.getProductById('1').subscribe(product => {
        expect(product.name).toBe('Test Product');
      });

      httpMock.expectNone(`${apiUrl}/1`); // No second request
    });

    it('should handle 404 error', () => {
      service.getProductById('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Not Found');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createProduct', () => {
    it('should create new product', () => {
      const createRequest = {
        name: 'New Product',
        description: 'New description',
        price: 49.99,
        currency: 'EUR',
        categoryId: 'cat1',
        stockQuantity: 5
      };

      service.createProduct(createRequest).subscribe(product => {
        expect(product.name).toBe('Test Product');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockProductDTO);
    });
  });

  describe('updateProduct', () => {
    it('should update product and invalidate cache', () => {
      const updates = { name: 'Updated Product' };

      service.updateProduct('1', updates).subscribe(product => {
        expect(product.id).toBe('1');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(mockProductDTO);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', () => {
      service.deleteProduct('1').subscribe(() => {
        expect(true).toBe(true); // Success
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
```

### T3: Integration Test
```typescript
/**
 * TASK: T603-integration-test-product-list
 * TIME: 30min
 * DEPS: T101, T503
 * FILES: src/app/products/product-list.component.integration.spec.ts
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductListComponent } from './product-list.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '@core/services/product.service';
import { of, throwError } from 'rxjs';

describe('ProductListComponent (Integration)', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts']);

    await TestBed.configureTestingModule({
      declarations: [ProductListComponent, ProductCardComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: ProductService, useValue: productServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should display products when loaded', () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', /* ... */ },
      { id: '2', name: 'Product 2', /* ... */ }
    ];

    productService.getProducts.and.returnValue(of({
      data: mockProducts,
      total: 2,
      page: 1,
      pageSize: 20
    }));

    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-product-card');
    expect(cards.length).toBe(2);
  });

  it('should display error message when API fails', () => {
    productService.getProducts.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage?.textContent).toContain('Error');
  });

  it('should navigate to product detail when card is clicked', () => {
    // Test navigation integration
  });
});
```

### T4: E2E Test
```typescript
/**
 * TASK: T604-e2e-test-product-flow
 * TIME: 40min
 * DEPS: T101, T503
 * FILES: e2e/src/product-flow.e2e-spec.ts
 */

import { browser, by, element } from 'protractor';

describe('Product Flow E2E', () => {
  beforeEach(async () => {
    await browser.get('/products');
  });

  it('should display product list page', async () => {
    const title = await element(by.css('h1')).getText();
    expect(title).toContain('Products');
  });

  it('should filter products by search', async () => {
    const searchInput = element(by.css('input[type="search"]'));
    await searchInput.sendKeys('laptop');

    const products = element.all(by.css('.product-card'));
    expect(await products.count()).toBeGreaterThan(0);
  });

  it('should navigate to product detail', async () => {
    const firstProduct = element.all(by.css('.product-card')).first();
    await firstProduct.click();

    const url = await browser.getCurrentUrl();
    expect(url).toContain('/products/');
  });

  it('should add product to cart', async () => {
    const addToCartButton = element(by.buttonText('Add to cart'));
    await addToCartButton.click();

    const cartBadge = element(by.css('.cart-badge'));
    expect(await cartBadge.getText()).toBe('1');
  });
});
```

### T5: Code Coverage & Quality Gates
```javascript
/**
 * TASK: T605-setup-code-coverage
 * TIME: 20min
 * DEPS: None
 * FILES: karma.conf.js
 */

// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: false // Deterministic test order
      },
      clearContext: false
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ],
      check: {
        global: {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80
        }
      }
    },
    reporters: ['progress', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false,
    restartOnFileChange: true
  });
};
```

## 🔄 Workflow

### 1. Generate Test File
```bash
# Auto-generated with component
ng generate component product-card
# Creates: product-card.component.spec.ts

# Or generate standalone
ng generate component product-card --skip-tests=false
```

### 2. Write Tests
```bash
# Follow AAA pattern: Arrange, Act, Assert
# Use descriptive test names
# Test both happy path and error cases
```

### 3. Run Tests
```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --include='**/product.service.spec.ts'

# Run in headless mode (CI)
npm test -- --watch=false --browsers=ChromeHeadless
```

### 4. Check Coverage
```bash
# View coverage report
open coverage/index.html

# Check if meets threshold (80%)
# karma.conf.js enforces minimum coverage
```

### 5. Lint & Format
```bash
# Run linter
npm run lint

# Auto-fix lint errors
npm run lint -- --fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## 📋 Checklist Template

```markdown
## Task T601 - Test ProductCardComponent

### Pre-Implementation ✅
- [x] Component implementation complete
- [x] Understand component behavior
- [x] Identify test scenarios

### Test Implementation ✅
- [x] Test component creation
- [x] Test @Input properties
- [x] Test @Output events
- [x] Test user interactions
- [x] Test error states
- [x] Test accessibility

### Run & Verify ✅
- [x] All tests pass
- [x] Coverage >80%
- [x] No console errors/warnings
- [x] Tests run in CI

### Documentation ✅
- [x] Descriptive test names
- [x] Comments for complex tests
```

## 🎓 Best Practices

### Test Structure (AAA Pattern)
```typescript
// ✅ GOOD: Clear AAA structure
it('should emit clicked event when button is clicked', () => {
  // Arrange
  spyOn(component.clicked, 'emit');
  const button = fixture.nativeElement.querySelector('button');

  // Act
  button.click();
  fixture.detectChanges();

  // Assert
  expect(component.clicked.emit).toHaveBeenCalled();
});

// ❌ BAD: Unclear structure
it('test button', () => {
  const btn = fixture.nativeElement.querySelector('button');
  btn.click();
  expect(something).toBe(true);
});
```

### Descriptive Test Names
```typescript
// ✅ GOOD: Descriptive
it('should disable submit button when form is invalid', () => {});
it('should display error message when API returns 500', () => {});

// ❌ BAD: Vague
it('should work', () => {});
it('test button click', () => {});
```

### Mock Dependencies
```typescript
// ✅ GOOD: Mock external dependencies
const productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts']);
productServiceSpy.getProducts.and.returnValue(of(mockProducts));

// ❌ BAD: Real dependencies in unit tests
// (causes slow tests, external API calls, flakiness)
```

## 📊 Metriche Success

### Coverage Targets
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

### Quality Metrics
- **Test Success Rate**: 100%
- **Test Execution Time**: <30s for unit tests
- **E2E Test Pass Rate**: >95%
- **Lint Errors**: 0

---

**Status**: ACTIVE
**Owner**: AG6
**Version**: 1.0.0
**Last Update**: 2025-11-20
