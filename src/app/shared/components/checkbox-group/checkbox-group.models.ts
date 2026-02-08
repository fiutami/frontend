/**
 * Checkbox option interface
 */
export interface CheckboxOption {
  /** Unique value for the option */
  value: string;
  /** Display label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Whether option is pre-checked (for initial state) */
  checked?: boolean;
  /** Optional description shown below label */
  description?: string;
  /** Optional icon name */
  icon?: string;
}

/**
 * Checkbox size options
 */
export type CheckboxSize = 'sm' | 'md' | 'lg';

/**
 * Checkbox orientation
 */
export type CheckboxOrientation = 'horizontal' | 'vertical';
