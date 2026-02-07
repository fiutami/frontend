#!/usr/bin/env ts-node
/**
 * Flow Graph Validator - CLI tool for questionnaire validation
 *
 * Validates the questionnaire flow graph for:
 * 1. Orphan nodes (unreachable questions)
 * 2. Missing targets (next points to non-existent ID)
 * 3. Unintended cycles
 * 4. Leaf coverage from entry point
 * 5. showIf expressions validity
 * 6. Missing nextOnSkip when showIf is present
 *
 * Usage:
 *   npx ts-node tools/flow-graph-validator.ts
 *   npm run validate:flow
 *
 * @version 1.1
 */

// Import question data
import { CORE_QUESTIONS_MAP } from '../src/app/onboarding/questionnaire-v2/data/core-questions';
import { COMPANION_QUESTIONS, COMPANION_MODULE } from '../src/app/onboarding/questionnaire-v2/data/companion-module';
import { SPECIES_MODULES_MAP, SPECIES_QUESTIONS_MAP } from '../src/app/onboarding/questionnaire-v2/data/species-modules';
import { LEAVES_MAP } from '../src/app/onboarding/questionnaire-v2/data/leaves';
import { Question, QuestionModule, Leaf, QuestionsMap, ModulesMap, LeavesMap } from '../src/app/onboarding/questionnaire-v2/models/question.models';

// ============================================================================
// Types
// ============================================================================

interface ValidationReport {
  isValid: boolean;
  stats: {
    totalQuestions: number;
    totalModules: number;
    totalLeaves: number;
    totalEdges: number;
    reachableQuestions: number;
    leafCoverage: number;
  };
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  type: 'orphan_node' | 'missing_target' | 'cycle' | 'invalid_showif' | 'missing_nextonskip';
  questionId: string;
  message: string;
  details?: string;
}

interface ValidationWarning {
  type: 'many_options' | 'deep_nesting' | 'long_showif' | 'unused_module';
  questionId?: string;
  message: string;
}

// ============================================================================
// Build Complete Graph
// ============================================================================

function buildCompleteGraph(): {
  questions: QuestionsMap;
  modules: ModulesMap;
  leaves: LeavesMap;
  allQuestionIds: Set<string>;
  allModuleIds: Set<string>;
  allLeafIds: Set<string>;
} {
  // Merge all questions
  const questions: QuestionsMap = {
    ...CORE_QUESTIONS_MAP,
    ...SPECIES_QUESTIONS_MAP,
  };

  // Add companion questions
  for (const q of COMPANION_QUESTIONS) {
    questions[q.id] = q;
  }

  // Build modules map
  const modules: ModulesMap = {
    COMPANION: COMPANION_MODULE,
    ...SPECIES_MODULES_MAP,
  };

  // Build leaves map
  const leaves: LeavesMap = LEAVES_MAP;

  return {
    questions,
    modules,
    leaves,
    allQuestionIds: new Set(Object.keys(questions)),
    allModuleIds: new Set(Object.keys(modules)),
    allLeafIds: new Set(Object.keys(leaves)),
  };
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Parse a next target into its type and ID
 */
function parseNextTarget(next: string): { type: 'question' | 'module' | 'leaf'; id: string } {
  if (next.startsWith('module:')) {
    return { type: 'module', id: next.replace('module:', '') };
  }
  if (next.startsWith('leaf:')) {
    return { type: 'leaf', id: next.replace('leaf:', '') };
  }
  return { type: 'question', id: next };
}

/**
 * Find all orphan nodes (questions not reachable from entry)
 */
function findOrphanNodes(
  questions: QuestionsMap,
  modules: ModulesMap,
  entryPoint: string
): string[] {
  const reachable = new Set<string>();
  const visited = new Set<string>();
  const queue: string[] = [entryPoint];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);

    const question = questions[current];
    if (!question) continue;

    reachable.add(current);

    // Add all next targets
    for (const option of question.options) {
      const { type, id } = parseNextTarget(option.next);

      if (type === 'question' && !visited.has(id)) {
        queue.push(id);
      } else if (type === 'module') {
        // Add module entry question
        const module = modules[id];
        if (module?.entryQuestionId && !visited.has(module.entryQuestionId)) {
          queue.push(module.entryQuestionId);
        }
      }
    }

    // Also check nextOnSkip
    if (question.nextOnSkip) {
      const { type, id } = parseNextTarget(question.nextOnSkip);
      if (type === 'question' && !visited.has(id)) {
        queue.push(id);
      } else if (type === 'module') {
        const module = modules[id];
        if (module?.entryQuestionId && !visited.has(module.entryQuestionId)) {
          queue.push(module.entryQuestionId);
        }
      }
    }
  }

  // Find orphans
  const allIds = Object.keys(questions);
  return allIds.filter(id => !reachable.has(id));
}

