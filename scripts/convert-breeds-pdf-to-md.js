#!/usr/bin/env node
/**
 * FIUTAMI - PDF to Markdown Converter for Breed Content
 *
 * Converts PDF files with breed information to normalized Markdown files.
 *
 * Usage:
 *   node scripts/convert-breeds-pdf-to-md.js [source_folder] [output_folder]
 *
 * Default:
 *   source: C:\Users\Fra\Nextcloud\Fiutami\2025\_Fondamenta Fiutami\Analinisi Elementi interni App\APP\pagina RAZZE
 *   output: content/breeds/it
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceFolder: process.argv[2] || 'C:\\Users\\Fra\\Nextcloud\\Fiutami\\2025\\_Fondamenta Fiutami\\Analinisi Elementi interni App\\APP\\pagina RAZZE',
  outputFolder: process.argv[3] || path.join(__dirname, '..', 'content', 'breeds', 'it'),

  // Category mapping from folder names
  categoryMap: {
    '01_MAMMIFERI': { id: 'mammiferi', name: 'Mammiferi', icon: 'pets' },
    '02_UCCELLI': { id: 'uccelli', name: 'Uccelli', icon: 'flutter_dash' },
    '03_RETTILI': { id: 'rettili', name: 'Rettili', icon: 'reptile' },
    '04.PESCI D\'ACQUA DOLCE': { id: 'pesci', name: 'Pesci', icon: 'water' },
    '05.INVERTEBRATI': { id: 'invertebrati', name: 'Invertebrati', icon: 'bug_report' }
  },

  // Species mapping from subfolder names
  speciesMap: {
    '01.razze CANINE': { id: 'cane', name: 'Cane', fciGroup: true },
    '02.razze FELINE': { id: 'gatto', name: 'Gatto' },
    '03.razze CONIGLI': { id: 'coniglio', name: 'Coniglio' },
    '04.FURETTO_norazze': { id: 'furetto', name: 'Furetto', noBreeds: true },
    '05.CRICETO_norazze': { id: 'criceto', name: 'Criceto', noBreeds: true },
    '06-07_CAVIA-PORCELLINO D\'INDIA': { id: 'cavia', name: 'Cavia' },
    '08.razze_GERBILLO': { id: 'gerbillo', name: 'Gerbillo' },
    '09.razze_RATTO': { id: 'ratto', name: 'Ratto' },
    '10.TOPO_norazze': { id: 'topo', name: 'Topo', noBreeds: true },
    '11.CINCILLA_norazze': { id: 'cincilla', name: 'Cincilla', noBreeds: true },
    '12.DEGU_norazze': { id: 'degu', name: 'Degu', noBreeds: true },
    '13.SUGAR GLIDEE_norazze': { id: 'sugar-glider', name: 'Sugar Glider', noBreeds: true }
  }
};

// Utility functions
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Parse breed entry from text block
 * Expected format:
 * 1. Breed Name
 * Descrizione: ...
 * Comportamento: ...
 * Problemi genetici: ...
 * Cure: ...
 * Pro: ...
 * Contro: ...
 */
function parseBreedEntry(text, index) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  // Extract breed name (first line, may have number prefix)
  let nameLine = lines[0];
  const nameMatch = nameLine.match(/^(\d+)\.\s*(.+)$/);
  const name = nameMatch ? nameMatch[2].trim() : nameLine;
  const number = nameMatch ? parseInt(nameMatch[1]) : index;

  // Parse fields
  const fields = {
    name,
    number,
    description: '',
    behavior: '',
    geneticIssues: '',
    care: '',
    pros: '',
    cons: ''
  };

  const fieldPatterns = [
    { key: 'description', patterns: ['Descrizione:', 'Descrizione:'] },
    { key: 'behavior', patterns: ['Comportamento:', 'Comportamento:'] },
    { key: 'geneticIssues', patterns: ['Problemi genetici:', 'Problemi genetici:'] },
    { key: 'care', patterns: ['Cure:', 'Cure:'] },
    { key: 'pros', patterns: ['Pro:', 'Pro:'] },
    { key: 'cons', patterns: ['Contro:', 'Contro:'] }
  ];

  for (const line of lines.slice(1)) {
    for (const { key, patterns } of fieldPatterns) {
      for (const pattern of patterns) {
        if (line.startsWith(pattern)) {
          fields[key] = line.substring(pattern.length).trim();
          break;
        }
      }
    }
  }

  return fields;
}

