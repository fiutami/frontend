#!/usr/bin/env node

/**
 * Figma Component Generator
 *
 * Genera componenti Angular da specifiche Figma JSON
 *
 * Usage:
 *   node .claude/scripts/figma-generate.js --component=ButtonPrimary
 *   npm run figma:generate -- --component=ButtonPrimary
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  args.forEach(arg => {
    const [key, value] = arg.replace('--', '').split('=');
    parsed[key] = value || true;
  });

  return parsed;
}

// Convert PascalCase to kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
    .toLowerCase();
}

// Convert kebab-case to PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Load Figma spec for component
function loadFigmaSpec(componentName) {
  const specPath = path.join(
    __dirname,
    '../../.figma/specs/components',
    `${componentName}.json`
  );

  if (!fs.existsSync(specPath)) {
    console.error(`❌ Figma spec not found: ${specPath}`);
    console.log('\n💡 Tip: Export component from Figma first using:');
    console.log('   npm run figma:sync\n');
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(specPath, 'utf8'));
}

// Load template file
function loadTemplate(templateName) {
  const templatePath = path.join(
    __dirname,
    '../templates',
    `${templateName}.template`
  );

  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template not found: ${templatePath}`);
    process.exit(1);
  }

  return fs.readFileSync(templatePath, 'utf8');
}

// Replace template variables
function renderTemplate(template, variables) {
  let result = template;

  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, variables[key]);
  });

  return result;
}

// Generate component files
function generateComponent(spec) {
  const componentName = spec.componentName;
  const kebabName = toKebabCase(componentName);
  const pascalName = toPascalCase(componentName);

  const componentDir = path.join(__dirname, '../../src/app', kebabName);

  // Create component directory
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  console.log(`\n📦 Generating ${pascalName}Component...`);
  console.log(`📁 Directory: ${componentDir}\n`);

  // Template variables
  const variables = {
    componentName: pascalName,
    componentSelector: `app-${kebabName}`,
    componentKebabName: kebabName,
    // Extract from spec
    inputs: generateInputs(spec),
    outputs: generateOutputs(spec),
    properties: generateProperties(spec),
    methods: generateMethods(spec),
    template: generateTemplate(spec),
    styles: generateStyles(spec),
    tests: generateTests(spec),
  };

  // Generate TypeScript component
  const tsTemplate = loadTemplate('component.ts');
  const tsContent = renderTemplate(tsTemplate, variables);
  const tsPath = path.join(componentDir, `${kebabName}.component.ts`);
  fs.writeFileSync(tsPath, tsContent);
  console.log(`✅ Generated: ${kebabName}.component.ts`);

  // Generate HTML template
  const htmlTemplate = loadTemplate('component.html');
  const htmlContent = renderTemplate(htmlTemplate, variables);
  const htmlPath = path.join(componentDir, `${kebabName}.component.html`);
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`✅ Generated: ${kebabName}.component.html`);

  // Generate SCSS styles
  const scssTemplate = loadTemplate('component.scss');
  const scssContent = renderTemplate(scssTemplate, variables);
  const scssPath = path.join(componentDir, `${kebabName}.component.scss`);
  fs.writeFileSync(scssPath, scssContent);
  console.log(`✅ Generated: ${kebabName}.component.scss`);

  // Generate spec tests
  const specTemplate = loadTemplate('component.spec.ts');
  const specContent = renderTemplate(specTemplate, variables);
  const specPath = path.join(componentDir, `${kebabName}.component.spec.ts`);
  fs.writeFileSync(specPath, specContent);
  console.log(`✅ Generated: ${kebabName}.component.spec.ts`);

  // Generate module
  const moduleTemplate = loadTemplate('module.ts');
  const moduleContent = renderTemplate(moduleTemplate, variables);
  const modulePath = path.join(componentDir, `${kebabName}.module.ts`);
  fs.writeFileSync(modulePath, moduleContent);
  console.log(`✅ Generated: ${kebabName}.module.ts`);

  // Generate barrel export
  const indexContent = `export * from './${kebabName}.component';\nexport * from './${kebabName}.module';\n`;
  const indexPath = path.join(componentDir, 'index.ts');
  fs.writeFileSync(indexPath, indexContent);
  console.log(`✅ Generated: index.ts`);

  console.log(`\n🎉 Component generated successfully!\n`);
  console.log(`📝 Next steps:`);
  console.log(`   1. Review generated files in: ${componentDir}`);
  console.log(`   2. Import module in app.module.ts:`);
  console.log(`      import { ${pascalName}Module } from './${kebabName}/${kebabName}.module';`);
  console.log(`   3. Test component: ng serve`);
  console.log(`   4. Run tests: npm test\n`);
}

// Helper functions to generate code sections
function generateInputs(spec) {
  if (!spec.structure?.properties) return '';

  const properties = spec.structure.properties;
  const inputs = [];

  Object.keys(properties).forEach(key => {
    const type = properties[key];
    inputs.push(`  @Input() ${key}: ${type} = ${getDefaultValue(type)};`);
  });

  return inputs.join('\n');
}

function generateOutputs(spec) {
  if (!spec.interactions) return '';

  const outputs = [];

  if (spec.interactions.onClick) {
    outputs.push(`  @Output() clicked = new EventEmitter<void>();`);
  }
  if (spec.interactions.onChange) {
    outputs.push(`  @Output() changed = new EventEmitter<any>();`);
  }

  return outputs.join('\n');
}

function generateProperties(spec) {
  // Additional component properties
  return '';
}

function generateMethods(spec) {
  const methods = [];

  if (spec.interactions?.onClick) {
    methods.push(`
  onClick(): void {
    this.clicked.emit();
  }`);
  }

  if (spec.interactions?.onChange) {
    methods.push(`
  onChange(value: any): void {
    this.changed.emit(value);
  }`);
  }

  return methods.join('\n');
}

function generateTemplate(spec) {
  // For now, return placeholder
  // In full implementation, parse Figma structure
  return `<div class="{{componentKebabName}}">
  <!-- Component template will be generated from Figma structure -->
  <p>{{componentName}} works!</p>
</div>`;
}

function generateStyles(spec) {
  if (!spec.styles) return '';

  const styles = [];

  Object.keys(spec.styles).forEach(key => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    styles.push(`  ${cssKey}: ${spec.styles[key]};`);
  });

  return `.{{componentKebabName}} {\n${styles.join('\n')}\n}`;
}

function generateTests(spec) {
  // Generate test cases based on spec
  return '';
}

function getDefaultValue(type) {
  if (type === 'string') return "''";
  if (type === 'boolean') return 'false';
  if (type === 'number') return '0';
  if (type.includes('|')) return `'${type.split('|')[0].trim().replace(/'/g, '')}'`;
  return 'null';
}

// Main execution
function main() {
  const args = parseArgs();

  if (!args.component) {
    console.error('❌ Missing required argument: --component');
    console.log('\nUsage:');
    console.log('  npm run figma:generate -- --component=ButtonPrimary\n');
    process.exit(1);
  }

  console.log('🎨 Figma Component Generator\n');
  console.log(`Component: ${args.component}\n`);

  // Load Figma spec
  const spec = loadFigmaSpec(args.component);

  // Generate component
  generateComponent(spec);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateComponent, loadFigmaSpec };
