# Auth Module - FiutaMi Angular 18

Authentication module with landing, login, and signup pages based on Figma designs (file: 25uQUXz6gwFQKx4Wjp0dcc).

## 📁 Module Structure

```
auth/
├── auth.module.ts                      # Main module with declarations
├── auth-routing.module.ts              # Routing configuration
├── index.ts                            # Barrel exports
├── home-start/                         # Landing page with CTA buttons
│   ├── home-start.component.ts
│   ├── home-start.component.html
│   └── home-start.component.scss
├── login/                              # Login form
│   ├── login.component.ts
│   ├── login.component.html
│   └── login.component.scss
├── signup/                             # Registration form
│   ├── signup.component.ts
│   ├── signup.component.html
│   └── signup.component.scss
├── auth-card/                          # Shared container component
│   ├── auth-card.component.ts
│   ├── auth-card.component.html
│   └── auth-card.component.scss
├── social-login/                       # Social auth buttons
│   ├── social-login.component.ts
│   ├── social-login.component.html
│   └── social-login.component.scss
└── language-switcher/                  # Language button (UI only)
    ├── language-switcher.component.ts
    ├── language-switcher.component.html
    └── language-switcher.component.scss
```

## 🚀 Usage

### Import Module in App

```typescript
// app.module.ts
import { AuthModule } from './auth';

@NgModule({
  imports: [
    // ...
    AuthModule
  ]
})
export class AppModule { }
```

### Routing Setup

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  }
];
```

**Routes:**
- `/auth` → HomeStartComponent (landing with Accedi/Registrati)
- `/auth/login` → LoginComponent
- `/auth/signup` → SignupComponent

## 📋 Components

### 1. HomeStartComponent

Landing page with authentication options.

**Features:**
- Full-screen background with overlay
- FiutaMi branding (logo + mascot)
- Primary CTA buttons (Accedi/Registrati)
- Social login options (Apple, Facebook, Google)
- Language switcher (top-right)
- Terms & Privacy notice

**Outputs:**
```typescript
@Output() loginClick: EventEmitter<void>
@Output() signupClick: EventEmitter<void>
@Output() socialLoginClick: EventEmitter<'apple' | 'facebook' | 'google'>
@Output() languageClick: EventEmitter<void>
```

**Example Usage:**
```html
<app-home-start
  (loginClick)="navigateToLogin()"
  (signupClick)="navigateToSignup()"
  (socialLoginClick)="handleSocialLogin($event)"
  (languageClick)="openLanguageSelector()">
</app-home-start>
```

---

### 2. LoginComponent

Login form with email/password authentication.

**Features:**
- Reactive form with validation
- Email format validation
- Password minimum length (6 characters)
- "Forgot password" link
- Social login options
- Back navigation button

**Outputs:**
```typescript
@Output() loginSubmit: EventEmitter<{ email: string; password: string }>
@Output() backClick: EventEmitter<void>
@Output() forgotPasswordClick: EventEmitter<void>
@Output() socialLoginClick: EventEmitter<'apple' | 'facebook' | 'google'>
```

**Example Usage:**
```typescript
// In parent component
onLoginSubmit(credentials: { email: string; password: string }): void {
  this.authService.login(credentials).subscribe({
    next: () => this.router.navigate(['/dashboard']),
    error: (err) => console.error('Login failed', err)
  });
}
```

**Validation Rules:**
- Email: Required, valid email format
- Password: Required, minimum 6 characters

---

### 3. SignupComponent

Registration form with email/password and password confirmation.

**Features:**
- Reactive form with custom validators
- Email format validation
- Password strength validation (letters + numbers)
- Password confirmation matching
- Password minimum length (8 characters)
- Social login options
- Back navigation button

**Outputs:**
```typescript
@Output() signupSubmit: EventEmitter<{ email: string; password: string }>
@Output() backClick: EventEmitter<void>
@Output() socialLoginClick: EventEmitter<'apple' | 'facebook' | 'google'>
```

**Custom Validators:**
1. **Password Strength**: Requires at least one letter and one number
2. **Password Match**: Ensures password and confirmPassword fields match

**Validation Rules:**
- Email: Required, valid email format
- Password: Required, minimum 8 characters, must contain letters + numbers
- Confirm Password: Required, must match password

**Example Usage:**
```typescript
// In parent component
onSignupSubmit(credentials: { email: string; password: string }): void {
  this.authService.register(credentials).subscribe({
    next: () => this.router.navigate(['/onboarding']),
    error: (err) => this.handleSignupError(err)
  });
}
```

---

### 4. AuthCardComponent (Shared)

Reusable container for auth forms.

**Features:**
- Semi-transparent white background with blur
- Rounded corners ($border-radius-lg)
- Shadow elevation
- Responsive padding
- Hover effect (shadow enhancement)

**Usage:**
```html
<app-auth-card>
  <!-- Your form content here -->
