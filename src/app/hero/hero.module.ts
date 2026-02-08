import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroComponent } from './hero.component';
import { HeroRoutingModule } from './hero-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { WelcomeAiComponent } from './welcome-ai/welcome-ai.component';
import { PetRegisterComponent } from './pet-register/pet-register.component';
import { SpecieComponent } from './pet-register/specie/specie.component';
import { PetDetailsComponent } from './pet-register/details/pet-details.component';
import { PetDocsComponent } from './pet-register/docs/pet-docs.component';
import { PetWellnessComponent } from './pet-register/wellness/pet-wellness.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    DashboardComponent,
    WelcomeComponent,
    WelcomeAiComponent,
    PetRegisterComponent,
    SpecieComponent,
    PetDetailsComponent,
    PetDocsComponent,
    PetWellnessComponent,
  ],
  imports: [CommonModule, NgOptimizedImage, FormsModule, HeroRoutingModule, SharedModule, HeroComponent],
  exports: [HeroComponent]
})
export class HeroModule {}
