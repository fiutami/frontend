# Core Module - Authentication & Routing Infrastructure

This directory contains the core infrastructure for authentication and routing in the Fiutami Angular application.

## Directory Structure

```
core/
├── guards/
│   ├── auth.guard.ts      # Protects authenticated routes
│   └── guest.guard.ts     # Protects guest-only routes (login/signup)
├── services/
│   └── auth.service.ts    # Authentication service with HTTP calls
├── i18n/                  # Internationalization (existing)
└── index.ts               # Barrel exports
```

## Authentication Flow

### 1. AuthService (`services/auth.service.ts`)

Handles all authentication operations:
- **login()** - Authenticates user with email/password
- **signup()** - Registers new user
- **logout()** - Clears auth data and updates state
- **isAuthenticated()** - Checks if user has valid token
- **getToken()** - Returns current JWT token
- **getCurrentUser()** - Returns user data from localStorage

**State Management:**
- Uses `BehaviorSubject` for reactive auth state
- Observable `authState$` can be subscribed to for real-time updates
- Stores token and user data in localStorage

**API Endpoints:**
```typescript
POST /api/auth/login    - Login with credentials
POST /api/auth/signup   - Register new user
```

### 2. AuthGuard (`guards/auth.guard.ts`)

Protects routes requiring authentication:
- Allows access if user is authenticated
- Redirects to `/login` if not authenticated
- Stores attempted URL in query params for post-login redirect

**Usage:**
```typescript
{
  path: 'home',
  component: HeroComponent,
  canActivate: [AuthGuard]
}
```

### 3. GuestGuard (`guards/guest.guard.ts`)

Protects routes for non-authenticated users only:
- Allows access if user is NOT authenticated
- Redirects to `/home` if already authenticated
- Prevents logged-in users from accessing login/signup pages

**Usage:**
```typescript
{
  path: 'login',
  component: LoginComponent,
  canActivate: [GuestGuard]
}
```

## Route Configuration

Current routes defined in `app-routing.module.ts`:

| Route | Component | Guard | Description |
|-------|-----------|-------|-------------|
| `/` | HomeStartComponent | GuestGuard | Landing page with CTA |
| `/login` | LoginComponent | GuestGuard | Login form |
| `/signup` | SignupComponent | GuestGuard | Registration form |
| `/home` | HeroComponent | AuthGuard | Main app (post-login) |
| `/dashboard` | (future) | AuthGuard | Dashboard (lazy loaded) |

## Lazy Loading

All routes use lazy loading for better performance:

```typescript
{
  path: '',
  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  canActivate: [GuestGuard]
}
```

## Environment Configuration

API URL is configured in environment files:

**Development** (`environment.ts`):
```typescript
apiUrl: 'http://localhost:3000/api'
```

**Production** (`environment.prod.ts`):
```typescript
apiUrl: 'https://api.fiutami.com/api'
```

## Usage Examples

### Login Component

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({...})
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(email: string, password: string) {
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        // Redirect to home on success
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }
}
```

### Checking Auth State

```typescript
import { AuthService } from '../core/services/auth.service';

@Component({...})
export class HeaderComponent implements OnInit {
  isLoggedIn$ = this.authService.authState$;

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
```

### HTTP Interceptor (Future)

To automatically add token to requests, create an HTTP interceptor:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

## Security Considerations

1. **Token Storage**: Currently using localStorage. Consider:
   - Using secure cookies for production
   - Adding token expiration checks
   - Implementing refresh token mechanism

2. **HTTPS**: Ensure all API calls use HTTPS in production

3. **CSRF Protection**: Implement CSRF tokens for state-changing operations

4. **XSS Protection**: Angular's built-in sanitization helps, but always validate user input

## Testing

### Unit Tests

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login successfully', () => {
    const mockResponse = {
      token: 'test-token',
      user: { id: '1', email: 'test@example.com' }
    };

    service.login({ email: 'test@example.com', password: 'password' })
      .subscribe(response => {
        expect(response.token).toBe('test-token');
        expect(service.isAuthenticated()).toBe(true);
      });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
```

## Future Enhancements

- [ ] Add HTTP interceptor for automatic token injection
- [ ] Implement refresh token mechanism
- [ ] Add remember me functionality
- [ ] Implement social login (Google, Facebook)
- [ ] Add two-factor authentication
- [ ] Password reset flow
- [ ] Email verification
- [ ] Role-based access control (RBAC)

## Related Files

- `/src/app/app-routing.module.ts` - Main routing configuration
- `/src/app/app.module.ts` - HttpClientModule import
- `/src/environments/environment.ts` - API URL configuration
- `/src/app/auth/` - Authentication components (created by AG1)
