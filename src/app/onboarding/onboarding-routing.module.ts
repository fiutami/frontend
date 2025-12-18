import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeAiComponent } from './welcome-ai/welcome-ai.component';
import { RegisterPetComponent } from './register-pet/register-pet.component';
import { QuizComponent } from './quiz/quiz.component';
import { QuizResultComponent } from './quiz-result/quiz-result.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { }
