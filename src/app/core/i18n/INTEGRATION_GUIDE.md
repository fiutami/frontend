# Quick Integration Guide - I18n Module

## Step-by-Step Integration

### 1. Import I18nModule in AppModule

**File: `/home/frisco/projects/fiutami/src/app/app.module.ts`**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { I18nModule } from './core/i18n';  // ADD THIS

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    I18nModule  // ADD THIS
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 2. Initialize in AppComponent (Optional)

**File: `/home/frisco/projects/fiutami/src/app/app.component.ts`**

```typescript
import { Component, OnInit } from '@angular/core';
import { LanguageService } from './core/i18n';  // ADD THIS

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fiutami';

  constructor(private languageService: LanguageService) {}  // ADD THIS

  ngOnInit(): void {
    // Language is auto-initialized - this is just for logging
    console.log('App started with language:', this.languageService.currentLanguage);
  }
}
```

### 3. Use Translations in Any Component

#### Example: Login Component

**login.component.html:**
```html
<div class="login-container">
  <h1>{{ 'auth.loginTitle' | translate }}</h1>

  <form [formGroup]="loginForm">
    <input
      type="email"
      formControlName="email"
      [placeholder]="'auth.emailPlaceholder' | translate">

    <input
      type="password"
      formControlName="password"
      [placeholder]="'auth.passwordPlaceholder' | translate">

    <button type="submit">{{ 'auth.loginButton' | translate }}</button>
  </form>

  <a routerLink="/forgot-password">
    {{ 'auth.forgotPassword' | translate }}
  </a>

  <p>{{ 'auth.termsAccept' | translate }}</p>
</div>
```

#### Example: Language Switcher Component

**Create: `src/app/shared/components/language-switcher/language-switcher.component.ts`**

```typescript
import { Component } from '@angular/core';
import { LanguageService, SupportedLanguage } from '../../../core/i18n';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent {
  currentLang: SupportedLanguage;
  availableLanguages = this.languageService.availableLanguages;
  isDropdownOpen = false;

  constructor(private languageService: LanguageService) {
    this.currentLang = this.languageService.currentLanguage;

    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectLanguage(langCode: SupportedLanguage): void {
    this.languageService.setLanguage(langCode);
    this.isDropdownOpen = false;
  }

  getCurrentLanguageConfig() {
    return this.languageService.currentLanguageConfig;
  }
}
```

**language-switcher.component.html:**
```html
<div class="language-switcher">
  <button
    class="lang-button"
    (click)="toggleDropdown()"
    [attr.aria-label]="'common.language' | translate">
    {{ getCurrentLanguageConfig()?.flag }}
    {{ getCurrentLanguageConfig()?.nativeName }}
  </button>

  <ul class="lang-dropdown" *ngIf="isDropdownOpen">
    <li
      *ngFor="let lang of availableLanguages"
      (click)="selectLanguage(lang.code)"
      [class.active]="lang.code === currentLang">
      {{ lang.flag }} {{ lang.nativeName }}
    </li>
  </ul>
</div>
```

**language-switcher.component.scss:**
```scss
.language-switcher {
  position: relative;

  .lang-button {
    padding: 8px 16px;
    background: transparent;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background-color: #f5f5f5;
    }
  }

  .lang-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    list-style: none;
    padding: 0;
    min-width: 150px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;

    li {
      padding: 12px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;

      &:hover {
        background-color: #f5f5f5;
      }

      &.active {
        background-color: #e3f2fd;
        font-weight: 600;
      }
    }
  }
}
```

### 4. Use in Navigation Header

**Example: Add to your header component**

```html
<!-- header.component.html -->
<header class="main-header">
  <div class="logo">Fiutami</div>

  <nav>
    <a routerLink="/">{{ 'navigation.home' | translate }}</a>
    <a routerLink="/services">{{ 'navigation.services' | translate }}</a>
    <a routerLink="/about">{{ 'navigation.about' | translate }}</a>
  </nav>

  <!-- Add language switcher here -->
  <app-language-switcher></app-language-switcher>

  <div class="auth-buttons">
    <button routerLink="/login">{{ 'auth.login' | translate }}</button>
    <button routerLink="/signup">{{ 'auth.signup' | translate }}</button>
  </div>
</header>
```

