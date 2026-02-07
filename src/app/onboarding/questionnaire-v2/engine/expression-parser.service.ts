/**
 * Expression Parser Service for Questionnaire v1.1
 *
 * SECURE parser for showIf expressions. NO eval(), NO Function().
 * Uses whitelisted operators and profile paths only.
 *
 * Supported syntax:
 * - Comparisons: ==, !=, >, <, >=, <=, contains
 * - Logical: and, or
 * - Paths: Profile.field.subfield
 * - Values: 'string', number, true, false
 *
 * Example: "LifestyleProfile.dailyTime == 'high' and FinanceProfile.budget >= 50"
 *
 * @version 1.1
 */

import { Injectable } from '@angular/core';
import { UserPreferenceProfile, ALLOWED_PROFILE_ROOTS } from '../models/profile.models';

// ============================================================================
// Types
// ============================================================================

type ComparisonOperator = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
type LogicalOperator = 'and' | 'or';

interface ComparisonNode {
  type: 'comparison';
  left: string;  // Path
  operator: ComparisonOperator;
  right: unknown;  // Value
}

interface LogicalNode {
  type: 'logical';
  operator: LogicalOperator;
  left: ExpressionNode;
  right: ExpressionNode;
}

interface LiteralNode {
  type: 'literal';
  value: boolean;
}

type ExpressionNode = ComparisonNode | LogicalNode | LiteralNode;

// ============================================================================
// Service
// ============================================================================

@Injectable({ providedIn: 'root' })
export class ExpressionParserService {

  private readonly COMPARISON_OPERATORS: ComparisonOperator[] = [
    '==', '!=', '>=', '<=', '>', '<', 'contains'
  ];

  private readonly LOGICAL_OPERATORS: LogicalOperator[] = ['and', 'or'];

  /**
   * Evaluate a showIf expression against a profile.
   * Returns true if expression is empty/undefined.
   */
  evaluate(expression: string | undefined, profile: UserPreferenceProfile): boolean {
    if (!expression || expression.trim() === '') {
      return true;
    }

    try {
      const ast = this.parse(expression);
      return this.evaluateNode(ast, profile);
    } catch (error) {
      console.warn(`[ExpressionParser] Failed to evaluate: "${expression}"`, error);
      return true; // Default to showing on parse error
    }
  }

  /**
   * Parse expression string into AST.
   */
  private parse(expression: string): ExpressionNode {
    const trimmed = expression.trim();

    // Handle literal booleans
    if (trimmed === 'true') return { type: 'literal', value: true };
    if (trimmed === 'false') return { type: 'literal', value: false };

    // Try to split by logical operators (lowest precedence)
    const logicalSplit = this.splitByLogical(trimmed);
    if (logicalSplit) {
      return {
        type: 'logical',
        operator: logicalSplit.operator,
        left: this.parse(logicalSplit.left),
        right: this.parse(logicalSplit.right)
      };
    }

    // Must be a comparison
    return this.parseComparison(trimmed);
  }

  /**
   * Split by logical operator (and, or) - rightmost first for left-associativity.
   */
  private splitByLogical(
    expr: string
  ): { left: string; operator: LogicalOperator; right: string } | null {
    // Split by ' or ' first (lower precedence)
    let idx = expr.lastIndexOf(' or ');
    if (idx > 0) {
      return {
        left: expr.substring(0, idx).trim(),
        operator: 'or',
        right: expr.substring(idx + 4).trim()
      };
    }

    // Then split by ' and '
    idx = expr.lastIndexOf(' and ');
    if (idx > 0) {
      return {
        left: expr.substring(0, idx).trim(),
        operator: 'and',
        right: expr.substring(idx + 5).trim()
      };
    }

    return null;
  }

  /**
   * Parse a single comparison expression.
   */
  private parseComparison(expr: string): ComparisonNode {
    // Try each operator (longest first to avoid partial matches)
    const sortedOps = [...this.COMPARISON_OPERATORS].sort((a, b) => b.length - a.length);

    for (const op of sortedOps) {
      const opWithSpaces = ` ${op} `;
      const idx = expr.indexOf(opWithSpaces);
      if (idx > 0) {
        const left = expr.substring(0, idx).trim();
        const right = expr.substring(idx + opWithSpaces.length).trim();

        return {
          type: 'comparison',
          left: left,
          operator: op,
          right: this.parseValue(right)
        };
      }

      // Also check without spaces for contains
      if (op === 'contains') {
        const containsIdx = expr.indexOf(' contains ');
        if (containsIdx > 0) {
          return {
            type: 'comparison',
            left: expr.substring(0, containsIdx).trim(),
            operator: 'contains',
            right: this.parseValue(expr.substring(containsIdx + 10).trim())
          };
        }
      }
    }

    throw new Error(`Invalid comparison expression: "${expr}"`);
  }

