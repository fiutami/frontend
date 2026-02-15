import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroComponent } from './hero.component';
import { HeroRoutingModule } from './hero-routing.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { WelcomeAiComponent } from './welcome-ai/welcome-ai.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    WelcomeComponent,
    WelcomeAiComponent,
  ],
  imports: [CommonModule, NgOptimizedImage, FormsModule, HeroRoutingModule, SharedModule, HeroComponent],
  exports: [HeroComponent]
})
export class HeroModule {}
