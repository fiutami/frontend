#!/usr/bin/env node
/**
 * FIUTAMI - PDF to Normalized TXT Converter
 *
 * Estrae testo dai PDF e lo normalizza in file TXT pronti per il parsing.
 * Supporta pdf-parse (npm) o estrazione nativa.
 *
 * Uso:
 *   node scripts/pdf-to-normalized-txt.js [source_folder] [output_folder]
 *
 * Prerequisiti:
 *   npm install pdf-parse
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configurazione
const CONFIG = {
  sourceFolder: process.argv[2] || 'C:\\Users\\Fra\\Nextcloud\\Fiutami\\2025\\_Fondamenta Fiutami\\Analinisi Elementi interni App\\APP\\pagina RAZZE',
  outputFolder: process.argv[3] || path.join(__dirname, '..', 'content', 'breeds', 'raw'),
  verbose: true
};

// Stats
const stats = {
  folders: 0,
  files: 0,
  success: 0,
  errors: []
};

// Utility: crea directory
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Utility: normalizza testo
function normalizeText(text) {
  if (!text) return '';

  return text
    // Rimuovi caratteri nulli
    .replace(/\x00/g, '')
    // Normalizza newline
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Rimuovi spazi multipli (ma non newline)
    .replace(/[ \t]+/g, ' ')
    // Rimuovi newline eccessivi
    .replace(/\n{3,}/g, '\n\n')
    // Trim ogni linea
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Trim finale
    .trim();
}

// Utility: slugify per nomi file
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Estrae testo da PDF usando pdf-parse
 */
async function extractWithPdfParse(pdfPath) {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(pdfPath);
    // pdf-parse v2.x returns the module directly as a function
    const parser = typeof pdfParse === 'function' ? pdfParse : pdfParse.default || pdfParse;
    const data = await parser(dataBuffer);
    return data.text;
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error('pdf-parse non installato. Esegui: npm install pdf-parse');
    }
    throw e;
  }
}

/**
 * Estrae testo da PDF usando pdftotext (poppler)
 */
function extractWithPdftotext(pdfPath) {
  try {
    const result = execSync(`pdftotext -layout -enc UTF-8 "${pdfPath}" -`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });
    return result;
  } catch (e) {
    return null;
  }
}

/**
 * Estrazione base leggendo il file PDF come testo
 * (funziona solo per PDF con testo non compresso)
 */
function extractBasic(pdfPath) {
  try {
    const buffer = fs.readFileSync(pdfPath);
    const content = buffer.toString('latin1');

    // Cerca stringhe tra parentesi (formato PDF base)
    const regex = /\(([^)]{3,})\)/g;
    const matches = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      let text = match[1];
      // Decodifica escape sequences PDF
      text = text
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');

      // Filtra solo testo leggibile
      if (/^[\w\s\.,;:\-'àèéìòùÀÈÉÌÒÙáéíóúÁÉÍÓÚ]+$/.test(text)) {
        matches.push(text);
      }
    }

    return matches.join(' ');
  } catch (e) {
    return null;
  }
}

/**
 * Prova tutti i metodi di estrazione
 */
async function extractPdfText(pdfPath) {
  let text = null;

  // Metodo 1: pdf-parse (migliore)
  try {
    text = await extractWithPdfParse(pdfPath);
    if (text && text.length > 100) {
      return { method: 'pdf-parse', text };
    }
  } catch (e) {
    if (CONFIG.verbose) {
      console.log(`    [INFO] pdf-parse fallito: ${e.message}`);
    }
  }

  // Metodo 2: pdftotext (poppler)
  text = extractWithPdftotext(pdfPath);
  if (text && text.length > 100) {
    return { method: 'pdftotext', text };
  }

  // Metodo 3: estrazione base
  text = extractBasic(pdfPath);
  if (text && text.length > 100) {
    return { method: 'basic', text };
  }

  return { method: 'none', text: null };
}

/**
 * Processa un singolo file PDF
 */
async function processPdf(pdfPath, outputDir) {
  const fileName = path.basename(pdfPath, '.pdf');

  if (CONFIG.verbose) {
    console.log(`  Elaboro: ${path.basename(pdfPath)}`);
  }

  try {
    const { method, text } = await extractPdfText(pdfPath);

    if (!text || text.length < 50) {
      console.log(`    [SKIP] Testo non estraibile`);
      stats.errors.push({ file: pdfPath, error: 'Testo non estraibile' });
      return false;
    }

    // Normalizza
    const normalizedText = normalizeText(text);

    // Header con metadati
    const header = `# Estratto da: ${path.basename(pdfPath)}
# Metodo: ${method}
# Data: ${new Date().toISOString()}
# Caratteri: ${normalizedText.length}
# ---

`;

    // Salva
    ensureDir(outputDir);
    const outputPath = path.join(outputDir, `${slugify(fileName)}.txt`);
    fs.writeFileSync(outputPath, header + normalizedText, 'utf8');

    stats.success++;
    console.log(`    [OK] ${slugify(fileName)}.txt (${normalizedText.length} chars, ${method})`);
    return true;

  } catch (e) {
    stats.errors.push({ file: pdfPath, error: e.message });
    console.log(`    [ERROR] ${e.message}`);
    return false;
  }
}

/**
 * Processa ricorsivamente una cartella
 */
async function processFolder(folderPath, relativePath = '') {
  const items = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(folderPath, item.name);

    if (item.isDirectory()) {
      stats.folders++;
      const newRelative = relativePath ? path.join(relativePath, item.name) : item.name;
      console.log(`\nCartella: ${newRelative}`);
      await processFolder(fullPath, newRelative);
    }
    else if (item.name.toLowerCase().endsWith('.pdf')) {
      stats.files++;
      const outputDir = path.join(CONFIG.outputFolder, relativePath);
      await processPdf(fullPath, outputDir);
    }
  }
}

/**
 * Main
 */
async function main() {
  console.log('='.repeat(60));
  console.log('FIUTAMI - PDF to Normalized TXT Converter');
  console.log('='.repeat(60));
  console.log(`Source: ${CONFIG.sourceFolder}`);
  console.log(`Output: ${CONFIG.outputFolder}`);
  console.log('');

  // Verifica sorgente
  if (!fs.existsSync(CONFIG.sourceFolder)) {
    console.error(`ERRORE: Cartella sorgente non trovata: ${CONFIG.sourceFolder}`);
    process.exit(1);
  }

  // Verifica pdf-parse
  try {
    require.resolve('pdf-parse');
    console.log('[OK] pdf-parse disponibile');
  } catch (e) {
    console.log('[WARN] pdf-parse non installato. Installa con: npm install pdf-parse');
    console.log('       Userò metodi alternativi (meno affidabili)');
  }
  console.log('');

  // Processa
  ensureDir(CONFIG.outputFolder);
  await processFolder(CONFIG.sourceFolder);

  // Riepilogo
  console.log('\n' + '='.repeat(60));
  console.log('RIEPILOGO');
  console.log('='.repeat(60));
  console.log(`Cartelle elaborate: ${stats.folders}`);
  console.log(`File PDF trovati: ${stats.files}`);
  console.log(`Conversioni riuscite: ${stats.success}`);
  console.log(`Errori: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\nFile con errori:');
    stats.errors.forEach(e => console.log(`  - ${path.basename(e.file)}: ${e.error}`));
  }

  console.log(`\nOutput salvato in: ${CONFIG.outputFolder}`);
  console.log('\nProssimo passo: Converti i TXT in MD:');
  console.log('  node scripts/parse-breed-text.js <file.txt> <specie> <categoria>');
}

main().catch(err => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
