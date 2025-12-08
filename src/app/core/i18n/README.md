# I18n Module - Internationalization Setup

## Overview

This module provides multi-language support for the Fiutami Angular application using `@ngx-translate/core`.

**Supported Languages:**
- 🇮🇹 Italian (it) - Primary language - 100% complete
- 🇬🇧 English (en) - 100% complete
- 🇫🇷 French (fr) - 100% complete
- 🇩🇪 German (de) - 100% complete
- 🇪🇸 Spanish (es) - 100% complete

## Installation

Dependencies are already installed via:
```bash
npm install @ngx-translate/core @ngx-translate/http-loader
```

## Integration with AppModule

### Step 1: Import I18nModule in AppModule

Update `/home/frisco/projects/fiutami/src/app/app.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { I18nModule } from './core/i18n';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    I18nModule  // Add this import
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Step 2: Initialize Language in AppComponent

Update `/home/frisco/projects/fiutami/src/app/app.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { LanguageService } from './core/i18n';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fiutami';

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    // Language is automatically initialized from localStorage or defaults to 'it'
    console.log('Current language:', this.languageService.currentLanguage);
  }
}
```

## Usage in Components

### Using TranslatePipe in Templates

```html
<!-- Simple translation -->
<h1>{{ 'hero.tagline' | translate }}</h1>

<!-- Translation with parameters -->
<p>{{ 'footer.copyright' | translate: {year: 2025} }}</p>

<!-- Common patterns -->
<button>{{ 'auth.login' | translate }}</button>
<input [placeholder]="'auth.emailPlaceholder' | translate">
```

### Using LanguageService in Components

```typescript
import { Component } from '@angular/core';
import { LanguageService, SupportedLanguage } from './core/i18n';

@Component({
  selector: 'app-language-switcher',
  template: `
    <select [value]="currentLang" (change)="onLanguageChange($event)">
      <option *ngFor="let lang of availableLanguages" [value]="lang.code">
        {{ lang.flag }} {{ lang.nativeName }}
      </option>
    </select>
  `
})
export class LanguageSwitcherComponent {
  currentLang: SupportedLanguage;
  availableLanguages = this.languageService.availableLanguages;

  constructor(private languageService: LanguageService) {
    this.currentLang = this.languageService.currentLanguage;
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const langCode = select.value as SupportedLanguage;
    this.languageService.setLanguage(langCode);
    this.currentLang = langCode;
  }
}
```

### Programmatic Translation

```typescript
import { Component, OnInit } from '@angular/core';
import { LanguageService } from './core/i18n';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html'
})
export class ExampleComponent implements OnInit {
  welcomeMessage: string = '';

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    // Get translation asynchronously (Observable)
    this.languageService.getTranslation('hero.tagline').subscribe(
      translation => this.welcomeMessage = translation
    );

    // Get instant translation (synchronous)
    const buttonText = this.languageService.getInstantTranslation('auth.login');
    console.log(buttonText); // "Accedi" (if language is 'it')
  }
}
```

## Translation File Structure

All translation files are located in `/home/frisco/projects/fiutami/src/assets/i18n/`:

```
src/assets/i18n/
├── it.json  (Italian - Primary)
├── en.json  (English)
├── fr.json  (French)
├── de.json  (German)
└── es.json  (Spanish)
```

### Translation Keys Structure

```json
{
  "common": {
    // Common UI elements (buttons, labels, etc.)
  },
  "auth": {
    // Authentication related (login, signup, password)
  },
  "hero": {
    // Landing page hero section
  },
  "navigation": {
    // Navigation menu items
  },
  "footer": {
    // Footer links and copyright
  },
  "errors": {
    // Generic error messages
  },
  "validation": {
    // Form validation messages
  }
}
```

## Adding New Translations

### 1. Add Key to Translation Files

Add the same key to all language files:

**it.json:**
```json
{
  "profile": {
    "settings": "Impostazioni"
  }
}
```

**en.json:**
```json
{
  "profile": {
    "settings": "Settings"
  }
}
```

### 2. Use in Component

```html
<h2>{{ 'profile.settings' | translate }}</h2>
```

## Language Persistence

The selected language is automatically saved to `localStorage` with the key `fiutami_lang`.

When the user revisits the app, the language preference is restored automatically.

## Testing Translations

### View Current Language
```typescript
console.log(this.languageService.currentLanguage);
```

### Switch Language Programmatically
```typescript
this.languageService.setLanguage('en');  // Switch to English
this.languageService.setLanguage('it');  // Switch to Italian
```

### Subscribe to Language Changes
```typescript
this.languageService.currentLanguage$.subscribe(lang => {
  console.log('Language changed to:', lang);
});
```

## Form Validation with Translations

Example of using translated validation messages:

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from './core/i18n';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);

    if (control?.hasError('required')) {
      return this.languageService.getInstantTranslation(`validation.${controlName}Required`);
    }
    if (control?.hasError('email')) {
      return this.languageService.getInstantTranslation('validation.emailInvalid');
    }
    if (control?.hasError('minlength')) {
      return this.languageService.getInstantTranslation('validation.passwordMinLength');
    }

    return '';
  }
}
```

## Best Practices

1. **Always use translation keys** - Never hardcode text strings in templates
2. **Use semantic key names** - `auth.loginButton` instead of `buttons.btn1`
3. **Keep translations synchronized** - When adding a key, add it to ALL language files
4. **Use parameters for dynamic content** - `{{ 'footer.copyright' | translate: {year: currentYear} }}`
5. **Group related translations** - Use nested objects (`auth.*`, `navigation.*`, etc.)
6. **Test all languages** - Verify text fits in UI for all supported languages

## Troubleshooting

### Translation Not Showing

1. Check console for errors
2. Verify the translation key exists in the JSON file
3. Ensure I18nModule is imported in AppModule
4. Check for typos in translation keys

### Language Not Persisting

1. Check browser localStorage is enabled
2. Verify `fiutami_lang` key exists in localStorage
3. Clear browser cache and try again

### Missing Translation Warning

If you see `Translation for 'key' not found`, add the missing key to all language files.

## Next Steps

1. Create a language switcher component (e.g., in navigation header)
2. Add language selection to user profile settings
3. Implement translation guards for protected routes
4. Add more translation keys as new features are developed

## Files Created

- `/home/frisco/projects/fiutami/src/app/core/i18n/i18n.module.ts`
- `/home/frisco/projects/fiutami/src/app/core/i18n/language.service.ts`
- `/home/frisco/projects/fiutami/src/app/core/i18n/translate-loader.factory.ts`
- `/home/frisco/projects/fiutami/src/app/core/i18n/index.ts`
- `/home/frisco/projects/fiutami/src/assets/i18n/it.json`
- `/home/frisco/projects/fiutami/src/assets/i18n/en.json`
- `/home/frisco/projects/fiutami/src/assets/i18n/fr.json`
- `/home/frisco/projects/fiutami/src/assets/i18n/de.json`
- `/home/frisco/projects/fiutami/src/assets/i18n/es.json`