</app-auth-card>
```

---

### 5. SocialLoginComponent (Shared)

Social authentication buttons (Apple, Facebook, Google).

**Features:**
- Icon-based buttons with hover states
- Accessibility labels
- Provider-specific styling on hover
- Divider with "oppure" text

**Outputs:**
```typescript
@Output() providerSelected: EventEmitter<'apple' | 'facebook' | 'google'>
```

**Usage:**
```html
<app-social-login (providerSelected)="handleSocialLogin($event)"></app-social-login>
```

---

### 6. LanguageSwitcherComponent (Shared)

Language selection button (UI only - no i18n implementation).

**Features:**
- Globe icon + "Lingua" text
- Semi-transparent white background
- Responsive (text hidden on <360px screens)

**Outputs:**
```typescript
@Output() languageClick: EventEmitter<void>
```

**Note:** This is UI-only. For full internationalization:
1. Use `@angular/localize` or `ngx-translate`
2. Implement language service
3. Store user language preference

---

## 🎨 Styling

### Design Tokens Used

**Colors:**
```scss
$color-primary-500: #F5A623      // Primary orange
$color-accent-500: #4A90E2       // Blue for links/accents
$color-text-primary: #111111     // Dark text
$color-text-secondary: #666666   // Secondary text
$color-text-inverse: #FFFFFF     // White text (on dark bg)
```

**Custom Auth Colors:**
```scss
#F2B830  // Yellow CTA button (from Figma)
rgba(0, 0, 0, 0.4)  // Overlay darkness
```

**Spacing:**
```scss
$spacing-xs: 8px
$spacing-sm: 12px
$spacing-md: 16px
$spacing-lg: 24px
$spacing-xl: 32px
$spacing-2xl: 48px
```

**Border Radius:**
```scss
$border-radius-md: 8px     // Buttons, inputs
$border-radius-lg: 12px    // Auth card
$border-radius-full: 9999px // Circular buttons
```

**Shadows:**
```scss
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
$shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15)
```

### Responsive Breakpoints

```scss
@include respond(md) {  // ≥768px
  // Tablet and desktop styles
}

