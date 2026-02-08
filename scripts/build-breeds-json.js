#!/usr/bin/env node
/**
 * FIUTAMI - Build Breeds JSON
 *
 * Converts MD breed files to JSON for Angular app consumption.
 * Maps MD structure to BreedDetail interface.
 *
 * Usage:
 *   node scripts/build-breeds-json.js [lang]
 *
 * Output:
 *   src/assets/data/breeds/{lang}/index.json
 *   src/assets/data/breeds/{lang}/{category}/{species}/{breed}.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  lang: process.argv[2] || 'it',
  contentFolder: path.join(__dirname, '..', 'content', 'breeds'),
  outputFolder: path.join(__dirname, '..', 'src', 'assets', 'data', 'breeds'),
  verbose: true
};

// Stats
const stats = {
  processed: 0,
  created: 0,
  errors: []
};

// Utility: ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Utility: parse YAML frontmatter from MD
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) return { frontmatter: {}, body: content };

  const frontmatterText = match[1];
  const body = content.slice(match[0].length).trim();

  // Parse YAML-like frontmatter (simple key: value)
  const frontmatter = {};
  const lines = frontmatterText.split('\n');

  for (const line of lines) {
    // Skip comments
    if (line.trim().startsWith('#')) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse numbers
      if (/^\d+$/.test(value)) {
        value = parseInt(value, 10);
      } else if (value === 'null') {
        value = null;
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }

      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

// Utility: extract sections from MD body
function extractSections(body) {
  const sections = {};
  const sectionRegex = /## ([\w\s]+)\n([\s\S]*?)(?=\n## |$)/g;
  let match;

  while ((match = sectionRegex.exec(body)) !== null) {
    const title = match[1].trim().toLowerCase().replace(/\s+/g, '_');
    const content = match[2].trim();
    sections[title] = content;
  }

  return sections;
}

// Species emoji mapping
const SPECIES_EMOJI = {
  'cane': '🐕',
  'gatto': '🐱',
  'coniglio': '🐰',
  'furetto': '🦡',
  'criceto': '🐹',
  'cavia': '🐹',
  'gerbillo': '🐹',
  'ratto': '🐀',
  'topo': '🐭',
  'cincilla': '🐿️',
  'degu': '🐿️',
  'sugar-glider': '🐿️',
  'canarino': '🐦',
  'cocorita': '🦜',
  'calopsitta': '🦜',
  'inseparabile': '🦜',
  'parrocchetto': '🦜',
  'diamantino': '🐦',
  'piccione': '🕊️',
  'tartaruga': '🐢',
  'pogona': '🦎',
  'geco': '🦎',
  'serpente': '🐍',
  'axolotl': '🦎',
  'rana': '🐸',
  'anfibio': '🦎',
  'pesce-rosso': '🐟',
  'betta': '🐠',
  'guppy': '🐠',
  'molly': '🐠',
  'platy': '🐠',
  'discus': '🐠',
  'neon': '🐠',
  'corydoras': '🐟',
  'ciclide': '🐟',
  'tropicale': '🐠',
  'ape': '🐝',
  'gamberetto': '🦐',
  'granchio': '🦀',
  'insetto-stecco': '🪲',
  'insetto-foglia': '🪲',
  'tarantola': '🕷️'
};

// Map MD content to BreedDetail structure
function mapToBreedDetail(frontmatter, sections, category, species) {
  const id = frontmatter.id || '';
  const name = frontmatter.name || id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Map species to Angular Species type
  const speciesMap = {
    'cane': 'Cane',
    'gatto': 'Gatto',
    'coniglio': 'Coniglio',
    'uccello': 'Uccello',
    'canarino': 'Canarini',
    'tartaruga': 'Tartarughe',
    'pesce-rosso': 'Pesci',
    'serpente': 'Serpenti',
    'rana': 'Rana',
    'ape': 'Api'
  };

  return {
    // Base Breed fields
    id,
    name,
    species: speciesMap[species] || species.charAt(0).toUpperCase() + species.slice(1),
    category,
    image: SPECIES_EMOJI[species] || '🐾',
    popularity: frontmatter.popularity || 50,
    origin: frontmatter.origin || '',
    description: sections.descrizione || '',

    // Characteristics (1-5 scale)
    characteristics: {
      energyLevel: frontmatter.energy_level || 3,
      trainability: frontmatter.trainability || 3,
      friendliness: frontmatter.friendliness || 3,
      groomingNeeds: frontmatter.grooming_needs || 3
    },

    // DNA tab
    dna: {
      origin: frontmatter.origin || 'Da definire',
      history: sections.storia || sections.descrizione || 'Informazioni in arrivo',
      genetics: frontmatter.fci_group ? `Gruppo FCI: ${frontmatter.fci_group}` : 'Da definire'
    },

    // Size tab
    size: {
      weight: frontmatter.weight || 'Da definire',
      height: frontmatter.height || 'Da definire',
      coat: extractCoatFromDescription(sections.descrizione) || 'Da definire',
      lifespan: frontmatter.lifespan || ''
    },

    // Temperament tab
    temperament: {
      character: extractFirstSentence(sections.comportamento) || 'Informazioni in arrivo',
      behavior: sections.comportamento || 'Informazioni in arrivo',
      sociability: extractSociability(sections.comportamento) || 'Da definire'
    },

    // Care tab
    care: {
      feeding: extractFeeding(sections.cure) || 'Dieta bilanciata consigliata',
      exercise: extractExercise(sections.cure) || 'Attività regolare necessaria',
      grooming: sections.cure || 'Cure standard per la specie'
    },

    // Risks tab
    risks: {
      commonDiseases: parseDiseasesArray(sections.problemi_genetici),
      lifeExpectancy: frontmatter.lifespan || 'Da definire',
      notes: sections.contro || ''
    },

    // Pedigree tab
    pedigree: {
      standard: frontmatter.fci_group ? `FCI Gruppo ${frontmatter.fci_group}` : 'Da definire',
      recognitions: frontmatter.registry ? [frontmatter.registry] : ['Da definire']
    },

    // Additional fields from MD
    pro: sections.pro || '',
    contro: sections.contro || '',

    // Metadata
    lang: frontmatter.lang || CONFIG.lang,
    status: frontmatter.status || 'draft',
    lastUpdated: frontmatter.last_updated || new Date().toISOString().split('T')[0]
  };
}

// Helper: extract coat info from description
function extractCoatFromDescription(description) {
  if (!description) return null;
  const peloMatch = description.match(/pelo\s+([^,\.]+)/i);
  return peloMatch ? peloMatch[0] : null;
}

// Helper: extract first sentence
function extractFirstSentence(text) {
  if (!text) return null;
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text;
}

// Helper: extract sociability hints
function extractSociability(behavior) {
  if (!behavior) return null;
  if (/socievole|affettuoso|amichevole|familiare/i.test(behavior)) {
    return 'Ottimo con famiglie e altri animali';
  }
  if (/protettivo|territoriale|indipendente/i.test(behavior)) {
    return 'Richiede socializzazione precoce';
  }
  return null;
}

// Helper: extract feeding info
function extractFeeding(care) {
  if (!care) return null;
  if (/dieta|alimentazione|cibo/i.test(care)) {
    return care;
  }
  return null;
}

// Helper: extract exercise info
function extractExercise(care) {
  if (!care) return null;
  const match = care.match(/([^,\.]*(?:esercizio|attività|movimento)[^,\.]*)/i);
  return match ? match[1].trim() : null;
}

// Helper: parse diseases to array
function parseDiseasesArray(problemsText) {
  if (!problemsText) return ['Informazioni in arrivo'];

  // Split by comma or period
  const diseases = problemsText
    .split(/[,.]/)
    .map(d => d.trim())
    .filter(d => d.length > 3);

  return diseases.length > 0 ? diseases : ['Consultare veterinario'];
}

// Process a single MD file
function processBreedFile(mdPath, category, species) {
  const fileName = path.basename(mdPath, '.md');

  try {
    const content = fs.readFileSync(mdPath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    const sections = extractSections(body);

    // Skip if no meaningful content
    if (!frontmatter.id && !frontmatter.name && !sections.descrizione) {
      return null;
    }

    // Ensure ID exists
    if (!frontmatter.id) {
      frontmatter.id = fileName;
    }

    const breedDetail = mapToBreedDetail(frontmatter, sections, category, species);
    return breedDetail;

  } catch (e) {
    stats.errors.push({ file: mdPath, error: e.message });
    return null;
  }
}

// Process all breeds for a language
function processLanguage(lang) {
  const langFolder = path.join(CONFIG.contentFolder, lang);

  if (!fs.existsSync(langFolder)) {
    console.error(`Language folder not found: ${langFolder}`);
    return;
  }

  const outputLangFolder = path.join(CONFIG.outputFolder, lang);
  ensureDir(outputLangFolder);

  // Index structure
  const index = {
    generated: new Date().toISOString(),
    lang,
    stats: { categories: 0, species: 0, breeds: 0 },
    categories: {}
  };

  // Get categories (folders)
  const categories = fs.readdirSync(langFolder, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'));

  for (const cat of categories) {
    const catPath = path.join(langFolder, cat.name);
    const catOutputPath = path.join(outputLangFolder, cat.name);
    ensureDir(catOutputPath);

    index.categories[cat.name] = { species: {} };
    index.stats.categories++;

    // Get species (subfolders)
    const speciesFolders = fs.readdirSync(catPath, { withFileTypes: true })
      .filter(d => d.isDirectory());

    for (const spec of speciesFolders) {
      const specPath = path.join(catPath, spec.name);
      const specOutputPath = path.join(catOutputPath, spec.name);
      ensureDir(specOutputPath);

      index.categories[cat.name].species[spec.name] = [];
      index.stats.species++;

      // Get breed files
      const mdFiles = fs.readdirSync(specPath)
        .filter(f => f.endsWith('.md') && !f.startsWith('_'));

      for (const mdFile of mdFiles) {
        const mdPath = path.join(specPath, mdFile);
        stats.processed++;

        const breed = processBreedFile(mdPath, cat.name, spec.name);

        if (breed) {
          // Save individual breed JSON
          const breedJsonPath = path.join(specOutputPath, `${breed.id}.json`);
          fs.writeFileSync(breedJsonPath, JSON.stringify(breed, null, 2), 'utf8');
          stats.created++;

          // Add to index (lightweight reference)
          index.categories[cat.name].species[spec.name].push({
            id: breed.id,
            name: breed.name,
            image: breed.image
          });

          index.stats.breeds++;

          if (CONFIG.verbose) {
            console.log(`  [OK] ${cat.name}/${spec.name}/${breed.id}`);
          }
        }
      }
    }
  }

  // Save index
  const indexPath = path.join(outputLangFolder, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
  console.log(`\nIndex saved: ${indexPath}`);

  // Also create a flat breeds list for search
  const flatList = [];
  for (const [catName, catData] of Object.entries(index.categories)) {
    for (const [specName, breeds] of Object.entries(catData.species)) {
      for (const breed of breeds) {
        flatList.push({
          ...breed,
          category: catName,
          species: specName,
          path: `${catName}/${specName}/${breed.id}`
        });
      }
    }
  }

  const listPath = path.join(outputLangFolder, 'breeds-list.json');
  fs.writeFileSync(listPath, JSON.stringify(flatList, null, 2), 'utf8');
  console.log(`Breeds list saved: ${listPath}`);
}

// Main
function main() {
  console.log('='.repeat(60));
  console.log('FIUTAMI - Build Breeds JSON');
  console.log('='.repeat(60));
  console.log(`Language: ${CONFIG.lang}`);
  console.log(`Content:  ${CONFIG.contentFolder}`);
  console.log(`Output:   ${CONFIG.outputFolder}`);
  console.log('');

  ensureDir(CONFIG.outputFolder);
  processLanguage(CONFIG.lang);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${stats.processed}`);
  console.log(`JSON created: ${stats.created}`);
  console.log(`Errors: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.slice(0, 10).forEach(e => console.log(`  - ${path.basename(e.file)}: ${e.error}`));
  }
}

main();
