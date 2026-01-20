# Fiutami Content System

Questa cartella contiene i contenuti strutturati per le specie e razze dell'app Fiutami.

## Struttura

```
content/
├── breeds/
│   ├── TEMPLATE.md           # Template per nuove razze
│   ├── it/                   # Contenuti in italiano
│   │   ├── mammiferi/
│   │   │   ├── cane/
│   │   │   │   ├── golden-retriever.md
│   │   │   │   ├── labrador.md
│   │   │   │   └── _index.json
│   │   │   ├── gatto/
│   │   │   └── coniglio/
│   │   ├── uccelli/
│   │   ├── rettili/
│   │   ├── pesci/
│   │   └── invertebrati/
│   ├── en/                   # English content (future)
│   └── index.json            # Global index
└── README.md
```

## Script Disponibili

### 1. Conversione PDF completa

```bash
npm run content:convert-pdf
# oppure
node scripts/convert-breeds-pdf-to-md.js [source_folder] [output_folder]
```

### 2. Parse testo manuale

```bash
node scripts/parse-breed-text.js <input.txt> <species> <category> [output_dir]
```

## Workflow Consigliato

### Importazione da PDF

1. **Installa dipendenze:**
   
   ```bash
   npm install pdf-parse
   ```

2. **Esegui conversione:**
   
   ```bash
   npm run content:convert-pdf
   ```

3. **Revisiona i file generati** in `content/breeds/it/`

4. **Completa i campi mancanti** (origin, lifespan, size, etc.)

### Importazione manuale da testo

1. **Copia il testo** dal PDF in un file `.txt`

2. **Esegui il parser:**
   
   ```bash
   node scripts/parse-breed-text.js razze-cani.txt cane mammiferi
   ```

3. **Verifica l'output** in `content/breeds/it/mammiferi/cane/`

## Formato Markdown

Ogni file razza usa questo formato:

```markdown
---
id: "golden-retriever"
name: "Golden Retriever"
species: "cane"
category: "mammiferi"
lang: "it"

fci_group: 8
origin: "Regno Unito"
lifespan: "10-12 anni"
size: "grande"
weight_min: 25
weight_max: 34

energy_level: 4
trainability: 5
friendliness: 5
grooming_needs: 3

status: "published"
---

# Golden Retriever

## Descrizione
...

## Comportamento
...
```

## Categorie

| ID           | Nome         | Descrizione                    |
| ------------ | ------------ | ------------------------------ |
| mammiferi    | Mammiferi    | Cani, gatti, conigli, roditori |
| uccelli      | Uccelli      | Pappagalli, canarini, etc.     |
| rettili      | Rettili      | Tartarughe, serpenti, etc.     |
| pesci        | Pesci        | Pesci d'acqua dolce            |
| invertebrati | Invertebrati | Api, ragni, etc.               |

## Specie Principali

### Mammiferi

- `cane` - Cani (razze FCI)
- `gatto` - Gatti (razze WCF/TICA)
- `coniglio` - Conigli
- `criceto` - Criceti
- `cavia` - Cavie
- `furetto` - Furetti
- `cincilla` - Cincilla

### Uccelli

- `canarino` - Canarini
- `pappagallo` - Pappagalli
- `cocorita` - Cocorite

## Traduzione Automatica

Per tradurre i contenuti in altre lingue:

```bash
node scripts/translate-breeds.js it en
```

(Script da implementare - usa Claude/GPT per traduzione)

## Integrazione con Directus

I contenuti possono essere sincronizzati con Directus CMS:

```bash
node scripts/sync-to-directus.js
```

(Script da implementare)
