# Figma-to-Code Workflow

> Guida pratica al workflow completo per la generazione automatica di codice Angular da Figma designs.

---

## 📊 Panoramica Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW COMPLETO                            │
└─────────────────────────────────────────────────────────────────┘

1. DESIGN IN FIGMA
   ├─ Designer crea/modifica componente
   ├─ Applica design tokens corretti
   ├─ Nomina seguendo convenzioni
   └─ Documenta variants e properties

2. EXPORT DA FIGMA
   ├─ MCP Server auto-sync (se configurato)
   └─ Oppure: Manual export → .figma/specs/

3. GENERAZIONE CODICE
   ├─ npm run figma:generate -- --component=Nome
   ├─ Claude Code genera TypeScript + HTML + SCSS + Tests
   └─ Output → src/app/nome-componente/

4. REVIEW & TEST
   ├─ Developer verifica codice generato
   ├─ npm start → Test visuale
   ├─ npm test → Verifica test automatici
   └─ Richiedi modifiche a Claude se necessario

5. COMMIT & DEPLOY
   ├─ git add src/app/nome-componente/
   ├─ git commit -m "feat: add NomeComponent from Figma"
   └─ git push origin feature/nome-componente

6. CONTINUOUS SYNC
   ├─ Designer modifica design in Figma
   ├─ MCP notifica modifiche
   ├─ Claude Code suggerisce update
   └─ Developer approva e applica
```

---

## 🎨 Fase 1: Design in Figma

### Checklist Pre-Export

Prima di esportare un componente da Figma, assicurati di:

- [ ] **Naming Convention**: Nome componente segue `Category/Subcategory/Name`
- [ ] **Design Tokens**: Usa solo token dal design system (non colori custom)
- [ ] **Variants**: Configurate correttamente (size, state, variant, ecc.)
- [ ] **Auto Layout**: Applicato dove necessario per responsività
- [ ] **Constraints**: Impostate per behavior responsive
- [ ] **Accessibility**: Nomi layer descrittivi per screen reader
- [ ] **Assets**: Tutte le icone/immagini sono components o instances
- [ ] **Documentation**: Descrizione e note sul componente

### Esempio: Struttura Figma

```
🎨 Figma File: "Fiutami Design System"

  📁 Components
    📁 Button
      ✓ Button/Primary        ← Component Set
        ├─ size=small         ← Variant
        ├─ size=medium        ← Variant
        ├─ size=large         ← Variant
        └─ state=disabled     ← Variant

      ✓ Button/Secondary
      ✓ Button/Tertiary

    📁 Card
      ✓ Card/Product
      ✓ Card/Feature

    📁 Form
      📁 Input
        ✓ Input/Text
        ✓ Input/Email
        ✓ Input/Password

  📁 Design Tokens
    📁 Colors
      ├─ color/primary/500   → #F5A623
      ├─ color/accent/500    → #4A90E2
      └─ ...

    📁 Spacing
      ├─ spacing/xs → 8px
      ├─ spacing/sm → 12px
      └─ ...
