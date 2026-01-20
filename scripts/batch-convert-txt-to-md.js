#!/usr/bin/env node
/**
 * FIUTAMI - Batch TXT to MD Converter
 *
 * Converte automaticamente tutti i file TXT estratti in MD normalizzati.
 * Mappa automaticamente le cartelle a specie e categorie.
 *
 * Uso:
 *   node scripts/batch-convert-txt-to-md.js [raw_folder] [output_folder]
 */

const fs = require('fs');
const path = require('path');

// Import parser functions
const { parseMultipleBreeds, generateMarkdown } = require('./parse-breed-text.js');

// Configuration
const CONFIG = {
  rawFolder: process.argv[2] || path.join(__dirname, '..', 'content', 'breeds', 'raw'),
  outputFolder: process.argv[3] || path.join(__dirname, '..', 'content', 'breeds', 'it'),

  // Mapping cartelle → categorie
  categoryMap: {
    '01_MAMMIFERI': 'mammiferi',
    '02_UCCELLI': 'uccelli',
    '03_RETTILI': 'rettili',
    '04.PESCI D\'ACQUA DOLCE': 'pesci',
    '05.INVERTEBRATI': 'invertebrati'
  },

  // Mapping cartelle → specie
  speciesMap: {
    // Mammiferi
    '01.razze CANINE': { species: 'cane', category: 'mammiferi' },
    '02.razze FELINE': { species: 'gatto', category: 'mammiferi' },
    '03.razze CONIGLI': { species: 'coniglio', category: 'mammiferi' },
    '04.FURETTO_norazze': { species: 'furetto', category: 'mammiferi' },
    '05.CRICETO_norazze': { species: 'criceto', category: 'mammiferi' },
    '06.razze_PORCELLINI D\'INDIA-CAVIA': { species: 'cavia', category: 'mammiferi' },
    'razze_CAVIA(nouguali)': { species: 'cavia', category: 'mammiferi' },
    '07.CAVIAPERUVIANA_norazze': { species: 'cavia-peruviana', category: 'mammiferi' },
    '08.razze_GERBILLO': { species: 'gerbillo', category: 'mammiferi' },
    '09.razze_RATTO': { species: 'ratto', category: 'mammiferi' },
    '10.TOPO_norazze': { species: 'topo', category: 'mammiferi' },
    '11.CINCILLA_norazze': { species: 'cincilla', category: 'mammiferi' },
    '12.DEGU_norazze': { species: 'degu', category: 'mammiferi' },
    '13.SUGAR GLIDEE_norazze': { species: 'sugar-glider', category: 'mammiferi' },

    // Uccelli
    '01.CANARINO_norazze': { species: 'canarino', category: 'uccelli' },
    '02.COCORITA_norazze': { species: 'cocorita', category: 'uccelli' },
    '03.CALOPSITTA': { species: 'calopsitta', category: 'uccelli' },
    '04.INSEPARABILE': { species: 'inseparabile', category: 'uccelli' },
    '05.PERRUCHE': { species: 'parrocchetto', category: 'uccelli' },
    '06.DIAMANTINO': { species: 'diamantino', category: 'uccelli' },
    '07.PICCIONE VIAGGIATORE': { species: 'piccione', category: 'uccelli' },

    // Rettili
    '01_TARTARUGA DI terra-acqua': { species: 'tartaruga', category: 'rettili' },
    '02.POGONA': { species: 'pogona', category: 'rettili' },
    '03.GECO LEOPARDINO': { species: 'geco', category: 'rettili' },
    '04.SERPENTI': { species: 'serpente', category: 'rettili' },
    '05.AXOLOTL': { species: 'axolotl', category: 'rettili' },
    '06.RANA PACMAN': { species: 'rana', category: 'rettili' },
    '07.TRITONE-SALAMANDRA': { species: 'anfibio', category: 'rettili' },

    // Pesci
    '01.PESCI ROSSI': { species: 'pesce-rosso', category: 'pesci' },
    '02.BETTA SPLENDER': { species: 'betta', category: 'pesci' },
    '03.GUPPY': { species: 'guppy', category: 'pesci' },
    '04.MOLLY': { species: 'molly', category: 'pesci' },
    '05.PLATY': { species: 'platy', category: 'pesci' },
    '06.DISCUS': { species: 'discus', category: 'pesci' },
    '07.NEON': { species: 'neon', category: 'pesci' },
    '08.CORYDORAS': { species: 'corydoras', category: 'pesci' },
    '09.CICLIDI AFRICANI': { species: 'ciclide', category: 'pesci' },
    '10.PESCI TROPICALI': { species: 'tropicale', category: 'pesci' },

    // Invertebrati
    '01.API': { species: 'ape', category: 'invertebrati' },
    '02.GAMBERETTO (cardina,neocaridina)': { species: 'gamberetto', category: 'invertebrati' },
    '03.GRANCHI ACQUA DOLCE': { species: 'granchio', category: 'invertebrati' },
    '04.INSETTO STECCO': { species: 'insetto-stecco', category: 'invertebrati' },
    '05.INSETTO FOGLIA': { species: 'insetto-foglia', category: 'invertebrati' },
    '06.TARANTOLA': { species: 'tarantola', category: 'invertebrati' }
  },

  // File da ignorare (info generali, non razze)
  ignorePatterns: [
    /^info[-_]/i,
    /^elenco[-_]/i,
    /^lista[-_]/i,
    /prova/i,
    /^00-/
  ]
};