/**
 * Parse PDF text content and extract all breeds
 */
function parsePdfContent(text, sourceFile) {
  const breeds = [];

  // Try to detect document structure
  // Pattern 1: Numbered entries "1. Breed Name"
  const numberedPattern = /(?:^|\n)(\d+)\.\s+([^\n]+(?:\n(?!\d+\.).*)*)/gm;

  let match;
  while ((match = numberedPattern.exec(text)) !== null) {
    const number = parseInt(match[1]);
    const block = match[0];

    const breed = parseBreedEntry(block, number);
    if (breed && breed.name) {
      breed.sourceFile = path.basename(sourceFile);
      breeds.push(breed);
    }
  }

  return breeds;
}

/**
 * Generate Markdown content for a breed
 */
function generateMarkdown(breed, species, category) {
  const slug = slugify(breed.name);
  const now = new Date().toISOString().split('T')[0];

  let md = `---
# Fiutami Breed Content
# Auto-generated from PDF - ${breed.sourceFile || 'manual'}
# Generated: ${now}

id: "${slug}"
name: "${breed.name}"
species: "${species.id}"
category: "${category.id}"
lang: "it"

# Metadata
fci_group: ${breed.fciGroup || 'null'}
origin: ""
lifespan: ""
size: ""
weight: ""
coat: ""

# Status
status: "draft"
needs_review: true
---

# ${breed.name}

## Descrizione
${breed.description || '_Da completare_'}

## Comportamento
${breed.behavior || '_Da completare_'}

## Problemi Genetici
${breed.geneticIssues || '_Da completare_'}

## Cure
${breed.care || '_Da completare_'}

## Pro
${breed.pros || '_Da completare_'}

## Contro
${breed.cons || '_Da completare_'}
`;

  return { slug, content: md };
}

/**
 * Extract text from PDF using PowerShell and .NET
 * Falls back to basic text extraction if pdf-parse not available
 */
