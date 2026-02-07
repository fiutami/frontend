import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeAiComponent } from './welcome-ai/welcome-ai.component';
import { RegisterPetComponent } from './register-pet/register-pet.component';
import { QuizComponent } from './quiz/quiz.component';
import { QuizResultComponent } from './quiz-result/quiz-result.component';
import { QuestionnairePageComponent } from './questionnaire-v2/pages/questionnaire-page.component';
import { QuestionnaireResultPageComponent } from './questionnaire-v2/pages/questionnaire-result-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    component: WelcomeAiComponent
  },
  {
    path: 'register-pet',
    component: RegisterPetComponent
  },
  {
    path: 'quiz',
    component: QuizComponent
  },
  {
    path: 'quiz-result',
    component: QuizResultComponent
  },
  // Questionnaire v1.1
  {
    path: 'questionnaire',
    component: QuestionnairePageComponent
  },
  {
    path: 'questionnaire-result',
    component: QuestionnaireResultPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { }
