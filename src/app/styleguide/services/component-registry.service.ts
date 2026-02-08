import { Injectable } from '@angular/core';
import { ComponentDemoConfig, CATEGORIES, CategoryConfig } from '../models/component-config.models';

@Injectable({
  providedIn: 'root'
})
export class ComponentRegistryService {

  readonly categories: CategoryConfig[] = CATEGORIES;

  readonly components: ComponentDemoConfig[] = [
    // ========== BUTTONS ==========
    {
      id: 'button',
      name: 'Button',
      selector: 'app-button',
      category: 'buttons',
      description: 'Bottone primario con varianti e stati',
      hasContent: true,
      defaultContent: 'Click me',
      props: [
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Outline', value: 'outline' },
            { label: 'Ghost', value: 'ghost' }
          ]
        },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' }
          ]
        },
        { name: 'disabled', type: 'boolean', defaultValue: false },
        { name: 'loading', type: 'boolean', defaultValue: false },
        { name: 'fullWidth', type: 'boolean', defaultValue: false }
      ]
    },
    {
      id: 'icon-button',
      name: 'Icon Button',
      selector: 'app-icon-button',
      category: 'buttons',
      description: 'Bottone icona per azioni secondarie',
      hasContent: true,
      defaultContent: '❤️',
      props: [
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Ghost', value: 'ghost' },
            { label: 'Glass', value: 'glass' }
          ]
        },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' }
          ]
        },
        { name: 'disabled', type: 'boolean', defaultValue: false },
        { name: 'ariaLabel', type: 'text', defaultValue: 'Icon button' }
      ]
    },
    {
      id: 'back-button',
      name: 'Back Button',
      selector: 'app-back-button',
      category: 'buttons',
      description: 'Bottone per tornare indietro',
      props: [
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'glass',
          options: [
            { label: 'Glass', value: 'glass' },
            { label: 'Solid', value: 'solid' },
            { label: 'Outline', value: 'outline' }
          ]
        },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' }
          ]
        },
        { name: 'disabled', type: 'boolean', defaultValue: false }
      ]
    },

    // ========== FORM CONTROLS ==========
    {
      id: 'form-input',
      name: 'Form Input',
      selector: 'app-form-input',
      category: 'form-controls',
      description: 'Campo input con label e validazione',
      props: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'text',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Email', value: 'email' },
            { label: 'Password', value: 'password' },
            { label: 'Tel', value: 'tel' },
            { label: 'Number', value: 'number' }
          ]
        },
        { name: 'label', type: 'text', defaultValue: 'Label' },
        { name: 'placeholder', type: 'text', defaultValue: 'Placeholder...' },
        { name: 'hasError', type: 'boolean', defaultValue: false },
        { name: 'errorMessage', type: 'text', defaultValue: 'Campo obbligatorio' }
      ]
    },
    {
      id: 'radio-button-group',
      name: 'Radio Button Group',
      selector: 'app-radio-button-group',
      category: 'form-controls',
      description: 'Gruppo di radio button per selezione singola',
      standalone: true,
      props: [
        {
          name: 'orientation',
          type: 'select',
          defaultValue: 'vertical',
          options: [
            { label: 'Vertical', value: 'vertical' },
            { label: 'Horizontal', value: 'horizontal' }
          ]
        },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' }
          ]
        },
        { name: 'disabled', type: 'boolean', defaultValue: false },
        { name: 'showDescriptions', type: 'boolean', defaultValue: true }
      ]
    },
    {
      id: 'checkbox-group',
      name: 'Checkbox Group',
      selector: 'app-checkbox-group',
      category: 'form-controls',
      description: 'Gruppo di checkbox per selezione multipla',
      standalone: true,
      props: [
        {
          name: 'orientation',
          type: 'select',
          defaultValue: 'vertical',
          options: [
            { label: 'Vertical', value: 'vertical' },
            { label: 'Horizontal', value: 'horizontal' }
          ]
        },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' }
          ]
        },
        { name: 'disabled', type: 'boolean', defaultValue: false },
        { name: 'min', type: 'number', defaultValue: 0, min: 0, max: 10 },
        { name: 'max', type: 'number', defaultValue: 10, min: 1, max: 10 }
      ]
    },
    {
      id: 'month-chip',
      name: 'Month Chip',
      selector: 'app-month-chip',
      category: 'form-controls',
      description: 'Selettore mesi con chip',
      standalone: true,
      props: [
        {
          name: 'locale',
          type: 'select',
          defaultValue: 'it',
          options: [
            { label: 'Italiano', value: 'it' },
            { label: 'English', value: 'en' }
          ]
        },
        { name: 'multiSelect', type: 'boolean', defaultValue: false },
        { name: 'disabled', type: 'boolean', defaultValue: false },
        { name: 'shortNames', type: 'boolean', defaultValue: false },
        { name: 'columns', type: 'number', defaultValue: 4, min: 2, max: 6 }
      ]
    },

    // ========== CARDS ==========
    {
      id: 'card',
      name: 'Card',
      selector: 'app-card',
      category: 'cards',
      description: 'Container card con varianti',
      hasContent: true,
      defaultContent: 'Card content here',
      props: [
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'solid',
          options: [
            { label: 'Solid', value: 'solid' },
            { label: 'Overlay', value: 'overlay' },
            { label: 'Transparent', value: 'transparent' }
          ]
        },
        {
          name: 'padding',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' }
          ]
        },
        { name: 'rounded', type: 'boolean', defaultValue: true }
      ]
    },
    {
      id: 'question-card',
      name: 'Question Card',
      selector: 'app-question-card',
      category: 'cards',
      description: 'Card per domande con opzioni',
      standalone: true,
      props: [
        { name: 'question', type: 'text', defaultValue: 'Qual è la tua risposta?' },
        {
          name: 'questionType',
          type: 'select',
          defaultValue: 'radio',
          options: [
            { label: 'Radio', value: 'radio' },
            { label: 'Checkbox', value: 'checkbox' },
            { label: 'Text', value: 'text' }
          ]
        },
        { name: 'required', type: 'boolean', defaultValue: false },
        { name: 'hint', type: 'text', defaultValue: '' }
      ]
    },
    {
      id: 'pet-info-card',
      name: 'Pet Info Card',
      selector: 'app-pet-info-card',
      category: 'cards',
      description: 'Card per informazioni pet',
      standalone: true,
      props: [
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'horizontal',
          options: [
            { label: 'Horizontal', value: 'horizontal' },
            { label: 'Vertical', value: 'vertical' }
          ]
        },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'solid',
          options: [
            { label: 'Solid', value: 'solid' }
          ]
        },
        { name: 'compact', type: 'boolean', defaultValue: false }
      ]
    },

    // ========== MESSAGES ==========
    {
      id: 'speech-bubble',
      name: 'Speech Bubble',
      selector: 'app-speech-bubble',
      category: 'messages',
      description: 'Bolla di dialogo con coda',
      standalone: true,
      hasContent: true,
      defaultContent: 'Ciao! Come posso aiutarti?',
      props: [
        {
          name: 'tailPosition',
          type: 'select',
          defaultValue: 'bottom-left',
          options: [
            { label: 'Top Left', value: 'top-left' },
            { label: 'Top Right', value: 'top-right' },
            { label: 'Bottom Left', value: 'bottom-left' },
            { label: 'Bottom Right', value: 'bottom-right' },
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
            { label: 'None', value: 'none' }
          ]
        },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'AI', value: 'ai' },
            { label: 'User', value: 'user' },
            { label: 'AI Info', value: 'ai-info' }
          ]
        },
        { name: 'animated', type: 'boolean', defaultValue: false },
        { name: 'maxWidth', type: 'text', defaultValue: '300px' }
      ]
    },
    {
      id: 'ai-message-bubble',
      name: 'AI Message Bubble',
      selector: 'app-ai-message-bubble',
      category: 'messages',
      description: 'Messaggio AI con mascotte',
      standalone: true,
      props: [
        { name: 'message', type: 'text', defaultValue: 'Ciao! Sono Fiutami, il tuo assistente.' },
        { name: 'showMascot', type: 'boolean', defaultValue: true },
        {
          name: 'mascotPosition',
          type: 'select',
          defaultValue: 'left',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' }
          ]
        },
        { name: 'animated', type: 'boolean', defaultValue: false },
        { name: 'typing', type: 'boolean', defaultValue: false }
      ]
    },

    // ========== INDICATORS ==========
    {
      id: 'step-indicator',
      name: 'Step Indicator',
      selector: 'app-step-indicator',
      category: 'indicators',
      description: 'Indicatore di progressione steps',
      standalone: true,
      props: [
        { name: 'totalSteps', type: 'number', defaultValue: 5, min: 2, max: 10 },
        { name: 'currentStep', type: 'number', defaultValue: 2, min: 1, max: 10 },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'dots',
          options: [
            { label: 'Dots', value: 'dots' },
            { label: 'Numbers', value: 'numbers' },
            { label: 'Progress', value: 'progress' }
          ]
        },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' }
          ]
        },
        { name: 'showLabels', type: 'boolean', defaultValue: false },
        { name: 'clickable', type: 'boolean', defaultValue: false }
      ]
    },
    {
      id: 'icon-badge',
      name: 'Icon Badge',
      selector: 'app-icon-badge',
      category: 'indicators',
      description: 'Badge con icona',
      standalone: true,
      props: [
        { name: 'label', type: 'text', defaultValue: 'Badge' },
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'paw',
          options: [
            { label: 'Paw', value: 'paw' },
            { label: 'Document', value: 'document' },
            { label: 'Camera', value: 'camera' },
            { label: 'Heart', value: 'heart' },
            { label: 'Star', value: 'star' }
          ]
        },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Accent', value: 'accent' },
            { label: 'Neutral', value: 'neutral' }
          ]
        },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' }
          ]
        },
        { name: 'circular', type: 'boolean', defaultValue: false },
        { name: 'outlined', type: 'boolean', defaultValue: false }
      ]
    },
    {
      id: 'answer-square',
      name: 'Answer Square',
      selector: 'app-answer-square',
      category: 'indicators',
      description: 'Quadrati per risposte rapide',
      standalone: true,
      props: []
    },

    // ========== NAVIGATION ==========
    {
      id: 'menu-item',
      name: 'Menu Item',
      selector: 'app-menu-item',
      category: 'navigation',
      description: 'Elemento menu con icona',
      props: [
        { name: 'label', type: 'text', defaultValue: 'Menu Item' },
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'paw',
          options: [
            { label: 'Paw', value: 'paw' },
            { label: 'Document', value: 'document' },
            { label: 'Heart', value: 'heart' },
            { label: 'Info', value: 'info' }
          ]
        },
        { name: 'disabled', type: 'boolean', defaultValue: false },
        { name: 'showChevron', type: 'boolean', defaultValue: true }
      ]
    },
    {
      id: 'bottom-tab-bar',
      name: 'Bottom Tab Bar',
      selector: 'app-bottom-tab-bar',
      category: 'navigation',
      description: 'Barra di navigazione inferiore',
      standalone: true,
      props: [
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'solid',
          options: [
            { label: 'Solid', value: 'solid' },
            { label: 'Floating', value: 'floating' },
            { label: 'Transparent', value: 'transparent' }
          ]
        },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' }
          ]
        },
        { name: 'showLabels', type: 'boolean', defaultValue: true },
        { name: 'safeArea', type: 'boolean', defaultValue: false }
      ]
    },

    // ========== BRANDING ==========
    {
      id: 'logo',
      name: 'Logo',
      selector: 'app-logo',
      category: 'branding',
      description: 'Logo Fiutami con varianti',
      props: [
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'color',
          options: [
            { label: 'Color', value: 'color' },
            { label: 'White', value: 'white' },
            { label: 'Dark', value: 'dark' }
          ]
        },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
            { label: 'Extra Large', value: 'xl' }
          ]
        }
      ]
    }
  ];

  getComponentsByCategory(category: string): ComponentDemoConfig[] {
    return this.components.filter(c => c.category === category);
  }

  getComponentById(id: string): ComponentDemoConfig | undefined {
    return this.components.find(c => c.id === id);
  }
}