async function extractPdfText(pdfPath) {
  try {
    // Try using pdf-parse if installed
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (e) {
    // Fallback: Use PowerShell with iTextSharp or basic extraction
    console.log(`  [INFO] pdf-parse not available, using fallback for ${path.basename(pdfPath)}`);

    // For now, return empty - user needs to install pdf-parse
    // or we can implement a different extraction method
    return '';
  }
}

/**
 * Process a single PDF file
 */
async function processPdfFile(pdfPath, species, category, outputDir) {
  console.log(`  Processing: ${path.basename(pdfPath)}`);

  const text = await extractPdfText(pdfPath);
  if (!text) {
    console.log(`    [SKIP] Could not extract text`);
    return [];
  }

  const breeds = parsePdfContent(text, pdfPath);
  console.log(`    Found ${breeds.length} breeds`);

  const results = [];
  for (const breed of breeds) {
    const { slug, content } = generateMarkdown(breed, species, category);
    const outputPath = path.join(outputDir, `${slug}.md`);

    fs.writeFileSync(outputPath, content, 'utf8');
    results.push({ name: breed.name, slug, path: outputPath });
  }

  return results;
}

/**
 * Process all PDF files in source folder
 */
async function processAllPdfs() {
  console.log('='.repeat(60));
  console.log('FIUTAMI - PDF to Markdown Converter');
  console.log('='.repeat(60));
  console.log(`Source: ${CONFIG.sourceFolder}`);
  console.log(`Output: ${CONFIG.outputFolder}`);
  console.log('');

  if (!fs.existsSync(CONFIG.sourceFolder)) {
    console.error(`ERROR: Source folder not found: ${CONFIG.sourceFolder}`);
    process.exit(1);
  }

  ensureDir(CONFIG.outputFolder);

  const stats = {
    categories: 0,
    species: 0,
    files: 0,
    breeds: 0,
    errors: []
  };

  // Process each category folder
  const categoryFolders = fs.readdirSync(CONFIG.sourceFolder, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const catFolder of categoryFolders) {
    const catConfig = CONFIG.categoryMap[catFolder.name];
    if (!catConfig) {
      console.log(`[SKIP] Unknown category: ${catFolder.name}`);
      continue;
    }

    console.log(`\nCategory: ${catConfig.name}`);
    stats.categories++;

    const catPath = path.join(CONFIG.sourceFolder, catFolder.name);
    const catOutputDir = path.join(CONFIG.outputFolder, catConfig.id);
    ensureDir(catOutputDir);

    // Process species subfolders
    const speciesFolders = fs.readdirSync(catPath, { withFileTypes: true })
      .filter(d => d.isDirectory());

    for (const specFolder of speciesFolders) {
      const specConfig = CONFIG.speciesMap[specFolder.name] || {
        id: slugify(specFolder.name),
        name: specFolder.name
      };

      console.log(`  Species: ${specConfig.name}`);
      stats.species++;

      const specPath = path.join(catPath, specFolder.name);
      const specOutputDir = path.join(catOutputDir, specConfig.id);
      ensureDir(specOutputDir);

      // Process PDF files
      const pdfFiles = fs.readdirSync(specPath)
        .filter(f => f.toLowerCase().endsWith('.pdf'));

      for (const pdfFile of pdfFiles) {
        const pdfPath = path.join(specPath, pdfFile);
        stats.files++;

        try {
          const results = await processPdfFile(pdfPath, specConfig, catConfig, specOutputDir);
          stats.breeds += results.length;
        } catch (err) {
          stats.errors.push({ file: pdfPath, error: err.message });
          console.log(`    [ERROR] ${err.message}`);
        }
      }
    }

    // Also check for PDFs directly in category folder
    const directPdfs = fs.readdirSync(catPath)
      .filter(f => f.toLowerCase().endsWith('.pdf'));

    for (const pdfFile of directPdfs) {
      const pdfPath = path.join(catPath, pdfFile);
      stats.files++;

      // Generic species for direct PDFs
      const genericSpec = { id: 'generale', name: 'Generale' };
      const genericOutputDir = path.join(catOutputDir, 'generale');
      ensureDir(genericOutputDir);

      try {
        const results = await processPdfFile(pdfPath, genericSpec, catConfig, genericOutputDir);
        stats.breeds += results.length;
      } catch (err) {
        stats.errors.push({ file: pdfPath, error: err.message });
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Categories processed: ${stats.categories}`);
  console.log(`Species processed: ${stats.species}`);
  console.log(`PDF files processed: ${stats.files}`);
  console.log(`Breeds extracted: ${stats.breeds}`);
  console.log(`Errors: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  }

  // Generate index file
  generateIndex(CONFIG.outputFolder, stats);

  console.log(`\nOutput saved to: ${CONFIG.outputFolder}`);
}

/**
 * Generate index.json with all breeds
 */
function generateIndex(outputDir, stats) {
  const index = {
    generated: new Date().toISOString(),
    stats,
    categories: {},
    breeds: []
  };

  // Scan output directory
  const scanDir = (dir, categoryId = null, speciesId = null) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        if (!categoryId) {
          // This is a category folder
          index.categories[item.name] = { species: {} };
          scanDir(fullPath, item.name);
        } else if (!speciesId) {
          // This is a species folder
          index.categories[categoryId].species[item.name] = [];
          scanDir(fullPath, categoryId, item.name);
        }
      } else if (item.name.endsWith('.md') && item.name !== 'index.md') {
        // This is a breed file
        const content = fs.readFileSync(fullPath, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (frontmatterMatch) {
          // Parse YAML frontmatter (basic parsing)
          const yaml = frontmatterMatch[1];
          const nameMatch = yaml.match(/name:\s*"([^"]+)"/);
          const idMatch = yaml.match(/id:\s*"([^"]+)"/);

          const breedInfo = {
            id: idMatch ? idMatch[1] : item.name.replace('.md', ''),
            name: nameMatch ? nameMatch[1] : item.name.replace('.md', ''),
            category: categoryId,
            species: speciesId,
            file: path.relative(outputDir, fullPath)
          };

          index.breeds.push(breedInfo);

          if (categoryId && speciesId && index.categories[categoryId]?.species[speciesId]) {
            index.categories[categoryId].species[speciesId].push(breedInfo.id);
          }
        }
      }
    }
  };

  scanDir(outputDir);

  const indexPath = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
  console.log(`\nGenerated index: ${indexPath}`);
}

// Run
processAllPdfs().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
