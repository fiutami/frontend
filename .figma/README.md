# Figma Integration Setup

> Configurazione per l'integrazione Figma → Claude Code → Angular

---

## 🚀 Quick Start

### 1. Setup Figma Access Token

1. Vai su [Figma Account Settings](https://www.figma.com/settings)
2. Scorri a **Personal Access Tokens**
3. Click **Generate new token**
4. Nome: "Claude Code Integration"
5. Scopes richiesti:
   - ✅ File content - read only
   - ✅ Variables - read only
6. Copia il token (inizia con `figd_`)

### 2. Configura Claude Desktop

**File**: `~/.config/claude-desktop/config.json` (macOS/Linux)
oppure `%APPDATA%/claude-desktop/config.json` (Windows)

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

**Sostituisci** `figd_YOUR_TOKEN_HERE` con il tuo token.

### 3. Restart Claude Desktop

Chiudi completamente e riapri Claude Desktop per caricare la configurazione MCP.

### 4. Configura Figma File ID

1. Apri il tuo file Figma nel browser
2. Copia il File ID dall'URL:
   ```
   https://www.figma.com/file/ABC123DEF456/Your-Design-System
                               ^^^^^^^^^^^^^^^^
                               Questo è il File ID
   ```

3. Aggiorna `.figma/export-config.json`:
   ```json
   {
     "figma": {
       "fileId": "ABC123DEF456",
       "fileUrl": "https://www.figma.com/file/ABC123DEF456/Your-Design-System"
     }
   }
   ```

### 5. Test Setup

```bash
# Test sincronizzazione tokens
npm run figma:sync-tokens

# Output atteso:
# ✅ Tokens synchronized successfully!
# 📄 Output: src/styles/_tokens-figma.scss
```

---

## 📁 Struttura File

```
.figma/
├── README.md                    # Questa guida
├── WORKFLOW.md                  # Workflow completo Figma-to-Code
├── export-config.json           # Configurazione export Figma
├── token-mapping.json           # Mapping tokens Figma ↔ SCSS
├── component-rules.json         # Regole generazione componenti
└── specs/                       # Specifiche esportate da Figma
    ├── tokens.json              # Design tokens JSON
    └── components/              # Specifiche componenti
        ├── ButtonPrimary.json
        ├── CardProduct.json
        └── ...
```

---

## 🎨 Naming Conventions Figma

### Components

**Format**: `Category/Subcategory/Name`

✅ **Corretto**:
- `Button/Primary`
- `Card/Product`
- `Form/Input/Email`
- `Navigation/Header/Mobile`

❌ **Sbagliato**:
- `button-primary` (usa `/` non `-`)
- `Primary Button` (no spazi)
- `btn_primary` (no underscore)

### Variants

**Format**: `property=value`

✅ **Corretto**:
- `size=small`
- `size=medium`
- `size=large`
- `state=disabled`
- `variant=primary`

❌ **Sbagliato**:
- `Size=Small` (no capitalize)
- `sm` (usa nomi completi)
- `is-disabled` (usa `state=disabled`)

### Design Tokens

**Format**: `category/subcategory/property`

✅ **Corretto**:
- `color/primary/500`
- `spacing/md`
- `typography/h1/size`
- `shadow/elevated`

❌ **Sbagliato**:
- `primary-color-500`
- `spacingMd`
- `Heading 1 Size`

---

## 🔄 Workflow

### Scenario 1: Nuovo Componente

1. **Designer**: Crea `Button/Primary` in Figma
2. **Export**: MCP auto-sync oppure manual export
3. **Generate**:
   ```bash
   npm run figma:generate -- --component=ButtonPrimary
   ```
4. **Review**: Verifica codice generato
5. **Test**: `npm start` + visual testing
6. **Commit**: `git add` + `git commit`

### Scenario 2: Modifica Design System

1. **Designer**: Modifica `color/primary/500` in Figma
2. **Sync**:
   ```bash
   npm run figma:sync-tokens
   ```
3. **Check**:
   ```bash
   npm run figma:diff
   ```
4. **Review**: Verifica componenti impattati
5. **Rebuild**: `npm start` → verifica visualmente
6. **Commit**: Se OK, commit `_tokens-figma.scss`

### Scenario 3: Update Componente

1. **Designer**: Aggiunge variant `ghost` a `Button/Primary`
2. **Re-export**: Aggiorna spec JSON
3. **Update**:
   ```bash
   claude "Update ButtonPrimary with new ghost variant from Figma"
   ```
4. **Review**: Verifica diff
5. **Test**: `npm test`
6. **Commit**: Commit modifiche

---

## 📝 Export Componente da Figma

### Metodo 1: Via Figma Plugin (Manuale)

1. In Figma, seleziona Component Set
2. Click destro → Plugins → **Dev Mode**
3. Tab **Inspect** → Click **Code**
4. Click **...** → **Copy as JSON**
5. Crea file `.figma/specs/components/ComponentName.json`
6. Incolla JSON e salva

### Metodo 2: Via Figma API (Programmato)

```bash
# Richiede FIGMA_PERSONAL_ACCESS_TOKEN configurato
curl -H "X-Figma-Token: $FIGMA_PERSONAL_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/YOUR_FILE_ID/components" \
  > .figma/specs/components.json
```

### Metodo 3: Via MCP Server (Automatico)

Se MCP configurato correttamente:

1. Salva modifiche in Figma
2. MCP rileva auto → notifica Claude Desktop
3. Claude Code mostra notifica: "ButtonPrimary modificato in Figma"
4. Chiedi a Claude: "Generate updated ButtonPrimary"

---

## 🛠️ Troubleshooting

### MCP Server Non Si Connette

**Sintomo**: Claude Desktop non mostra server Figma

**Fix**:
1. Verifica `~/.config/claude-desktop/config.json` sintassi corretta
2. Token Figma valido e non scaduto
3. Restart Claude Desktop (completo, non solo finestra)
4. Check logs: `~/.config/claude-desktop/logs/mcp.log`

### Token Sync Fallisce

**Sintomo**: `⚠️ FIGMA_PERSONAL_ACCESS_TOKEN not set`

**Fix**:
1. Token presente in Claude Desktop config
2. Oppure export env variable:
   ```bash
   export FIGMA_PERSONAL_ACCESS_TOKEN="figd_YOUR_TOKEN"
   npm run figma:sync-tokens
   ```

### Component Generation Errori

**Sintomo**: TypeScript compilation errors dopo generazione

**Fix**:
1. Verifica spec JSON valido
2. Chiedi a Claude di fixare:
   ```bash
   claude "Fix compilation errors in ComponentName"
   ```
3. Review imports e tipi manualmente

---

## 📚 Resources

### Documentazione Ufficiale

- [Figma API Reference](https://www.figma.com/developers/api)
- [Figma Plugins API](https://www.figma.com/plugin-docs/)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)
- [Claude Code Docs](https://docs.anthropic.com/claude-code)

### Guide Fiutami

- [CLAUDE.md](../CLAUDE.md) - Guida completa integrazione
- [WORKFLOW.md](./WORKFLOW.md) - Workflow dettagliato
- [README.md](../README.md) - Setup progetto generale

### Example Files

Vedi `.figma/specs/examples/` per esempi di:
- Component spec JSON
- Design tokens JSON
- Export configuration

---

## 🔐 Security

**⚠️ IMPORTANTE**:

- ❌ **NON** committare mai il token Figma in git
- ✅ Token va in Claude Desktop config (fuori repo)
- ✅ Oppure usa env variable `FIGMA_PERSONAL_ACCESS_TOKEN`
- ✅ `.gitignore` include già `.figma/specs/*.secret.json`

**Best Practices**:

1. Token personali per ogni developer
2. Rotate token ogni 3-6 mesi
3. Revoca token se compromesso
4. Usa read-only scopes (no write)

---

**Ultimo aggiornamento**: 2025-11-17
**Versione**: 1.0.0