```

---

## 📤 Fase 2: Export da Figma

### Opzione A: MCP Server Auto-Sync (Raccomandato)

**Setup iniziale (una volta):**

1. Installa MCP Server Figma:
   ```bash
   npm install -g @anthropic-ai/mcp-server-figma
   ```

2. Configura Claude Desktop (`~/.config/claude-desktop/config.json`):
   ```json
   {
     "mcpServers": {
       "figma": {
         "command": "npx",
         "args": ["-y", "@anthropic-ai/mcp-server-figma"],
         "env": {
           "FIGMA_PERSONAL_ACCESS_TOKEN": "figd_YOUR_TOKEN"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop

**Workflow automatico:**
- Salvi modifiche in Figma → MCP rileva → Claude Code notifica → Chiedi a Claude di generare

### Opzione B: Manual Export

**Per design tokens:**

1. In Figma: Plugin → Export Variables/Styles
2. Salva output JSON in `.figma/specs/tokens.json`
3. Run sync:
   ```bash
   npm run figma:sync-tokens
   ```

**Per componenti:**

1. In Figma: Seleziona Component Set
2. Plugin → Dev Mode → Export JSON
3. Salva in `.figma/specs/components/ComponentName.json`
4. Genera codice:
   ```bash
   npm run figma:generate -- --component=ComponentName
   ```

---

## ⚙️ Fase 3: Generazione Codice

### Metodo 1: Via NPM Script

```bash
# Genera componente completo da Figma spec
npm run figma:generate -- --component=ButtonPrimary

# Output:
# ✅ src/app/button-primary/button-primary.component.ts
# ✅ src/app/button-primary/button-primary.component.html
# ✅ src/app/button-primary/button-primary.component.scss
# ✅ src/app/button-primary/button-primary.component.spec.ts
# ✅ src/app/button-primary/button-primary.module.ts
# ✅ src/app/button-primary/index.ts
```

### Metodo 2: Via Claude Code CLI

```bash
# Chiedi direttamente a Claude Code
claude "Generate ButtonPrimary component from Figma spec in .figma/specs/components/ButtonPrimary.json"
```

### Metodo 3: Via VSCode Extension

1. Apri Command Palette (`Cmd+Shift+P`)
2. Cerca: "Claude Code: Generate from Figma"
3. Seleziona componente dalla lista
4. Conferma generazione

### Cosa Viene Generato

**TypeScript Component:**
```typescript
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-button-primary',
  templateUrl: './button-primary.component.html',
  styleUrls: ['./button-primary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonPrimaryComponent {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
```

**HTML Template:**
```html
<button
  [class]="'btn btn-primary btn-' + size"
  [disabled]="disabled"
  (click)="onClick()"
  [attr.aria-label]="label"
  type="button">
  {{ label }}
</button>
```

**SCSS Styles:**
```scss
@import 'src/styles/tokens';
@import 'src/styles/tokens-figma';
@import 'src/styles/mixins';

.btn {
  padding: $spacing-md $spacing-lg;
  border-radius: $border-radius-md;
  font-size: $typography-body-size;
  transition: $transition-base;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

.btn-primary {
  background-color: $color-primary-500;
  color: $color-text-inverse;
}
```

---

## ✅ Fase 4: Review & Test

### Checklist Review

- [ ] **Compilation**: `npm run build` senza errori
- [ ] **Tests**: `npm test` tutti verdi
- [ ] **Visual**: `npm start` → componente appare corretto
- [ ] **Responsive**: Testa mobile + desktop
- [ ] **Accessibility**: Keyboard nav + screen reader
- [ ] **Performance**: Nessun warning di performance
- [ ] **Design Tokens**: Usa solo variabili SCSS, no hardcoded values

### Test Visuale

```bash
# Avvia dev server
npm start

# Naviga a: http://localhost:4200

# Testa interazioni:
# - Hover states
# - Click handlers
# - Disabled states
# - Responsive breakpoints
# - Keyboard navigation (Tab, Enter, Space)
```

### Test Automatici

```bash
# Run unit tests
npm test

# Run con coverage
npm test -- --code-coverage

# Output coverage report:
# coverage/index.html
```

### Richiedi Modifiche a Claude

Se il componente generato ha problemi:

**Via CLI:**
```bash
claude "ButtonPrimaryComponent: aggiungi animazione di loading quando button è in loading state"
```

**Via VSCode:**
- Apri chat Claude Code
- Descrivi la modifica richiesta
- Claude analizza, modifica, mostra diff
- Approvi o richiedi ulteriori modifiche

---

## 💾 Fase 5: Commit & Deploy

### Git Workflow

```bash
# 1. Crea branch feature (se non esiste)
git checkout -b feat/button-primary-component

# 2. Add generated files
git add src/app/button-primary/

# 3. Commit con conventional commits
git commit -m "feat: add ButtonPrimaryComponent from Figma design

- Generated from Figma Component Set: Button/Primary
- Includes variants: size (small, medium, large), state (disabled)
- Full test coverage
- Accessibility compliant (WCAG AA)
"

# 4. Push to remote
git push -u origin feat/button-primary-component

# 5. Crea Pull Request su GitHub/GitLab
# Usa template PR che include:
# - Screenshot/video componente
# - Link al design Figma
# - Checklist testing
```

### Import nel Progetto

**In `app.module.ts`:**
```typescript
import { ButtonPrimaryModule } from './button-primary/button-primary.module';

@NgModule({
  imports: [
    // ...
    ButtonPrimaryModule
  ]
})
export class AppModule { }
```

**Usa nel template:**
```html
<app-button-primary
  label="Click me"
  size="medium"
  (clicked)="handleClick()">
</app-button-primary>
```

---

## 🔄 Fase 6: Continuous Sync

### Workflow Modifiche Design

**Scenario: Designer modifica colore primario in Figma**

1. **Figma**: Designer cambia `color/primary/500: #F5A623 → #FF6B35`
2. **MCP**: Rileva modifica e notifica Claude Desktop
3. **Claude Code**: Suggerisce sync tokens
4. **Developer**: Esegue `npm run figma:sync-tokens`
5. **Auto-update**: `_tokens-figma.scss` aggiornato
6. **Rebuild**: `npm start` → nuovi colori applicati automaticamente
7. **Review**: Developer verifica visualmente
8. **Commit**: Se ok, commit modifiche

### Workflow Aggiornamento Componente

**Scenario: Designer aggiunge nuova variante a Button**

1. **Figma**: Designer aggiunge `variant=ghost` a Button/Primary
2. **Export**: Rigenera spec JSON o MCP auto-sync
3. **Claude Code**:
   ```bash
   claude "Update ButtonPrimaryComponent with new ghost variant from Figma"
   ```
4. **Output**: Claude mostra diff delle modifiche
5. **Developer**: Review → Approva → Applicata
6. **Test**: `npm test` → verifica nuovi test generati
7. **Commit**: Commit update

### Monitoraggio Continuo

```bash
# Verifica differenze Figma vs Codebase
npm run figma:diff

# Output (esempio):
# 🔍 Componenti impattati:
#   - ButtonPrimaryComponent: nuova variant 'ghost' in Figma
#   - CardProductComponent: aggiornato spacing padding
#
# 🎨 Design Tokens modificati:
#   - $color-primary-500: #F5A623 → #FF6B35
#   - $spacing-lg: 24px → 32px
#
# 💡 Azioni suggerite:
#   1. npm run figma:sync-tokens
#   2. Rigenera: ButtonPrimaryComponent, CardProductComponent
```

---

## 🛠️ Tips & Best Practices

### Per Designers

1. **Consistenza Naming**: Sempre `Category/Name`, no spazi extra
2. **Design Tokens First**: Mai colori/spacing custom, solo tokens
3. **Variants Semantiche**: Usa nomi semantici (small/medium/large, non s/m/l)
4. **Component Sets**: Raggruppa variants in Component Sets
5. **Documentation**: Aggiungi descrizioni ai componenti

### Per Developers

1. **Review Prima di Committare**: Verifica sempre codice generato
2. **Test Coverage**: Assicurati test generati coprano logica
3. **Accessibility**: Testa con keyboard e screen reader
4. **Responsive**: Verifica mobile + desktop
5. **Performance**: Monitora bundle size con `npm run build -- --stats-json`

### Per Teams

1. **Sync Regolari**: Daily sync tokens da Figma
2. **Code Reviews**: Almeno 1 review per componenti generati
3. **Design Reviews**: Designer approva implementazione visuale
4. **Documentation**: Mantieni CLAUDE.md e questo WORKFLOW.md aggiornati
5. **Feedback Loop**: Designer ↔ Developer comunicazione costante

---

## 🔧 Troubleshooting

### Problema: Componente Non Genera

**Errore**: `❌ Figma spec not found`

**Soluzione**:
1. Verifica file esiste: `.figma/specs/components/ComponentName.json`
2. Se manca, esporta da Figma o run `npm run figma:sync`
3. Controlla naming: deve matchare esattamente Figma

### Problema: Token Non Sincronizzano

**Errore**: `⚠️ FIGMA_PERSONAL_ACCESS_TOKEN not set`

**Soluzione**:
1. Genera token su Figma: Account Settings → Personal Access Tokens
2. Aggiungi a Claude Desktop config o env variable
3. Restart Claude Desktop
4. Retry: `npm run figma:sync-tokens`

### Problema: Compilation Errors

**Errore**: TypeScript errors dopo generazione

**Soluzione**:
1. Chiedi a Claude Code: "Fix compilation errors in ComponentName"
2. Claude analizza errori e applica fix
3. Oppure: Review manuale e correggi imports/types

---

## 📚 Riferimenti

- [CLAUDE.md](../CLAUDE.md) - Guida completa integrazione Claude Code
- [.figma/export-config.json](./export-config.json) - Configurazione export
- [.figma/token-mapping.json](./token-mapping.json) - Mapping tokens
- [.figma/component-rules.json](./component-rules.json) - Regole generazione
- [Figma API Docs](https://www.figma.com/developers/api)
- [MCP Server Docs](https://modelcontextprotocol.io/)

---

**Ultimo aggiornamento**: 2025-11-17
**Versione**: 1.0.0
