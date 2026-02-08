/**
 * Radio option interface
 */
export interface RadioOption {
  /** Unique value for the option */
  value: string;
  /** Display label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Optional description shown below label */
  description?: string;
  /** Optional icon name */
  icon?: string;
}

/**
 * Radio button size options
 */
export type RadioSize = 'sm' | 'md' | 'lg';

/**
 * Radio button orientation
 */
export type RadioOrientation = 'horizontal' | 'vertical';