// Stats
const stats = {
  filesProcessed: 0,
  breedsCreated: 0,
  skipped: 0,
  errors: []
};

// Utility
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Determina specie e categoria dalla struttura delle cartelle
 */
function getSpeciesAndCategory(filePath) {
  const relativePath = path.relative(CONFIG.rawFolder, filePath);
  const parts = relativePath.split(path.sep);

  let category = 'altro';
  let species = 'generale';

  // Check category from first folder
  for (const [folderName, catId] of Object.entries(CONFIG.categoryMap)) {
    if (parts[0] && parts[0].includes(folderName.split('_')[0])) {
      category = catId;
      break;
    }
  }

  // Check species from subfolders
  for (const part of parts) {
    for (const [folderName, mapping] of Object.entries(CONFIG.speciesMap)) {
      if (part === folderName || part.includes(folderName)) {
        return mapping;
      }
    }
  }

  // Fallback: use folder name as species
  if (parts.length > 1) {
    species = slugify(parts[parts.length - 2]);
  }

  return { species, category };
}

/**
 * Check if file should be skipped
 */
function shouldSkip(fileName) {
  for (const pattern of CONFIG.ignorePatterns) {
    if (pattern.test(fileName)) {
      return true;
    }
  }
  return false;
}

/**
 * Process a single TXT file
 */
