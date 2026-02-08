/**
 * Styleguide Component Configuration Models
 */

export type PropType = 'select' | 'boolean' | 'text' | 'number';

export interface PropConfig {
  name: string;
  type: PropType;
  defaultValue: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export type ComponentCategory =
  | 'buttons'
  | 'form-controls'
  | 'cards'
  | 'messages'
  | 'indicators'
  | 'navigation'
  | 'branding';

export interface ComponentDemoConfig {
  id: string;
  name: string;
  selector: string;
  category: ComponentCategory;
  description: string;
  props: PropConfig[];
  hasContent?: boolean;
  defaultContent?: string;
  standalone?: boolean;
}

export interface CategoryConfig {
  id: ComponentCategory;
  label: string;
  icon: string;
  order: number;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'buttons', label: 'Buttons', icon: 'touch_app', order: 1 },
  { id: 'form-controls', label: 'Form Controls', icon: 'text_fields', order: 2 },
  { id: 'cards', label: 'Cards & Containers', icon: 'dashboard', order: 3 },
  { id: 'messages', label: 'Speech & Messages', icon: 'chat_bubble', order: 4 },
  { id: 'indicators', label: 'Indicators & Badges', icon: 'insights', order: 5 },
  { id: 'navigation', label: 'Navigation', icon: 'menu', order: 6 },
  { id: 'branding', label: 'Branding', icon: 'palette', order: 7 },
];