/**
 * Find missing next targets
 */
function findMissingTargets(
  questions: QuestionsMap,
  modules: ModulesMap,
  leaves: LeavesMap
): { questionId: string; optionId: string; target: string }[] {
  const missing: { questionId: string; optionId: string; target: string }[] = [];

  for (const question of Object.values(questions)) {
    for (const option of question.options) {
      const { type, id } = parseNextTarget(option.next);

      if (type === 'question' && !questions[id]) {
        missing.push({ questionId: question.id, optionId: option.id, target: option.next });
      } else if (type === 'module' && !modules[id]) {
        missing.push({ questionId: question.id, optionId: option.id, target: option.next });
      } else if (type === 'leaf' && !leaves[id]) {
        missing.push({ questionId: question.id, optionId: option.id, target: option.next });
      }
    }

    // Check nextOnSkip
    if (question.nextOnSkip) {
      const { type, id } = parseNextTarget(question.nextOnSkip);
      if (type === 'question' && !questions[id]) {
        missing.push({ questionId: question.id, optionId: 'nextOnSkip', target: question.nextOnSkip });
      } else if (type === 'module' && !modules[id]) {
        missing.push({ questionId: question.id, optionId: 'nextOnSkip', target: question.nextOnSkip });
      } else if (type === 'leaf' && !leaves[id]) {
        missing.push({ questionId: question.id, optionId: 'nextOnSkip', target: question.nextOnSkip });
      }
    }
  }

  return missing;
}

/**
 * Detect cycles in the graph
 */
function detectCycles(
  questions: QuestionsMap,
  modules: ModulesMap,
  entryPoint: string
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(questionId: string): void {
    if (recursionStack.has(questionId)) {
      // Found a cycle
      const cycleStart = path.indexOf(questionId);
      if (cycleStart !== -1) {
        cycles.push([...path.slice(cycleStart), questionId]);
      }
      return;
    }

    if (visited.has(questionId)) return;

    visited.add(questionId);
    recursionStack.add(questionId);
    path.push(questionId);

    const question = questions[questionId];
    if (question) {
      for (const option of question.options) {
        const { type, id } = parseNextTarget(option.next);
        if (type === 'question') {
          dfs(id);
        } else if (type === 'module') {
          const module = modules[id];
          if (module?.entryQuestionId) {
            dfs(module.entryQuestionId);
          }
        }
      }

      if (question.nextOnSkip) {
        const { type, id } = parseNextTarget(question.nextOnSkip);
        if (type === 'question') {
          dfs(id);
        }
      }
    }

    path.pop();
    recursionStack.delete(questionId);
  }

  dfs(entryPoint);
  return cycles;
}

/**
 * Calculate leaf coverage (percentage of leaves reachable from entry)
 */
function calculateLeafCoverage(
  questions: QuestionsMap,
  modules: ModulesMap,
  leaves: LeavesMap,
  entryPoint: string
): { reachableLeaves: string[]; coverage: number } {
  const reachableLeaves = new Set<string>();
  const visited = new Set<string>();
  const queue: string[] = [entryPoint];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);

    const question = questions[current];
    if (!question) continue;

    for (const option of question.options) {
      const { type, id } = parseNextTarget(option.next);

      if (type === 'leaf') {
        reachableLeaves.add(id);
      } else if (type === 'question' && !visited.has(id)) {
        queue.push(id);
      } else if (type === 'module') {
        const module = modules[id];
        if (module?.entryQuestionId && !visited.has(module.entryQuestionId)) {
          queue.push(module.entryQuestionId);
        }
      }
    }

    if (question.nextOnSkip) {
      const { type, id } = parseNextTarget(question.nextOnSkip);
      if (type === 'leaf') {
        reachableLeaves.add(id);
      } else if (type === 'question' && !visited.has(id)) {
        queue.push(id);
      }
    }
  }

  const totalLeaves = Object.keys(leaves).length;
  const coverage = totalLeaves > 0 ? (reachableLeaves.size / totalLeaves) * 100 : 0;

  return {
    reachableLeaves: Array.from(reachableLeaves),
    coverage,
  };
}

/**
 * Validate showIf expressions syntax
 */
function validateShowIfExpressions(questions: QuestionsMap): {
  questionId: string;
  expression: string;
  error: string;
}[] {
  const errors: { questionId: string; expression: string; error: string }[] = [];

  const ALLOWED_OPERATORS = ['==', '!=', '>', '<', '>=', '<=', 'and', 'or', 'contains'];
  const ALLOWED_PROFILES = [
    'JurisdictionProfile',
    'LifestyleProfile',
    'EnvironmentProfile',
    'FinanceProfile',
    'RelationshipProfile',
    'CareRoutineProfile',
    'HealthProfile',
    'LegalReadinessProfile',
    'EthicsProfile',
    'ContingencyProfile',
    'Route',
    'SpeciesPreferences',
  ];

  for (const question of Object.values(questions)) {
    if (!question.showIf) continue;

    const expr = question.showIf;

    // Check for valid profile references
    const profileRefs = expr.match(/[A-Z][a-zA-Z]+Profile\.[a-zA-Z]+/g) || [];
    for (const ref of profileRefs) {
      const profileName = ref.split('.')[0];
      if (!ALLOWED_PROFILES.includes(profileName) && profileName !== 'Route') {
        errors.push({
          questionId: question.id,
          expression: expr,
          error: `Unknown profile: ${profileName}`,
        });
      }
    }

    // Check for dangerous patterns
    if (expr.includes('eval') || expr.includes('Function') || expr.includes('import')) {
      errors.push({
        questionId: question.id,
        expression: expr,
        error: 'Potentially dangerous expression pattern detected',
      });
    }

    // Check balanced quotes
    const singleQuotes = (expr.match(/'/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      errors.push({
        questionId: question.id,
        expression: expr,
        error: 'Unbalanced single quotes',
      });
    }

    // Check balanced parentheses
    let parenCount = 0;
    for (const char of expr) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (parenCount < 0) break;
    }
    if (parenCount !== 0) {
      errors.push({
        questionId: question.id,
        expression: expr,
        error: 'Unbalanced parentheses',
      });
    }
  }

  return errors;
}

/**
 * Find questions with showIf but missing nextOnSkip
 */
function findMissingNextOnSkip(questions: QuestionsMap): string[] {
  const missing: string[] = [];

  for (const question of Object.values(questions)) {
    if (question.showIf && !question.nextOnSkip) {
      missing.push(question.id);
    }
  }

  return missing;
}

/**
 * Generate warnings for potential issues
 */
function generateWarnings(questions: QuestionsMap, modules: ModulesMap): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (const question of Object.values(questions)) {
    // Too many options
    if (question.options.length > 6) {
      warnings.push({
        type: 'many_options',
        questionId: question.id,
        message: `Question has ${question.options.length} options (recommended max: 6)`,
      });
    }

    // Long showIf expression
    if (question.showIf && question.showIf.length > 150) {
      warnings.push({
        type: 'long_showif',
        questionId: question.id,
        message: `showIf expression is very long (${question.showIf.length} chars)`,
      });
    }
  }

  return warnings;
}

// ============================================================================
// Main Validation
// ============================================================================

