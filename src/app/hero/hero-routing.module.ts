import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { WelcomeAiComponent } from './welcome-ai/welcome-ai.component';
import { WelcomeAi1Component } from './welcome-ai/welcome-ai-1/welcome-ai-1.component';
import { WelcomeAi2aComponent } from './welcome-ai/welcome-ai-2a/welcome-ai-2a.component';
import { WelcomeAi2bComponent } from './welcome-ai/welcome-ai-2b/welcome-ai-2b.component';
import { PetRegisterComponent } from './pet-register/pet-register.component';
import { SpecieComponent } from './pet-register/specie/specie.component';
import { PetDetailsComponent } from './pet-register/details/pet-details.component';
import { PetDocsComponent } from './pet-register/docs/pet-docs.component';
import { PetWellnessComponent } from './pet-register/wellness/pet-wellness.component';
import { SpeciesQ1Component } from './species-questionnaire/species-q1/species-q1.component';
import { SpeciesQ2Component } from './species-questionnaire/species-q2/species-q2.component';
import { SpeciesQ3Component } from './species-questionnaire/species-q3/species-q3.component';
import { SpeciesQ4Component } from './species-questionnaire/species-q4/species-q4.component';
import { SpeciesQ5Component } from './species-questionnaire/species-q5/species-q5.component';
import { SpeciesQ6Component } from './species-questionnaire/species-q6/species-q6.component';
import { SpeciesResultComponent } from './species-questionnaire/species-result/species-result.component';
import { HomeComponent } from './home/home.component';
import { PetProfileComponent } from './pet-profile/pet-profile.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'main',
    component: HomeComponent  // New main home page
  },
  {
    path: 'pet-profile',
    component: PetProfileComponent  // Pet profile page
  },
  {
    path: 'pet-profile/:id',
    component: PetProfileComponent  // Pet profile with ID
  },
  {
    path: 'welcome',
    component: WelcomeComponent  // Legacy welcome/onboarding
  },
  {
    path: 'welcome-ai',
    component: WelcomeAiComponent  // Legacy route - redirects to welcome-ai/1
  },
  {
    path: 'welcome-ai/1',
    component: WelcomeAi1Component  // AI onboarding - initial question
  },
  {
    path: 'welcome-ai/2a',
    component: WelcomeAi2aComponent  // AI onboarding - has pet flow
  },
  {
    path: 'welcome-ai/2b',
    component: WelcomeAi2bComponent  // AI onboarding - wants pet flow
  },
  {
    path: 'pet-register',
    component: PetRegisterComponent
  },
  {
    path: 'pet-register/specie',
    component: SpecieComponent
  },
  {
    path: 'pet-register/details',
    component: PetDetailsComponent
  },
  {
    path: 'pet-register/docs',
    component: PetDocsComponent
  },
  {
    path: 'pet-register/wellness',
    component: PetWellnessComponent
  },
  {
    path: 'species-questionnaire',
    children: [
      { path: '', redirectTo: 'q1', pathMatch: 'full' },
      { path: 'q1', component: SpeciesQ1Component },
      { path: 'q2', component: SpeciesQ2Component },
      { path: 'q3', component: SpeciesQ3Component },
      { path: 'q4', component: SpeciesQ4Component },
      { path: 'q5', component: SpeciesQ5Component },
      { path: 'q6', component: SpeciesQ6Component },
      { path: 'result', component: SpeciesResultComponent },
    ]
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'breeds',
    loadChildren: () => import('./breeds/breeds.module').then(m => m.BreedsModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HeroRoutingModule { }
