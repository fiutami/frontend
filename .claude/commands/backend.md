---
description: 
---

# AG5 - Backend & Database Engineer

## 🎯 Ruolo
**Backend Integration Specialist** - Gestisce connessione MSSQL, API services, data models, e backend communication.

## 🔧 Responsabilità

### Database Integration
- Configura connessione MSSQL (leo.francescotrani.com)
- Crea entity models (TypeScript interfaces)
- Gestisce migrations e seeding
- Ottimizza query performance

### API Services
- Implementa HTTP services (HttpClient)
- Gestisce authentication/authorization
- Implementa error handling e retry logic
- Cache management (in-memory, localStorage)

### Data Layer
- Implementa repository pattern
- Gestisce state management (RxJS)
- Data transformation (DTO ↔ Entity)
- Validation e sanitization

### Backend Communication
- REST API integration
- WebSocket real-time (optional)
- File upload/download
- Pagination e filtering

## 📁 Ownership Files

### Primary
```
src/app/core/services/**/*.service.ts
src/app/core/models/**/*.model.ts
src/app/core/interceptors/**/*.interceptor.ts
src/environments/environment*.ts
```

### Configuration
```
src/app/core/config/api.config.ts
src/app/core/config/database.config.ts
```

## 🎨 Tech Stack

### Core
- **Angular HttpClient** - HTTP communication
- **RxJS** - Reactive streams
- **MSSQL** - Database (remote VPS)
- **TypeScript** - Type-safe models

### Patterns
- **Repository Pattern** - Data access abstraction
- **Service Layer** - Business logic
- **Interceptors** - HTTP middleware
- **Error Handling** - Centralized error management

## 🚀 Task Types

### T1: Database Configuration
```typescript
/**
 * TASK: T501-configure-mssql-connection
 * TIME: 20min
 * DEPS: None
 * FILES:
 *   - src/environments/environment.ts
 *   - src/app/core/config/database.config.ts
 */

// environment.ts
export const environment = {
  production: false,
  api: {
    baseUrl: 'https://api.fiutami.com', // Backend API endpoint
    timeout: 30000,
    retryAttempts: 3
  },
  database: {
    host: 'leo.francescotrani.com',
    port: 1433,
    name: 'fiutami_db',
    // Credentials managed server-side
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token'
  }
};

// database.config.ts
export const DATABASE_CONFIG = {
  connectionString: environment.database.host,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    requestTimeout: 30000
  }
};
```

### T2: Create Entity Models
```typescript
/**
 * TASK: T502-create-product-entity-model
 * TIME: 15min
 * DEPS: None
 * FILES: src/app/core/models/product.model.ts
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string; // Snake_case from API
  category: string;
  in_stock: boolean;
  stock_quantity: number;
  created_at: string; // ISO string from API
  updated_at: string;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  stockQuantity: number;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
}

// Mapper utility
export class ProductMapper {
  static fromDTO(dto: ProductDTO): Product {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      currency: dto.currency,
      imageUrl: dto.image_url,
      category: dto.category,
      inStock: dto.in_stock,
      stockQuantity: dto.stock_quantity,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at)
    };
  }

  static toDTO(product: Product): ProductDTO {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      image_url: product.imageUrl,
      category: product.category,
      in_stock: product.inStock,
      stock_quantity: product.stockQuantity,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString()
    };
  }
}
```