function validateFlowGraph(entryPoint: string = 'Q00_ENTRY'): ValidationReport {
  const { questions, modules, leaves, allQuestionIds, allModuleIds, allLeafIds } = buildCompleteGraph();

  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Find orphan nodes
  const orphans = findOrphanNodes(questions, modules, entryPoint);
  for (const orphan of orphans) {
    errors.push({
      type: 'orphan_node',
      questionId: orphan,
      message: `Question "${orphan}" is not reachable from entry point`,
    });
  }

  // 2. Find missing targets
  const missingTargets = findMissingTargets(questions, modules, leaves);
  for (const missing of missingTargets) {
    errors.push({
      type: 'missing_target',
      questionId: missing.questionId,
      message: `Option "${missing.optionId}" points to non-existent target: ${missing.target}`,
    });
  }

  // 3. Detect cycles
  const cycles = detectCycles(questions, modules, entryPoint);
  for (const cycle of cycles) {
    errors.push({
      type: 'cycle',
      questionId: cycle[0],
      message: `Cycle detected: ${cycle.join(' → ')}`,
    });
  }

  // 4. Validate showIf expressions
  const showIfErrors = validateShowIfExpressions(questions);
  for (const err of showIfErrors) {
    errors.push({
      type: 'invalid_showif',
      questionId: err.questionId,
      message: `Invalid showIf expression: ${err.error}`,
      details: err.expression,
    });
  }

  // 5. Find missing nextOnSkip
  const missingNextOnSkip = findMissingNextOnSkip(questions);
  for (const questionId of missingNextOnSkip) {
    errors.push({
      type: 'missing_nextonskip',
      questionId,
      message: `Question has showIf but missing nextOnSkip (will use fallback)`,
    });
  }

  // 6. Calculate leaf coverage
  const { reachableLeaves, coverage } = calculateLeafCoverage(questions, modules, leaves, entryPoint);

  // 7. Generate warnings
  warnings.push(...generateWarnings(questions, modules));

  // Count edges
  let totalEdges = 0;
  for (const question of Object.values(questions)) {
    totalEdges += question.options.length;
    if (question.nextOnSkip) totalEdges++;
  }

  return {
    isValid: errors.length === 0,
    stats: {
      totalQuestions: allQuestionIds.size,
      totalModules: allModuleIds.size,
      totalLeaves: allLeafIds.size,
      totalEdges,
      reachableQuestions: allQuestionIds.size - orphans.length,
      leafCoverage: coverage,
    },
    errors,
    warnings,
  };
}

// ============================================================================
// CLI Output
// ============================================================================

function printReport(report: ValidationReport): void {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           FIUTAMI Questionnaire Flow Graph Validator           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Stats
  console.log('📊 Statistics:');
  console.log(`   Questions:    ${report.stats.totalQuestions}`);
  console.log(`   Modules:      ${report.stats.totalModules}`);
  console.log(`   Leaves:       ${report.stats.totalLeaves}`);
  console.log(`   Edges:        ${report.stats.totalEdges}`);
  console.log(`   Reachable:    ${report.stats.reachableQuestions}/${report.stats.totalQuestions}`);
  console.log(`   Leaf Coverage: ${report.stats.leafCoverage.toFixed(1)}%`);
  console.log('');

  // Errors
  if (report.errors.length > 0) {
    console.log(`❌ Errors (${report.errors.length}):`);
    for (const error of report.errors) {
      console.log(`   [${error.type}] ${error.questionId}: ${error.message}`);
      if (error.details) {
        console.log(`      └─ ${error.details.substring(0, 80)}${error.details.length > 80 ? '...' : ''}`);
      }
    }
    console.log('');
  } else {
    console.log('✅ No errors found!\n');
  }

  // Warnings
  if (report.warnings.length > 0) {
    console.log(`⚠️  Warnings (${report.warnings.length}):`);
    for (const warning of report.warnings) {
      const qId = warning.questionId ? `${warning.questionId}: ` : '';
      console.log(`   [${warning.type}] ${qId}${warning.message}`);
    }
    console.log('');
  }

  // Final verdict
  if (report.isValid) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ VALIDATION PASSED - Flow graph is valid!');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } else {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`❌ VALIDATION FAILED - ${report.errors.length} error(s) found`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

// ============================================================================
// Run
// ============================================================================

const report = validateFlowGraph('Q00_ENTRY');
printReport(report);
