import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Legacy Components (Non-Standalone)
import { ButtonComponent } from './components/button/button.component';
import { FormInputComponent } from './components/form-input/form-input.component';
import { CardComponent } from './components/card/card.component';
import { IconButtonComponent } from './components/icon-button/icon-button.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { LogoComponent } from './components/logo/logo.component';
import { MenuItemComponent } from './components/menu-item/menu-item.component';

// New Standalone Components
import { SpeechBubbleComponent } from './components/speech-bubble';
import { IconBadgeComponent } from './components/icon-badge';
import { MonthChipComponent } from './components/month-chip';
import { StepIndicatorComponent } from './components/step-indicator';
import { RadioButtonGroupComponent } from './components/radio-button-group';
import { CheckboxGroupComponent } from './components/checkbox-group';
import { QuestionCardComponent } from './components/question-card';
import { AiMessageBubbleComponent } from './components/ai-message-bubble';
import { PetInfoCardComponent } from './components/pet-info-card';
import { BottomTabBarComponent } from './components/bottom-tab-bar';
import { AnswerSquareComponent } from './components/answer-square';
import { DrawerComponent } from './components/drawer';
import { SpeciesCardComponent } from './components/species-card';
import { SpeciesSelectorComponent } from './components/species-selector';

// Legacy components (declared in this module)
const LEGACY_COMPONENTS = [
  ButtonComponent,
  FormInputComponent,
  CardComponent,
  IconButtonComponent,
  BackButtonComponent,
  LogoComponent,
  MenuItemComponent,
];

// Standalone components (imported and re-exported)
const STANDALONE_COMPONENTS = [
  SpeechBubbleComponent,
  IconBadgeComponent,
  MonthChipComponent,
  StepIndicatorComponent,
  RadioButtonGroupComponent,
  CheckboxGroupComponent,
  QuestionCardComponent,
  AiMessageBubbleComponent,
  PetInfoCardComponent,
  BottomTabBarComponent,
  AnswerSquareComponent,
  DrawerComponent,
  SpeciesCardComponent,
  SpeciesSelectorComponent,
];

@NgModule({
  declarations: [...LEGACY_COMPONENTS],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Import standalone components
    ...STANDALONE_COMPONENTS,
  ],
  exports: [
    // Export legacy components
    ...LEGACY_COMPONENTS,
    // Re-export standalone components for convenience
    ...STANDALONE_COMPONENTS,
  ],
})
export class SharedModule {}
