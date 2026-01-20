#!/usr/bin/env node
/**
 * FIUTAMI - Breed Text Parser
 *
 * Parses breed content from plain text and generates normalized Markdown files.
 * Can be used with copy-pasted content from PDFs.
 *
 * Usage:
 *   node scripts/parse-breed-text.js <input.txt> <species> <category> [output_dir]
 *
 * Example:
 *   node scripts/parse-breed-text.js cani-gruppo1.txt cane mammiferi
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_OUTPUT = path.join(__dirname, '..', 'content', 'breeds', 'it');

// Utility functions
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Parse a single breed entry
 */
function parseBreedEntry(text, index = 1) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  // Extract name from first line
  let name = lines[0];
  let number = index;

  // Handle numbered format: "1. Breed Name" or "1. Breed Name (variants)"
  const nameMatch = name.match(/^(\d+)\.\s*(.+)$/);
  if (nameMatch) {
    number = parseInt(nameMatch[1]);
    name = nameMatch[2].trim();
  }

  // Initialize fields
  const breed = {
    name,
    number,
    description: '',
    behavior: '',
    geneticIssues: '',
    care: '',
    pros: '',
    cons: ''
  };

  // Field mappings (Italian labels)
  const fieldMap = {
    'descrizione': 'description',
    'comportamento': 'behavior',
    'problemi genetici': 'geneticIssues',
    'cure': 'care',
    'pro': 'pros',
    'contro': 'cons'
  };

  // Parse each line for fields
  for (const line of lines.slice(1)) {
    for (const [italian, english] of Object.entries(fieldMap)) {
      const pattern = new RegExp(`^${italian}:\\s*(.*)$`, 'i');
      const match = line.match(pattern);
      if (match) {
        breed[english] = match[1].trim();
        break;
      }
    }
  }

  return breed;
}

/**
 * Parse multiple breeds from text
 */
function parseMultipleBreeds(text) {
  const breeds = [];

  // Split by numbered entries (e.g., "1. ", "2. ", etc.)
  // Look for pattern: newline followed by number and dot
  const entries = text.split(/(?=\n\d+\.\s)/);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i].trim();
    if (!entry) continue;

    const breed = parseBreedEntry(entry, i + 1);
    if (breed && breed.name && breed.name.length > 1) {
      breeds.push(breed);
    }
  }

  return breeds;
}

/**
 * Generate Markdown for a breed
 */
function generateMarkdown(breed, species, category) {
  const slug = slugify(breed.name);
  const now = new Date().toISOString().split('T')[0];

  const md = `---
# Fiutami Breed Content
# Generated: ${now}

id: "${slug}"
name: "${breed.name}"
species: "${species}"
category: "${category}"
lang: "it"

# Metadata
fci_group: ${breed.fciGroup || 'null'}
origin: ""
lifespan: ""
size: ""

# Characteristics (1-5)
energy_level: 3
trainability: 3
friendliness: 3
grooming_needs: 3

# Status
status: "draft"
needs_review: true
last_updated: "${now}"
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
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log(`
FIUTAMI - Breed Text Parser

Usage:
  node scripts/parse-breed-text.js <input.txt> <species> <category> [output_dir]

Arguments:
  input.txt   - Text file with breed content (copy-pasted from PDF)
  species     - Species ID (cane, gatto, coniglio, etc.)
  category    - Category ID (mammiferi, uccelli, rettili, pesci, invertebrati)
  output_dir  - Optional output directory (default: content/breeds/it)

Example:
  node scripts/parse-breed-text.js cani-gruppo1.txt cane mammiferi

The input file should contain breeds in this format:

  1. Breed Name
  Descrizione: Physical description...
  Comportamento: Behavior traits...
  Problemi genetici: Health issues...
  Cure: Care needs...
  Pro: Advantages...
  Contro: Disadvantages...

  2. Another Breed
  ...
`);
    process.exit(1);
  }

  const [inputFile, species, category, outputDir = DEFAULT_OUTPUT] = args;

  // Validate input file
  if (!fs.existsSync(inputFile)) {
    console.error(`ERROR: Input file not found: ${inputFile}`);
    process.exit(1);
  }

  // Read and parse
  console.log(`Reading: ${inputFile}`);
  const text = fs.readFileSync(inputFile, 'utf8');
  const breeds = parseMultipleBreeds(text);

  console.log(`Found ${breeds.length} breeds`);

  if (breeds.length === 0) {
    console.log('No breeds found. Check input format.');
    process.exit(1);
  }

  // Create output directory
  const finalOutputDir = path.join(outputDir, category, species);
  ensureDir(finalOutputDir);

  // Generate files
  const results = [];
  for (const breed of breeds) {
    const { slug, content } = generateMarkdown(breed, species, category);
    const outputPath = path.join(finalOutputDir, `${slug}.md`);

    fs.writeFileSync(outputPath, content, 'utf8');
    results.push({ name: breed.name, slug, path: outputPath });
    console.log(`  Created: ${slug}.md`);
  }

  console.log(`\nGenerated ${results.length} Markdown files in: ${finalOutputDir}`);

  // Generate index
  const indexPath = path.join(finalOutputDir, '_index.json');
  fs.writeFileSync(indexPath, JSON.stringify({
    generated: new Date().toISOString(),
    species,
    category,
    count: results.length,
    breeds: results.map(r => ({ id: r.slug, name: r.name }))
  }, null, 2), 'utf8');

  console.log(`Generated index: ${indexPath}`);
}

// Export for use as module
module.exports = { parseBreedEntry, parseMultipleBreeds, generateMarkdown };

// Run if called directly
if (require.main === module) {
  main();
}