## Translation Keys Reference

### Common UI
```typescript
'common.language'    // "Lingua" (IT) / "Language" (EN)
'common.back'        // "Indietro" / "Back"
'common.save'        // "Salva" / "Save"
'common.cancel'      // "Annulla" / "Cancel"
```

### Authentication
```typescript
'auth.login'              // "Accedi" / "Login"
'auth.signup'             // "Registrati" / "Sign Up"
'auth.email'              // "Email"
'auth.password'           // "Password"
'auth.forgotPassword'     // "Dimenticata la password?" / "Forgot password?"
'auth.termsAccept'        // Terms acceptance text
```

### Hero/Landing
```typescript
'hero.tagline'      // "Fiuta la tua soluzione ideale"
'hero.subtitle'     // Subtitle text
'hero.cta'          // Call-to-action button
```

### Validation
```typescript
'validation.emailRequired'      // "L'email è obbligatoria"
'validation.emailInvalid'       // "Inserisci un'email valida"
'validation.passwordRequired'   // "La password è obbligatoria"
'validation.passwordMinLength'  // "Password minimo 8 caratteri"
```

### Errors
```typescript
'errors.required'        // "Questo campo è obbligatorio"
'errors.invalidEmail'    // "Email non valida"
'errors.serverError'     // Generic server error
'errors.networkError'    // Connection error
```

## Testing Languages

### In Browser Console
```javascript
// Get current language
window.localStorage.getItem('fiutami_lang')

// Change language manually
window.localStorage.setItem('fiutami_lang', 'en')
window.location.reload()
```

### In Component TypeScript
```typescript
// Switch language programmatically
this.languageService.setLanguage('en');  // English
this.languageService.setLanguage('it');  // Italian
this.languageService.setLanguage('fr');  // French
this.languageService.setLanguage('de');  // German
this.languageService.setLanguage('es');  // Spanish

// Get current language
console.log(this.languageService.currentLanguage);

// Subscribe to changes
this.languageService.currentLanguage$.subscribe(lang => {
  console.log('Language changed to:', lang);
});
```

## Completion Status

| Language | Code | Completion | Notes |
|----------|------|------------|-------|
| Italian  | it   | 100%       | Primary language - Complete |
| English  | en   | 100%       | Complete |
| French   | fr   | 100%       | Complete |
| German   | de   | 100%       | Complete |
| Spanish  | es   | 100%       | Complete |

All languages now include:
- Common UI strings
- Authentication screens (login, signup)
- Hero/landing page
- Navigation
- Footer
- Form validation
- Error messages

## Next Steps

1. **Add I18nModule to AppModule** (see Step 1 above)
2. **Create Language Switcher Component** (copy code from Example above)
3. **Replace hardcoded strings** in existing components with `{{ 'key' | translate }}`
4. **Test each language** by switching in the UI
5. **Add new keys** as needed for new features

## Support

For issues or questions:
- Check `/home/frisco/projects/fiutami/src/app/core/i18n/README.md` for detailed docs
- Review translation files in `/home/frisco/projects/fiutami/src/assets/i18n/`
- Test language switching in browser console

## Files Location

```
src/
├── app/
│   └── core/
│       └── i18n/
│           ├── i18n.module.ts              (Import this in AppModule)
│           ├── language.service.ts         (Service for language switching)
│           ├── translate-loader.factory.ts (Internal - loads JSON files)
│           ├── index.ts                    (Public API exports)
│           ├── README.md                   (Detailed documentation)
│           └── INTEGRATION_GUIDE.md        (This file)
└── assets/
    └── i18n/
        ├── it.json  (Italian - 100%)
        ├── en.json  (English - 100%)
        ├── fr.json  (French - 100%)
        ├── de.json  (German - 100%)
        └── es.json  (Spanish - 100%)
```
