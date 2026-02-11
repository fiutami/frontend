import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingRoutingModule } from './onboarding-routing.module';
import { WelcomeAiComponent } from './welcome-ai/welcome-ai.component';
import { RegisterPetComponent } from './register-pet/register-pet.component';
import { QuizComponent } from './quiz/quiz.component';
import { QuizResultComponent } from './quiz-result/quiz-result.component';
import { QuestionnairePageComponent } from './questionnaire-v2/pages/questionnaire-page.component';
import { QuestionnaireResultPageComponent } from './questionnaire-v2/pages/questionnaire-result-page.component';

@NgModule({
  imports: [
    CommonModule,
    OnboardingRoutingModule,
    // Standalone components
    WelcomeAiComponent,
    RegisterPetComponent,
    QuizComponent,
    QuizResultComponent,
    QuestionnairePageComponent,
    QuestionnaireResultPageComponent
  ]
})
export class OnboardingModule { }