function processTxtFile(txtPath) {
  const fileName = path.basename(txtPath, '.txt');

  // Skip info/list files
  if (shouldSkip(fileName)) {
    console.log(`  [SKIP] ${fileName} (file info/lista)`);
    stats.skipped++;
    return 0;
  }

  try {
    // Read file
    let content = fs.readFileSync(txtPath, 'utf8');

    // Remove header comments
    content = content.replace(/^#[^\n]*\n/gm, '').trim();

    if (content.length < 100) {
      console.log(`  [SKIP] ${fileName} (contenuto troppo breve)`);
      stats.skipped++;
      return 0;
    }

    // Get species and category
    const { species, category } = getSpeciesAndCategory(txtPath);

    // Parse breeds
    const breeds = parseMultipleBreeds(content);

    if (breeds.length === 0) {
      console.log(`  [SKIP] ${fileName} (nessuna razza trovata)`);
      stats.skipped++;
      return 0;
    }

    // Create output directory
    const outputDir = path.join(CONFIG.outputFolder, category, species);
    ensureDir(outputDir);

    // Generate MD files
    let created = 0;
    for (const breed of breeds) {
      const { slug, content: mdContent } = generateMarkdown(breed, species, category);
      const outputPath = path.join(outputDir, `${slug}.md`);

      // Don't overwrite existing files
      if (fs.existsSync(outputPath)) {
        continue;
      }

      fs.writeFileSync(outputPath, mdContent, 'utf8');
      created++;
    }

    if (created > 0) {
      console.log(`  [OK] ${fileName} → ${created} razze → ${category}/${species}/`);
    }

    stats.breedsCreated += created;
    return created;

  } catch (e) {
    stats.errors.push({ file: txtPath, error: e.message });
    console.log(`  [ERROR] ${fileName}: ${e.message}`);
    return 0;
  }
}

/**
 * Process folder recursively
 */
function processFolder(folderPath, depth = 0) {
  const items = fs.readdirSync(folderPath, { withFileTypes: true });
  const indent = '  '.repeat(depth);

  for (const item of items) {
    const fullPath = path.join(folderPath, item.name);

    if (item.isDirectory()) {
      console.log(`${indent}Cartella: ${item.name}`);
      processFolder(fullPath, depth + 1);
    }
    else if (item.name.endsWith('.txt')) {
      stats.filesProcessed++;
      processTxtFile(fullPath);
    }
  }
}

/**
 * Generate global index
 */
function generateGlobalIndex() {
  const index = {
    generated: new Date().toISOString(),
    stats: {
      categories: 0,
      species: 0,
      breeds: 0
    },
    categories: {}
  };

  // Scan output folder
  const categories = fs.readdirSync(CONFIG.outputFolder, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'));

  for (const cat of categories) {
    const catPath = path.join(CONFIG.outputFolder, cat.name);
    index.categories[cat.name] = { species: {} };
    index.stats.categories++;

    const speciesFolders = fs.readdirSync(catPath, { withFileTypes: true })
      .filter(d => d.isDirectory());

    for (const spec of speciesFolders) {
      const specPath = path.join(catPath, spec.name);
      const mdFiles = fs.readdirSync(specPath)
        .filter(f => f.endsWith('.md') && !f.startsWith('_'));

      index.categories[cat.name].species[spec.name] = mdFiles.map(f => f.replace('.md', ''));
      index.stats.species++;
      index.stats.breeds += mdFiles.length;
    }
  }

  const indexPath = path.join(CONFIG.outputFolder, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
  console.log(`\nIndice globale: ${indexPath}`);
  console.log(`  Categorie: ${index.stats.categories}`);
  console.log(`  Specie: ${index.stats.species}`);
  console.log(`  Razze totali: ${index.stats.breeds}`);
}

/**
 * Main
 */
function main() {
  console.log('='.repeat(60));
  console.log('FIUTAMI - Batch TXT to MD Converter');
  console.log('='.repeat(60));
  console.log(`Input:  ${CONFIG.rawFolder}`);
  console.log(`Output: ${CONFIG.outputFolder}`);
  console.log('');

  if (!fs.existsSync(CONFIG.rawFolder)) {
    console.error(`ERRORE: Cartella raw non trovata: ${CONFIG.rawFolder}`);
    console.log('Esegui prima: npm run content:extract-pdf');
    process.exit(1);
  }

  ensureDir(CONFIG.outputFolder);

  // Process all TXT files
  processFolder(CONFIG.rawFolder);

  // Generate index
  generateGlobalIndex();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('RIEPILOGO');
  console.log('='.repeat(60));
  console.log(`File TXT elaborati: ${stats.filesProcessed}`);
  console.log(`Razze MD create: ${stats.breedsCreated}`);
  console.log(`File saltati: ${stats.skipped}`);
  console.log(`Errori: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\nErrori:');
    stats.errors.forEach(e => console.log(`  - ${path.basename(e.file)}: ${e.error}`));
  }

  console.log(`\nOutput in: ${CONFIG.outputFolder}`);
}

main();
