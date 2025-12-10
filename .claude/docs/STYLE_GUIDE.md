# Fiutami Style Guide

> Guida completa al Design System per garantire consistenza UI in tutto il progetto.

---

## Indice

1. [Typography](#typography)
2. [Spacing](#spacing)
3. [Colori](#colori)
4. [Componenti](#componenti)
5. [Responsive Design](#responsive-design)
6. [Accessibilita](#accessibilita)

---

## Typography

### Classi Typography

| Classe | Mobile | Desktop | Uso |
|--------|--------|---------|-----|
| `.text-display` | 36px | 48px | Hero headlines, titoli principali |
| `.text-h1` | 28px | 36px | Titoli di pagina |
| `.text-h2` | 24px | 28px | Titoli di sezione |
| `.text-h3` | 20px | 24px | Titoli card |
| `.text-body-lg` | 18px | 20px | Lead text, sottotitoli |
| `.text-body` | 16px | 16px | Testo standard |
| `.text-sm` | 14px | 14px | Testo secondario |
| `.text-xs` | 12px | 10px | Terms, caption |

### Font Families

```scss
// Display font (logo, "Fiuta")
$font-family-display: 'Moul', serif;

// Body font (tutti i testi)
$font-family-body: 'Inria Sans', 'Montserrat', sans-serif;
```

### Colori Testo

| Classe | Valore | Uso |
|--------|--------|-----|
| `.text-primary` | `#111111` | Testo principale su sfondo chiaro |
| `.text-secondary` | `#666666` | Testo secondario |
| `.text-inverse` | `#FFFFFF` | Testo su sfondo scuro |
| `.text-dark` | `#000000` | Testo nero puro |
| `.text-cta` | `#F2B830` | Testo accento/CTA |

### Allineamento

```html
<p class="text-center">Centrato</p>
<p class="text-left">Sinistra</p>
<p class="text-right">Destra</p>

<!-- Responsive -->
<p class="text-left md:text-center">Sinistra mobile, centrato desktop</p>
```

---

## Spacing

### Scale Spacing

| Nome | Valore | Token SCSS |
|------|--------|------------|
| `xs` | 8px | `$spacing-xs` |
| `sm` | 12px | `$spacing-sm` |
| `md` | 16px | `$spacing-md` |
| `lg` | 24px | `$spacing-lg` |
| `xl` | 32px | `$spacing-xl` |
| `2xl` | 48px | `$spacing-2xl` |

### Classi Margin

```html
<!-- Tutti i lati -->
<div class="m-md">margin: 16px</div>

<!-- Singoli lati -->
<div class="mt-lg">margin-top: 24px</div>
<div class="mb-sm">margin-bottom: 12px</div>
<div class="ml-xs">margin-left: 8px</div>
<div class="mr-xl">margin-right: 32px</div>

<!-- Orizzontale/Verticale -->
<div class="mx-auto">margin-left/right: auto</div>
<div class="my-lg">margin-top/bottom: 24px</div>
```

### Classi Padding

```html
<div class="p-md">padding: 16px</div>
<div class="pt-lg">padding-top: 24px</div>
<div class="px-xl">padding-left/right: 32px</div>
<div class="py-sm">padding-top/bottom: 12px</div>
```

### Gap (Flex/Grid)

```html
<div class="flex gap-md">gap: 16px</div>
<div class="grid gap-lg">gap: 24px</div>
```

### Responsive Spacing

```html
<!-- Mobile: padding 16px, Desktop: padding 32px -->
<div class="p-md md:p-xl">...</div>

<!-- Mobile: gap 12px, Desktop: gap 24px -->
<div class="flex gap-sm md:gap-lg">...</div>
```

---

## Colori

### Colori Principali

| Token | Valore | Uso |
|-------|--------|-----|
| `$color-cta-primary` | `#F2B830` | Bottoni primari, accent |
| `$color-primary-500` | `#F5A623` | Background brand |
| `$color-overlay-dark` | `rgba(0,0,0,0.4)` | Card auth |
| `$color-overlay-light` | `rgba(0,0,0,0.2)` | Dimming background |

### Colori Testo

| Token | Valore | Uso |
|-------|--------|-----|
| `$color-text-primary` | `#111111` | Testo principale |
| `$color-text-secondary` | `#666666` | Testo secondario |
| `$color-text-inverse` | `#FFFFFF` | Su sfondo scuro |
| `$color-text-dark` | `#000000` | Testo su CTA giallo |

### Colori Input

| Token | Valore | Uso |
|-------|--------|-----|
| `$color-input-border` | `#FFFFFF` | Bordi input su dark |
| `$color-input-background` | `transparent` | Sfondo input |
| Error | `#FF6B6B` | Errori su dark background |

---

## Componenti

### ButtonComponent

```html
<app-button
  variant="primary"
  size="md"
  [fullWidth]="true"
  [loading]="isLoading"
  [disabled]="isDisabled"
  (clicked)="onAction()">
  Testo Bottone
</app-button>
```

**Props:**

| Prop | Tipo | Default | Descrizione |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'outline' \| 'ghost'` | `'primary'` | Stile bottone |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dimensione |
| `type` | `'button' \| 'submit'` | `'button'` | Tipo HTML |
| `disabled` | `boolean` | `false` | Disabilitato |
| `loading` | `boolean` | `false` | Mostra spinner |
| `fullWidth` | `boolean` | `false` | Larghezza 100% |
| `ariaLabel` | `string` | - | Label accessibilita |

**Varianti:**

- `primary`: Sfondo giallo `#F2B830`, testo nero
- `outline`: Bordo bianco, sfondo trasparente, testo bianco
- `ghost`: Nessun bordo, sfondo trasparente, testo bianco

### FormInputComponent

```html
<app-form-input
  label="Email"
  type="email"
  formControlName="email"
  placeholder="inserisci email"
  autocomplete="email"
  [hasError]="email?.invalid && email?.touched"
  [errorMessage]="getEmailError()"
  hint="Suggerimento opzionale">
</app-form-input>
```

**Props:**

| Prop | Tipo | Default | Descrizione |
|------|------|---------|-------------|
| `label` | `string` | - | Etichetta campo |
| `type` | `'text' \| 'email' \| 'password' \| 'tel' \| 'number'` | `'text'` | Tipo input |
| `placeholder` | `string` | `''` | Placeholder |
| `hint` | `string` | `''` | Hint sotto input |
| `errorMessage` | `string` | `''` | Messaggio errore |
| `hasError` | `boolean` | `false` | Mostra stato errore |
| `autocomplete` | `string` | `'off'` | Autocomplete HTML |

**Implementa ControlValueAccessor** per integrazione con Reactive Forms.

### CardComponent

```html
<app-card variant="overlay" padding="md">
  <h3>Titolo Card</h3>
  <p>Contenuto card...</p>
</app-card>
```

**Props:**

| Prop | Tipo | Default | Descrizione |
|------|------|---------|-------------|
| `variant` | `'overlay' \| 'solid' \| 'transparent'` | `'overlay'` | Stile sfondo |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding interno |
| `rounded` | `boolean` | `true` | Border radius |

**Varianti:**

- `overlay`: Sfondo `rgba(0,0,0,0.4)` con backdrop blur
- `solid`: Sfondo bianco con shadow
- `transparent`: Nessuno sfondo

### IconButtonComponent

```html
<app-icon-button
  variant="glass"
  size="md"
  ariaLabel="Torna indietro"
  (clicked)="onBack()">
  <svg>...</svg>
</app-icon-button>
```

**Props:**

| Prop | Tipo | Default | Descrizione |
|------|------|---------|-------------|
| `variant` | `'default' \| 'ghost' \| 'glass'` | `'default'` | Stile |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dimensione |
| `ariaLabel` | `string` | **required** | Label accessibilita |
| `disabled` | `boolean` | `false` | Disabilitato |

---

## Responsive Design

### Breakpoints

| Nome | Valore | Uso |
|------|--------|-----|
| `xs` | 0px | Mobile base |
| `sm` | 480px | Mobile large |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop large |

### Utilizzo in SCSS

```scss
@import 'src/styles/mixins';

.component {
  // Mobile first
  padding: $spacing-md;

  @include respond(md) {
    // Tablet+
    padding: $spacing-lg;
  }

  @include respond(lg) {
    // Desktop+
    padding: $spacing-xl;
  }
}
```

### Utilizzo Classi Utility

```html
<!-- Nascondere su mobile, mostrare su desktop -->
<div class="hidden md:block">Visibile solo da tablet</div>

<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Spacing responsive -->
<div class="p-md md:p-lg lg:p-xl">...</div>
```

---

## Accessibilita

### Focus Ring

Tutti i componenti interattivi hanno focus ring visibile:

```scss
@include focus-ring($color-cta-primary);
```

### Touch Targets

Dimensione minima touch target: **44px x 44px** (WCAG 2.1)

```scss
// IconButton md size
width: 40px;  // mobile
width: 44px;  // tablet+
height: 40px; // mobile
height: 44px; // tablet+
```

### ARIA Labels

```html
<!-- Bottone con icona richiede aria-label -->
<app-icon-button ariaLabel="Torna indietro">
  <svg>...</svg>
</app-icon-button>

<!-- Immagini decorative -->
<img src="..." alt="" role="presentation" />

<!-- Form errors -->
<input aria-describedby="email-error" />
<span id="email-error" role="alert">Errore</span>
```

### Screen Reader Only

```html
<span class="sr-only">Testo solo per screen reader</span>
```

### Colori

- Contrasto minimo 4.5:1 per testo normale
- Contrasto minimo 3:1 per testo grande
- Non usare solo colore per comunicare stato (aggiungere icone/testo)

---

## Convenzioni Naming

### File SCSS

- Variabili: `$color-nome`, `$spacing-nome`, `$typography-nome`
- Mixins: `@include nome-mixin()`
- Classi: BEM `.block__element--modifier`

### Componenti Angular

- Selector: `app-nome-componente`
- File: `nome-componente.component.ts/html/scss`
- Classe: `NomeComponenteComponent`

### Classi CSS Utility

- Layout: `.flex`, `.grid`, `.block`, `.hidden`
- Spacing: `.m-{size}`, `.p-{size}`, `.gap-{size}`
- Typography: `.text-{size}`, `.font-{weight}`
- Responsive: `.{breakpoint}:{utility}` (es. `.md:flex`)

---

## Import SCSS nei Componenti

```scss
// All'inizio di ogni component.scss
@import 'src/styles/tokens-figma';
@import 'src/styles/mixins';

.my-component {
  // usa tokens e mixins
  color: $color-text-primary;
  padding: $spacing-md;

  @include respond(md) {
    padding: $spacing-lg;
  }
}
```

---

## Quick Reference

### Button

```html
<!-- Primary -->
<app-button variant="primary" [fullWidth]="true">Accedi</app-button>

<!-- Outline -->
<app-button variant="outline" [fullWidth]="true">Registrati</app-button>

<!-- Con loading -->
<app-button [loading]="isLoading">Salva</app-button>
```

### Form

```html
<app-form-input
  label="Email"
  type="email"
  formControlName="email"
  [hasError]="email?.invalid && email?.touched"
  [errorMessage]="'Email non valida'">
</app-form-input>
```

### Card

```html
<app-card variant="overlay">
  <!-- contenuto -->
</app-card>
```

### Layout

```html
<div class="flex flex-col gap-md md:flex-row md:gap-lg">
  <div class="flex-1">Col 1</div>
  <div class="flex-1">Col 2</div>
</div>
```