  /**
   * Parse a value literal (string, number, boolean).
   */
  private parseValue(valueStr: string): unknown {
    // String literal (single or double quotes)
    if (
      (valueStr.startsWith("'") && valueStr.endsWith("'")) ||
      (valueStr.startsWith('"') && valueStr.endsWith('"'))
    ) {
      return valueStr.slice(1, -1);
    }

    // Boolean
    if (valueStr === 'true') return true;
    if (valueStr === 'false') return false;

    // Null/undefined
    if (valueStr === 'null' || valueStr === 'undefined') return null;

    // Number
    const num = Number(valueStr);
    if (!isNaN(num)) return num;

    // Assume it's a path reference (for comparing two fields)
    return { __path: valueStr };
  }

  /**
   * Evaluate AST node against profile.
   */
  private evaluateNode(node: ExpressionNode, profile: UserPreferenceProfile): boolean {
    switch (node.type) {
      case 'literal':
        return node.value;

      case 'logical':
        return this.evaluateLogical(node, profile);

      case 'comparison':
        return this.evaluateComparison(node, profile);

      default:
        return true;
    }
  }

  /**
   * Evaluate logical node (and, or).
   */
  private evaluateLogical(node: LogicalNode, profile: UserPreferenceProfile): boolean {
    const leftResult = this.evaluateNode(node.left, profile);

    // Short-circuit evaluation
    if (node.operator === 'and' && !leftResult) return false;
    if (node.operator === 'or' && leftResult) return true;

    const rightResult = this.evaluateNode(node.right, profile);

    return node.operator === 'and'
      ? leftResult && rightResult
      : leftResult || rightResult;
  }

  /**
   * Evaluate comparison node.
   */
  private evaluateComparison(node: ComparisonNode, profile: UserPreferenceProfile): boolean {
    const leftValue = this.getValueFromPath(node.left, profile);

    // Right side might be a path reference or literal
    let rightValue: unknown;
    if (typeof node.right === 'object' && node.right !== null && '__path' in node.right) {
      rightValue = this.getValueFromPath((node.right as { __path: string }).__path, profile);
    } else {
      rightValue = node.right;
    }

    return this.compare(leftValue, node.operator, rightValue);
  }

  /**
   * Get value from profile using dot-notation path.
   * Only allows whitelisted root keys.
   */
  private getValueFromPath(path: string, profile: UserPreferenceProfile): unknown {
    const segments = path.split('.');
    const [rootKey, ...rest] = segments;

    // Whitelist check
    if (!ALLOWED_PROFILE_ROOTS.includes(rootKey as any)) {
      console.warn(`[ExpressionParser] Blocked access to non-whitelisted root: "${rootKey}"`);
      return undefined;
    }

    // Traverse path safely
    let current: unknown = (profile as Record<string, unknown>)[rootKey];
    for (const segment of rest) {
      if (current == null || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[segment];
    }

    return current;
  }

  /**
   * Perform comparison with type coercion.
   */
  private compare(left: unknown, operator: ComparisonOperator, right: unknown): boolean {
    // Handle null/undefined
    if (left == null && right == null) {
      return operator === '==' || operator === '>=';
    }
    if (left == null || right == null) {
      return operator === '!=';
    }

    switch (operator) {
      case '==':
        return left === right;

      case '!=':
        return left !== right;

      case '>':
        return Number(left) > Number(right);

      case '<':
        return Number(left) < Number(right);

      case '>=':
        return Number(left) >= Number(right);

      case '<=':
        return Number(left) <= Number(right);

      case 'contains':
        if (Array.isArray(left)) {
          return left.includes(right);
        }
        if (typeof left === 'string') {
          return left.includes(String(right));
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Validate an expression without evaluating (for editor/tooling).
   */
  validateExpression(expression: string): { valid: boolean; error?: string } {
    try {
      this.parse(expression);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
