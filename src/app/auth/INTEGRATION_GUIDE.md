# Auth Module Integration Guide

## Overview

This guide explains how to integrate the auth components with the routing infrastructure set up by AG5.

## Current Status

The routing infrastructure is complete and ready. The following components need to be created:

- [ ] HomeStartComponent (`/src/app/auth/home-start/home-start.component.ts`)
- [ ] LoginComponent (`/src/app/auth/login/login.component.ts`)
- [ ] SignupComponent (`/src/app/auth/signup/signup.component.ts`)

## Step-by-Step Integration

### Step 1: Create the Components

Once AG1 creates the three main components, follow these steps:

### Step 2: Update auth.module.ts

Uncomment the component imports and declarations:

```typescript
// FROM:
// import { HomeStartComponent } from './home-start/home-start.component';
// import { LoginComponent } from './login/login.component';
// import { SignupComponent } from './signup/signup.component';

// TO:
import { HomeStartComponent } from './home-start/home-start.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

// AND in declarations array:
declarations: [
  HomeStartComponent,
  LoginComponent,
  SignupComponent,
  AuthCardComponent,
  SocialLoginComponent,
  LanguageSwitcherComponent
],
```

### Step 3: Update auth-routing.module.ts

Uncomment the routes:

```typescript
import { HomeStartComponent } from './home-start/home-start.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  {
    path: '',
    component: HomeStartComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  }
];
```

### Step 4: Update app-routing.module.ts

Uncomment the auth routes and remove the temporary redirect:

```typescript
const routes: Routes = [
  // Landing page - accessible only to guests
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [GuestGuard]
  },

  // Auth routes - accessible only to guests
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'signup',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [GuestGuard]
  },

  // Protected routes - require authentication
  {
    path: 'home',
    loadChildren: () => import('./hero/hero.module').then(m => m.HeroModule),
    canActivate: [AuthGuard]
  },

  // Remove this temporary redirect:
  // {
  //   path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full'
  // },

  // Redirect unknown routes to landing
  {
    path: '**',
    redirectTo: ''
  }
];
```

## Component Integration with AuthService

### HomeStartComponent Example

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-start',
  templateUrl: './home-start.component.html',
  styleUrls: ['./home-start.component.scss']
})
export class HomeStartComponent {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}
```

### LoginComponent Example

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // Get return URL from query params or default to /home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}
```

### SignupComponent Example

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { confirmPassword, ...signupData } = this.signupForm.value;

    this.authService.signup(signupData).subscribe({
      next: (response) => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
```

## Testing the Integration

### Manual Testing Steps

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start dev server:**
   ```bash
   npm start
   ```

3. **Test navigation flow:**
   - Visit `http://localhost:4200/` → Should show HomeStartComponent (landing)
   - Click "Login" → Should navigate to `/login`
   - Click "Signup" → Should navigate to `/signup`
   - Submit login form → Should navigate to `/home` (HeroComponent)
   - Try accessing `/home` while logged out → Should redirect to `/login`
   - Try accessing `/login` while logged in → Should redirect to `/home`

### Unit Testing

Add tests for route guards:

```typescript
// auth.guard.spec.ts
describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { isAuthenticated: () => false } },
        { provide: Router, useValue: { createUrlTree: jasmine.createSpy() } }
      ]
    });
    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should redirect to login if not authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(false);
    const result = guard.canActivate({} as any, { url: '/home' } as any);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/home' } });
  });

  it('should allow access if authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(true);
    const result = guard.canActivate({} as any, {} as any);
    expect(result).toBe(true);
  });
});
```

## Troubleshooting

### Issue: Guards not working

**Solution:** Ensure guards are provided in `core` module or have `providedIn: 'root'` (already configured).

### Issue: Routes not lazy loading

**Solution:** Remove any direct imports of lazy-loaded modules from `app.module.ts` (already fixed).

### Issue: Auth state not persisting

**Solution:** Check browser localStorage for `fiutami_auth_token` and `fiutami_user` keys.

### Issue: Circular redirect

**Solution:** Ensure GuestGuard and AuthGuard redirect to different routes.

## Next Steps

After integration:

1. Add HTTP interceptor for automatic token injection (see core/README.md)
2. Implement refresh token mechanism
3. Add password reset flow
4. Implement social login integration
5. Add email verification
6. Set up role-based access control

## Related Files

- `/src/app/core/services/auth.service.ts` - Authentication service
- `/src/app/core/guards/auth.guard.ts` - Protected route guard
- `/src/app/core/guards/guest.guard.ts` - Guest-only route guard
- `/src/app/app-routing.module.ts` - Main routing configuration
- `/src/app/auth/auth-routing.module.ts` - Auth module routes
- `/src/app/core/README.md` - Core infrastructure documentation
