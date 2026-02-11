import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumRoutingModule } from './premium-routing.module';
import { PremiumPageComponent } from './premium-page/premium-page.component';

@NgModule({
  imports: [
    CommonModule,
    PremiumRoutingModule,
    // Standalone components
    PremiumPageComponent
  ]
})
export class PremiumModule {}
