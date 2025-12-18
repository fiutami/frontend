# Fiutami — Claude Code Integration Guide

> Documentazione completa per l'integrazione di Claude Code (VSCode/CLI) e pipeline Figma-to-Code per generazione automatica componenti Angular.

---

> ⚠️ **IMPORTANTE**: Per la documentazione globale dell'organizzazione Fiutami (tutti e 7 i repository, server, secrets, comandi), consulta:
>
> 📁 **[FIUTAMI-GLOBAL.md](./FIUTAMI-GLOBAL.md)**
>
> Questo file (CLAUDE.md) è specifico per il repository **frontend** e l'integrazione Figma-to-Code.

---

## 📋 Indice

1. [Architettura Overview](#architettura-overview)
2. [Setup Claude Code](#setup-claude-code)
3. [Integrazione Figma via MCP](#integrazione-figma-via-mcp)
4. [Pipeline Figma-to-Code](#pipeline-figma-to-code)
5. [Design System Sync](#design-system-sync)
6. [Workflow Development](#workflow-development)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architettura Overview

### Componenti Principali

```
┌─────────────────┐
│  FIGMA DESIGN   │
│  Design System  │
│  + Components   │
└────────┬────────┘
         │
         │ Figma API / Export JSON
         ↓
┌─────────────────────────────┐
│  MCP SERVER (Figma)         │
│  • Design Token Extraction  │
│  • Component Analysis       │
│  • Spec Generation          │
└────────┬────────────────────┘
         │
         │ Claude Desktop Integration
         ↓
┌─────────────────────────────┐
│  CLAUDE CODE (VSCode/CLI)   │
│  • Component Generation     │
│  • Token Sync               │
│  • Test Generation          │
│  • Documentation            │
└────────┬────────────────────┘
         │
         │ Angular Code
         ↓
┌─────────────────────────────┐
│  FIUTAMI ANGULAR APP        │
│  src/app/components/        │
│  src/styles/_tokens.scss    │
│  src/assets/                │
└─────────────────────────────┘
```

### Flusso di Lavoro Automatizzato

1. **Designer → Figma**: Crea/modifica componenti seguendo naming convention
2. **Figma → MCP Server**: Export automatico design tokens + specifiche componenti
3. **MCP → Claude Desktop**: Sincronizzazione real-time delle modifiche
4. **Claude Code → Angular**: Generazione automatica TypeScript/SCSS/HTML
5. **Human Review**: Verifica e approvazione modifiche generate
6. **Commit & Deploy**: Push automatico su branch feature

---

## 🚀 Setup Claude Code

### 1. Installazione Claude Code CLI

```bash
# Installa Claude Code CLI globally
npm install -g @anthropic/claude-code-cli

# Verifica installazione
claude --version
```

### 2. Configurazione Workspace

Il file `.clauderc` nella root del progetto configura Claude Code per questo repository:

```json
{
  "version": "1.0",
  "project": {
    "name": "fiutami",
    "type": "angular",
    "description": "Fiutami Angular WebApp con integrazione Figma-to-Code"
  },
  "paths": {
    "components": "src/app",
    "styles": "src/styles",
    "assets": "src/assets",
    "figmaSpecs": ".figma/specs",
    "templates": ".claude/templates"
  },
  "codeGeneration": {
    "framework": "angular",
    "version": "18.0.0",
    "styleLanguage": "scss",
    "testFramework": "jasmine",
    "componentPrefix": "app",
    "moduleFormat": "ngmodule"
  },
  "figmaIntegration": {
    "enabled": true,
    "autoSync": true,
    "tokenMapping": ".figma/token-mapping.json",
    "componentRules": ".figma/component-rules.json"
  }
}
```

### 3. VSCode Extension Setup

**Estensioni richieste:**
- `Anthropic.claude-code` (Claude Code VSCode Extension)
- `Angular.ng-template` (Angular Language Service)
- `esbenp.prettier-vscode` (Formatting)
- `dbaeumer.vscode-eslint` (Linting)

**Settings (workspace `.vscode/settings.json`):**

```json
{
  "claude.autoComplete": true,
  "claude.figmaIntegration": true,
  "claude.componentGeneration.enabled": true,
  "claude.testGeneration.enabled": true,
  "angular.enableStrictMode": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 4. Comandi CLI Disponibili

```bash
# Genera componente da specifica Figma
npm run figma:generate -- --component=ButtonPrimary

# Sincronizza design tokens da Figma
npm run figma:sync-tokens

# Genera componente Angular completo (TS + HTML + SCSS + Test)
npm run component:generate -- --name=feature-card --type=component

# Analizza differenze Figma vs Codebase
npm run figma:diff

# Genera documentazione componenti
npm run docs:generate
```

---

## 🎨 Integrazione Figma via MCP

### Model Context Protocol (MCP) Server

Il MCP Server connette Figma a Claude Desktop, permettendo a Claude Code di accedere ai design in real-time.

### Setup MCP per Figma

**1. Installa MCP Server Figma (Official)**

```bash
# Via npm
npm install -g @anthropic-ai/mcp-server-figma

# Oppure via Claude Desktop config
# Aggiungi a ~/.config/claude-desktop/config.json
```

**2. Configurazione Claude Desktop**

File: `~/.config/claude-desktop/config.json` (macOS/Linux) o `%APPDATA%/claude-desktop/config.json` (Windows)

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-figma"],
      "env": {
        "FIGMA_PERSONAL_ACCESS_TOKEN": "figd_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

**3. Ottieni Figma Access Token**

1. Vai su Figma → Account Settings → Personal Access Tokens
2. Genera nuovo token con scope: `file:read`, `variables:read`
3. Copia token e aggiungi a `config.json` sopra

### Export Configuration Figma

**File: `.figma/export-config.json`**

```json
{
  "fileId": "YOUR_FIGMA_FILE_ID",
  "outputDir": ".figma/specs",
  "exports": {
    "designTokens": {
      "enabled": true,
      "format": "scss",
      "outputFile": "src/styles/_tokens-figma.scss",
      "categories": ["colors", "typography", "spacing", "shadows", "effects"]
    },
    "components": {
      "enabled": true,
      "format": "json",
      "outputDir": ".figma/specs/components",
      "includeVariants": true,
      "includeProperties": true,
      "includeAssets": true
    },
    "assets": {
      "enabled": true,
      "format": ["svg", "png@2x"],
      "outputDir": "src/assets/figma",
      "optimize": true
    }
  },
  "namingConvention": {
    "components": "PascalCase",
    "variants": "kebab-case",
    "properties": "camelCase"
  }
}
```

### Naming Convention Figma

Per garantire generazione automatica corretta, segui queste convenzioni nei nomi Figma:

**Componenti:**
```
Button/Primary            → ButtonPrimaryComponent
Card/Product             → CardProductComponent
Form/Input/Text          → FormInputTextComponent
Navigation/Header/Mobile → NavigationHeaderMobileComponent
```

**Varianti:**
```
size=small     → [size]="'small'"
state=disabled → [disabled]="true"
type=primary   → [type]="'primary'"
```

**Design Tokens:**
```
color/primary/500   → $color-primary-500
spacing/md          → $spacing-md
typography/h1/size  → $typography-h1-size
shadow/elevated     → $shadow-elevated
```

---

## ⚙️ Pipeline Figma-to-Code

### Processo Automatico

**1. Figma Export → JSON Spec**

Quando salvi modifiche in Figma, il MCP server genera automaticamente:

```json
{
  "componentName": "ButtonPrimary",
  "type": "component",
  "framework": "angular",
  "structure": {
    "tag": "button",
    "classes": ["btn", "btn-primary"],
    "properties": {
      "label": "string",
      "disabled": "boolean",
      "size": "'small' | 'medium' | 'large'",
      "variant": "'solid' | 'outline' | 'ghost'"
    }
  },
  "styles": {
    "backgroundColor": "$color-primary-500",
    "padding": "$spacing-md $spacing-lg",
    "borderRadius": "$border-radius-md",
    "fontSize": "$font-size-base"
  },
  "interactions": {
    "onClick": true,
    "onHover": true
  },
  "accessibility": {
    "role": "button",
    "ariaLabel": "{{label}}"
  }
}
```

**2. Claude Code Analysis**

Claude Code legge la spec e:
- Analizza struttura componente
- Mappa design tokens a variabili SCSS esistenti
- Identifica pattern riutilizzabili
- Genera codice TypeScript + HTML + SCSS

**3. Code Generation**

**TypeScript (.ts):**
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button-primary',
  templateUrl: './button-primary.component.html',
  styleUrls: ['./button-primary.component.scss']
})
export class ButtonPrimaryComponent {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'solid' | 'outline' | 'ghost' = 'solid';
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
```

**HTML (.html):**
```html
<button
  [class]="'btn btn-primary btn-' + size + ' btn-' + variant"
  [disabled]="disabled"
  (click)="onClick()"
  [attr.aria-label]="label"
  type="button">
  {{ label }}
</button>
```

**SCSS (.scss):**
```scss
@import 'src/styles/tokens';
@import 'src/styles/mixins';

.btn {
  padding: $spacing-md $spacing-lg;
  border-radius: $border-radius-md;
  font-size: $font-size-base;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-primary {
  background-color: $color-primary-500;
  color: $color-text-inverse;

  &:hover:not(:disabled) {
    background-color: darken($color-primary-500, 10%);
  }
}

// Size variants
.btn-small { font-size: $font-size-sm; padding: $spacing-sm $spacing-md; }
.btn-medium { font-size: $font-size-base; padding: $spacing-md $spacing-lg; }
.btn-large { font-size: $font-size-lg; padding: $spacing-lg $spacing-xl; }

// Style variants
.btn-outline { /* ... */ }
.btn-ghost { /* ... */ }
```

**4. Test Generation**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonPrimaryComponent } from './button-primary.component';

describe('ButtonPrimaryComponent', () => {
  let component: ButtonPrimaryComponent;
  let fixture: ComponentFixture<ButtonPrimaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonPrimaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonPrimaryComponent);
    component = fixture.componentInstance;
  });

  it('should emit clicked event when button is clicked', () => {
    spyOn(component.clicked, 'emit');
    component.onClick();
    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should not emit event when disabled', () => {
    component.disabled = true;
    spyOn(component.clicked, 'emit');
    component.onClick();
    expect(component.clicked.emit).not.toHaveBeenCalled();
  });
});
```

---

## 🎨 Design System Sync

### Token Mapping: Figma ↔ SCSS

**File: `.figma/token-mapping.json`**

```json
{
  "colors": {
    "figma": "color/",
    "scss": "$color-",
    "mapping": {
      "color/primary/500": "$color-primary-500",
      "color/accent/500": "$color-accent-500",
      "color/text/primary": "$color-text-primary"
    }
  },
  "spacing": {
    "figma": "spacing/",
    "scss": "$spacing-",
    "scale": {
      "xs": "8px",
      "sm": "12px",
      "md": "16px",
      "lg": "24px",
      "xl": "32px"
    }
  },
  "typography": {
    "figma": "typography/",
    "scss": "$typography-",
    "properties": ["size", "weight", "lineHeight", "letterSpacing"]
  }
}
```

### Sincronizzazione Automatica

```bash
# Esegui sync manuale
npm run figma:sync-tokens

# Output: src/styles/_tokens-figma.scss (auto-generated)
```

**File generato: `src/styles/_tokens-figma.scss`**

```scss
// AUTO-GENERATED FROM FIGMA - DO NOT EDIT MANUALLY
// Last sync: 2025-11-17T10:30:00Z

// Colors
$color-primary-500: #F5A623;
$color-accent-500: #4A90E2;
$color-text-primary: #111111;

// Spacing
$spacing-xs: 8px;
$spacing-sm: 12px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// Typography
$typography-h1-size: 48px;
$typography-h1-weight: 700;
$typography-h1-line-height: 1.2;
```

Importa nel file principale:

```scss
// src/styles/styles.scss
@import 'tokens-figma'; // Tokens da Figma
@import 'tokens';       // Tokens custom locali
@import 'mixins';

// I tokens custom sovrascrivono quelli Figma se necessario
```

---

## 🔄 Workflow Development

### Scenario 1: Nuovo Componente da Figma

**Human (Designer):**
1. Crea componente in Figma: `Button/Primary`
2. Applica design tokens (colori, spacing, typography)
3. Documenta variants (size, state, type)
4. Salva modifiche

**Automatic (MCP + Claude):**
```bash
# MCP rileva modifiche e notifica Claude Desktop
# Claude Code CLI esegue automaticamente:
npm run figma:generate -- --component=Button/Primary
```

**Claude Code genera:**
- `src/app/button-primary/button-primary.component.ts`
- `src/app/button-primary/button-primary.component.html`
- `src/app/button-primary/button-primary.component.scss`
- `src/app/button-primary/button-primary.component.spec.ts`
- `src/app/button-primary/button-primary.module.ts`

**Human (Developer) - Review:**
1. Verifica componente generato in VSCode
2. Testa interazioni: `ng serve`
3. Approva o richiedi modifiche a Claude Code
4. Commit quando soddisfatto

### Scenario 2: Modifica Design System

**Human (Designer):**
1. Modifica token in Figma: `color/primary/500: #F5A623 → #FF6B35`
2. Salva modifiche

**Automatic:**
```bash
# Auto-sync tokens
npm run figma:sync-tokens

# Claude Code identifica componenti impattati
npm run figma:diff

# Output:
# 🔍 Componenti impattati dal cambio di $color-primary-500:
#   - ButtonPrimaryComponent
#   - HeroComponent
#   - NavigationComponent
#
# 🔧 Azione suggerita: Rebuild SCSS e test visivi
```

**Human (Developer):**
```bash
# Rebuild app per vedere modifiche
npm start

# Test visual regression (opzionale)
npm run test:visual
```

### Scenario 3: Aggiornamento Componente Esistente

**Human (Developer):**
1. Richiede modifica a Claude Code CLI o VSCode chat
2. Esempio: "Aggiungi prop `loading` a ButtonPrimaryComponent con spinner"

**Claude Code:**
```bash
# Analizza componente esistente
# Genera modifiche TypeScript/HTML/SCSS
# Aggiorna test suite
# Mostra diff per review
```

**Human (Developer):**
1. Review diff
2. Approva modifiche
3. Claude Code applica changes
4. Test automatici eseguiti

---

## ✅ Best Practices

### 1. Naming Convention

**Figma:**
- Componenti: `Category/Subcategory/Name` (es. `Form/Input/Email`)
- Variants: `property=value` (es. `size=large`, `state=error`)
- Tokens: `category/subcategory/property` (es. `color/semantic/error`)

**Angular:**
- Componenti: `CategorySubcategoryNameComponent` (es. `FormInputEmailComponent`)
- Selectors: `app-category-subcategory-name` (es. `app-form-input-email`)
- Files: `category-subcategory-name.component.ts` (es. `form-input-email.component.ts`)

### 2. Design Token Hierarchy

```
Figma Tokens → _tokens-figma.scss (auto-generated)
             ↓
Custom Tokens → _tokens.scss (manual overrides)
             ↓
Components → *.component.scss (consume tokens)
```

### 3. Component Generation Rules

**File: `.figma/component-rules.json`**

```json
{
  "rules": {
    "alwaysGenerateTests": true,
    "useStrictTypeScript": true,
    "generateModule": true,
    "exportInBarrel": true,
    "accessibility": {
      "enforceAriaLabels": true,
      "enforceSemanticHTML": true,
      "enforceKeyboardNav": true
    },
    "responsive": {
      "generateMobileFirst": true,
      "breakpoints": ["xs", "sm", "md", "lg", "xl"]
    },
    "performance": {
      "lazyLoadImages": true,
      "useChangeDetectionOnPush": true
    }
  }
}
```

### 4. Git Workflow con Claude Code

```bash
# Claude Code crea branch automaticamente
git checkout -b feat/button-primary-component

# Genera codice
npm run figma:generate -- --component=Button/Primary

# Claude Code mostra diff per review
git diff

# Human approva e Claude commita
git add src/app/button-primary/
git commit -m "feat: add ButtonPrimaryComponent from Figma design"

# Push su branch feature
git push -u origin feat/button-primary-component

# Human crea PR su GitHub/GitLab
```

### 5. Review Checklist

Prima di approvare codice generato, verifica:

- [ ] TypeScript compila senza errori (`npm run build`)
- [ ] Test passano (`npm test`)
- [ ] Design tokens mappati correttamente
- [ ] Componente responsive (mobile + desktop)
- [ ] Accessibilità (ARIA labels, keyboard nav)
- [ ] Performances (lazy loading, OnPush change detection)
- [ ] Documentazione JSDoc presente

---

## 🔧 Troubleshooting

### MCP Server non si connette

**Problema:** Claude Desktop non vede Figma MCP server

**Soluzione:**
1. Verifica token Figma valido in `config.json`
2. Restart Claude Desktop completamente
3. Controlla logs: `~/.config/claude-desktop/logs/mcp.log`
4. Reinstalla MCP: `npm install -g @anthropic-ai/mcp-server-figma`

### Token Mapping non funziona

**Problema:** Token Figma non matchano SCSS

**Soluzione:**
1. Verifica naming convention in Figma (es. `color/primary/500`)
2. Controlla `.figma/token-mapping.json` per mapping personalizzati
3. Esegui sync manuale: `npm run figma:sync-tokens -- --force`
4. Verifica output: `src/styles/_tokens-figma.scss`

### Componente Generato non Compila

**Problema:** Errori TypeScript/SCSS dopo generazione

**Soluzione:**
1. Verifica dipendenze Angular: `npm install`
2. Controlla versione Angular CLI: `npx ng version`
3. Richiedi a Claude Code di fixare: "Fix compilation errors in ButtonPrimaryComponent"
4. Review imports mancanti o tipi incorretti

### Design Tokens Duplicati

**Problema:** Conflitto tra `_tokens-figma.scss` e `_tokens.scss`

**Soluzione:**
```scss
// src/styles/styles.scss
// ORDINE IMPORTANTE: custom tokens sovrascrivono Figma
@import 'tokens-figma'; // Auto-generated da Figma
@import 'tokens';       // Custom overrides (priorità maggiore)
```

---

## 📚 Risorse Aggiuntive

### Documentazione Ufficiale

- [Claude Code CLI Docs](https://docs.anthropic.com/claude-code)
- [MCP Server Specification](https://modelcontextprotocol.io/)
- [Figma API Reference](https://www.figma.com/developers/api)
- [Angular Style Guide](https://angular.io/guide/styleguide)

### Template e Schematics

I template Angular per code generation sono in `.claude/templates/`:

- `component.template.ts`
- `component.template.html`
- `component.template.scss`
- `component.spec.template.ts`
- `module.template.ts`

Modifica questi template per personalizzare l'output di Claude Code.

### Script NPM Disponibili

```json
{
  "figma:sync-tokens": "Sincronizza design tokens da Figma",
  "figma:generate": "Genera componente da specifica Figma",
  "figma:diff": "Mostra differenze Figma vs Codebase",
  "component:generate": "Genera componente Angular completo",
  "docs:generate": "Genera documentazione componenti"
}
```

### Community e Supporto

- GitHub Issues: https://github.com/fra-itc/fiutami/issues
- Claude Code Discord: [Link]
- Figma Community: [Link]

---

## 🎓 Getting Started Rapido

### 1. Setup Iniziale (5 min)

```bash
# 1. Installa Claude Code CLI
npm install -g @anthropic/claude-code-cli

# 2. Installa dipendenze progetto
npm install

# 3. Configura Figma token in Claude Desktop
# Segui: ~/.config/claude-desktop/config.json

# 4. Verifica setup
npm run figma:sync-tokens -- --dry-run
```

### 2. Primo Componente (10 min)

```bash
# 1. Crea componente in Figma: "Card/Product"
# 2. Salva modifiche in Figma
# 3. Genera in Angular:
npm run figma:generate -- --component=Card/Product

# 4. Test visuale:
npm start
# Naviga a: http://localhost:4200

# 5. Commit se soddisfatto:
git add src/app/card-product/
git commit -m "feat: add CardProductComponent from Figma"
```

### 3. Iterazione e Miglioramento

```bash
# Modifica design in Figma
# → Auto-sync tokens
npm run figma:sync-tokens

# Chiedi a Claude Code miglioramenti:
# "Aggiungi animazione hover a CardProductComponent"
# → Claude genera modifiche
# → Review diff
# → Approva o richiedi modifiche
```

---

## 🚀 Roadmap Futura

- [ ] **v1.1**: Integrazione Storybook per preview componenti
- [ ] **v1.2**: Visual regression testing automatico
- [ ] **v1.3**: Generazione documentazione MDX da Figma
- [ ] **v1.4**: Support standalone components Angular 18+
- [ ] **v1.5**: Generazione animazioni da Figma prototypes
- [ ] **v2.0**: AI-powered code review con Claude Code

---

## 📝 Changelog

### 2025-11-17 - Initial Release
- ✅ Setup documentazione Claude Code
- ✅ Configurazione MCP server Figma
- ✅ Token mapping Figma → SCSS
- ✅ Component generation pipeline
- ✅ Template Angular 18
- ✅ Test generation automatica

---

**Autore:** Fiutami Team
**Licenza:** TBD (All rights reserved)
**Versione:** 1.0.0