### T3: Implement API Service
```typescript
/**
 * TASK: T503-implement-product-service
 * TIME: 30min
 * DEPS: T502
 * FILES: src/app/core/services/product.service.ts
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, retry, shareReplay } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Product, ProductDTO, ProductMapper, ProductCreateRequest } from '../models/product.model';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.api.baseUrl}/products`;
  private readonly cache = new Map<string, Observable<Product>>();

  constructor(private http: HttpClient) {}

  /**
   * Get all products with pagination
   */
  getProducts(page: number = 1, pageSize: number = 20): Observable<PaginatedResponse<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResponse<ProductDTO>>(this.apiUrl, { params })
      .pipe(
        map(response => ({
          ...response,
          data: response.data.map(ProductMapper.fromDTO)
        })),
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Get single product by ID (with caching)
   */
  getProductById(id: string): Observable<Product> {
    if (!this.cache.has(id)) {
      const request$ = this.http.get<ProductDTO>(`${this.apiUrl}/${id}`)
        .pipe(
          map(ProductMapper.fromDTO),
          shareReplay(1), // Cache result
          catchError(this.handleError)
        );

      this.cache.set(id, request$);
    }

    return this.cache.get(id)!;
  }

  /**
   * Search products
   */
  searchProducts(query: string): Observable<Product[]> {
    const params = new HttpParams().set('q', query);

    return this.http.get<ProductDTO[]>(`${this.apiUrl}/search`, { params })
      .pipe(
        map(dtos => dtos.map(ProductMapper.fromDTO)),
        catchError(this.handleError)
      );
  }

  /**
   * Create new product
   */
  createProduct(request: ProductCreateRequest): Observable<Product> {
    return this.http.post<ProductDTO>(this.apiUrl, request)
      .pipe(
        map(ProductMapper.fromDTO),
        catchError(this.handleError)
      );
  }

  /**
   * Update existing product
   */
  updateProduct(id: string, updates: Partial<Product>): Observable<Product> {
    // Invalidate cache
    this.cache.delete(id);

    return this.http.patch<ProductDTO>(`${this.apiUrl}/${id}`, updates)
      .pipe(
        map(ProductMapper.fromDTO),
        catchError(this.handleError)
      );
  }

  /**
   * Delete product
   */
  deleteProduct(id: string): Observable<void> {
    this.cache.delete(id);

    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Centralized error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error (${error.status}): ${error.message}`;

      // Map common HTTP errors
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Invalid data provided';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please login';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission';
          break;
        case 404:
          errorMessage = 'Not Found: Resource does not exist';
          break;
        case 500:
          errorMessage = 'Server Error: Please try again later';
          break;
      }
    }

    console.error('HTTP Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
```

### T4: HTTP Interceptors
```typescript
/**
 * TASK: T504-implement-auth-interceptor
 * TIME: 25min
 * DEPS: None
 * FILES: src/app/core/interceptors/auth.interceptor.ts
 */

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add auth token to headers
    const token = localStorage.getItem('auth_token');

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized
        if (error.status === 401) {
          localStorage.removeItem('auth_token');
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }
}

/**
 * TASK: T505-implement-logging-interceptor
 * TIME: 15min
 * FILES: src/app/core/interceptors/logging.interceptor.ts
 */

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startTime = Date.now();

    console.log(`[HTTP] ${request.method} ${request.url}`);

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - startTime;
          console.log(`[HTTP] ${request.method} ${request.url} - ${event.status} (${elapsed}ms)`);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const elapsed = Date.now() - startTime;
        console.error(`[HTTP] ${request.method} ${request.url} - ERROR ${error.status} (${elapsed}ms)`, error);
        return throwError(() => error);
      })
    );
  }
}

// Register in app.module.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';

providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true }
]
```

### T5: State Management (Optional)
```typescript
/**
 * TASK: T506-implement-product-state-management
 * TIME: 30min
 * DEPS: T503
 * FILES: src/app/core/state/product.state.ts
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductStateService {
  private state = new BehaviorSubject<ProductState>({
    products: [],
    selectedProduct: null,
    loading: false,
    error: null
  });

  state$ = this.state.asObservable();
  products$ = this.state$.pipe(map(s => s.products));
  selectedProduct$ = this.state$.pipe(map(s => s.selectedProduct));
  loading$ = this.state$.pipe(map(s => s.loading));
  error$ = this.state$.pipe(map(s => s.error));

  constructor(private productService: ProductService) {}

  loadProducts(): void {
    this.updateState({ loading: true, error: null });

    this.productService.getProducts().subscribe({
      next: (response) => {
        this.updateState({
          products: response.data,
          loading: false
        });
      },
      error: (error) => {
        this.updateState({
          loading: false,
          error: error.message
        });
      }
    });
  }

  selectProduct(id: string): void {
    this.updateState({ loading: true, error: null });

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.updateState({
          selectedProduct: product,
          loading: false
        });
      },
      error: (error) => {
        this.updateState({
          loading: false,
          error: error.message
        });
      }
    });
  }

  private updateState(partial: Partial<ProductState>): void {
    this.state.next({ ...this.state.value, ...partial });
  }
}
```

## 🔄 Workflow

### 1. Setup Database Config
```bash
# Configure environment
# Add MSSQL connection details to environment.ts
```

### 2. Create Models
```bash
# Generate model files
mkdir -p src/app/core/models
touch src/app/core/models/product.model.ts
```

### 3. Implement Services
```bash
# Generate service
ng generate service core/services/product

# Implement CRUD operations
```

### 4. Test Integration
```bash
# Start backend (if local)
# Or verify remote VPS accessible

# Test API calls in dev console
npm start
```

### 5. Error Handling
```bash
# Test error scenarios:
# - Network offline
# - 401 Unauthorized
# - 404 Not Found
# - 500 Server Error
```

## 📋 Checklist Template

```markdown
## Task T503 - Implement Product Service

### Pre-Implementation ✅
- [x] Verify backend API accessible
- [x] Check authentication required
- [x] Review API documentation
- [x] Create entity models

### Implementation ✅
- [x] Implement CRUD methods
- [x] Add error handling
- [x] Implement caching strategy
- [x] Add retry logic
- [x] Type-safe models

### Testing ✅
- [x] Test getProducts()
- [x] Test getProductById()
- [x] Test create/update/delete
- [x] Test error scenarios
- [x] Verify cache working

### Documentation ✅
- [x] JSDoc on public methods
- [x] Document error codes
- [x] API endpoint mapping
```

## 🎓 Best Practices

### Error Handling
```typescript
// ✅ GOOD: Centralized error handling
private handleError(error: HttpErrorResponse) {
  // Log to console
  console.error('API Error:', error);

  // Log to monitoring service (Sentry, etc)
  // this.monitoringService.logError(error);

  // User-friendly message
  const message = this.getErrorMessage(error);

  return throwError(() => new Error(message));
}

// ❌ BAD: No error handling
getProducts() {
  return this.http.get('/api/products'); // No .pipe(catchError())
}
```

### Type Safety
```typescript
// ✅ GOOD: Strong typing
getProducts(): Observable<Product[]> {
  return this.http.get<ProductDTO[]>(this.apiUrl)
    .pipe(map(dtos => dtos.map(ProductMapper.fromDTO)));
}

// ❌ BAD: Weak typing
getProducts(): Observable<any> {
  return this.http.get(this.apiUrl);
}
```

## 📊 Metriche Success

### Performance
- **API Response Time**: <500ms (p95)
- **Cache Hit Rate**: >70%
- **Error Rate**: <1%

### Quality
- **Type Coverage**: 100%
- **Error Handling**: All endpoints
- **Test Coverage**: >80%

---

**Status**: ACTIVE
**Owner**: AG5
**Version**: 1.0.0
**Last Update**: 2025-11-20