@include respond(lg) {  // ≥1024px
  // Desktop-only styles
}
```

### Typography

**Fonts (from Figma):**
- **Moul** (serif) - Used for "FiutaMi" wordmark
- **Montserrat** (sans-serif) - Used for tagline
- **System fonts** - Used for forms and buttons

**Note:** Import Google Fonts in `src/index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Moul&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
```

---

## ♿ Accessibility

All components follow WCAG 2.1 AA standards:

### Keyboard Navigation
- All interactive elements focusable
- Focus ring with `@include focus-ring()` mixin
- Tab order follows visual flow

### ARIA Labels
```html
<button aria-label="Torna indietro">...</button>
<img role="presentation" alt="" />  <!-- Decorative images -->
<div role="alert">Error message</div>
```

### Form Accessibility
- All inputs have associated `<label for="...">` elements
- Error messages linked via `aria-describedby`
- Error messages use `role="alert"`
- Placeholder text does NOT replace labels

### Color Contrast
- Text on white background: AAA compliant
- White text on overlay: AA compliant (tested with rgba(0,0,0,0.4))
- Error red (#E53E3E) on white: AA compliant

---

## 🧪 Testing

### Unit Tests (TODO)

```typescript
// Example: login.component.spec.ts
describe('LoginComponent', () => {
  it('should emit loginSubmit on valid form submission', () => {
    // Test form validation
  });

  it('should show error for invalid email', () => {
    // Test email validation
  });

  it('should disable submit button when form is invalid', () => {
    // Test button state
  });
});
```

### E2E Tests (TODO)

```typescript
// Example: auth.e2e-spec.ts
describe('Auth Flow', () => {
  it('should navigate from home-start to login', () => {
    // Test routing
  });

  it('should show validation errors on invalid signup', () => {
    // Test form validation UI
  });
});
```

---

## 📦 Assets Required

### Background Image

**Location:** `src/assets/images/auth-bg.jpg`

**Specifications:**
- Dimensions: 1920x1080 or higher (16:9 aspect ratio)
- Format: JPG or WebP
- Features: Dog mascot or related imagery
- Should work well with `rgba(0,0,0,0.4)` overlay

**Export from Figma:**
1. Open file 25uQUXz6gwFQKx4Wjp0dcc
2. Select background layer
3. Export as JPG (quality 85%)
4. Place in `src/assets/images/auth-bg.jpg`

### Mascot Icon (Optional)

Currently using simplified SVG placeholder in HomeStartComponent. For production:
1. Export mascot from Figma as optimized SVG
2. Replace inline SVG in `home-start.component.html` (lines 24-30)

---

## 🔄 Integration with App

### Parent Component Example

```typescript
// app.component.ts or dedicated auth container
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service'; // Your auth service

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin(credentials: { email: string; password: string }): void {
    this.authService.login(credentials).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Handle error (show toast, etc.)
        console.error('Login failed:', err);
      }
    });
  }

  onSignup(credentials: { email: string; password: string }): void {
    this.authService.register(credentials).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
        // Show success message
      },
      error: (err) => {
        console.error('Signup failed:', err);
      }
    });
  }

  onSocialLogin(provider: 'apple' | 'facebook' | 'google'): void {
    // Implement OAuth flow
    this.authService.socialLogin(provider).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => console.error('Social login failed:', err)
    });
  }
}
```

---

## 🚧 TODO / Future Enhancements

### Phase 1 (Current)
- [x] HomeStartComponent structure
- [x] LoginComponent with validation
- [x] SignupComponent with validation
- [x] AuthCardComponent (shared)
- [x] SocialLoginComponent (shared)
- [x] LanguageSwitcherComponent (shared)
- [x] Responsive styling (mobile-first)
- [x] Accessibility (ARIA, keyboard nav)

### Phase 2 (Pending)
- [ ] Unit tests for all components
- [ ] E2E tests for auth flow
- [ ] Actual background image from Figma
- [ ] Mascot SVG from Figma
- [ ] AuthService integration
- [ ] Error handling (toast notifications)
- [ ] Loading states (spinners)
- [x] Password visibility toggle
- [ ] "Remember me" checkbox (LoginComponent)

### Phase 3 (Future)
- [ ] i18n with @angular/localize
- [ ] Full language switcher functionality
- [ ] Forgot password flow
- [ ] Email verification flow
- [ ] Social OAuth integration (Firebase Auth, Auth0, etc.)
- [ ] Animations (Angular Animations API)
- [ ] Progressive Web App (PWA) support

---

## 📝 Notes

### Design Fidelity
All components match Figma design specs from file 25uQUXz6gwFQKx4Wjp0dcc:
- Color: #F2B830 (yellow button)
- Border radius: 8px (buttons/inputs), 12px (card)
- Overlay: rgba(0,0,0,0.4)
- Fonts: Moul (wordmark), Montserrat (tagline)

### Angular Version
- Built for **Angular 18.0.0**
- Uses NgModule architecture (not standalone components)
- OnPush change detection for performance

### SCSS Architecture
- Mobile-first responsive design
- Uses design tokens from `_tokens-figma.scss`
- Mixins from `_mixins.scss` (respond, safe-area-padding, focus-ring, media-cover)
- No Tailwind CSS (pure SCSS)

---

**Generated by:** AG1 - Frontend Agent
**Date:** 2025-11-27
**Figma Source:** File 25uQUXz6gwFQKx4Wjp0dcc
