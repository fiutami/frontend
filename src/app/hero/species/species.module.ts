import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeciesRoutingModule } from './species-routing.module';
import { SpeciesHomeComponent } from './species-home/species-home.component';

@NgModule({
  imports: [
    CommonModule,
    SpeciesRoutingModule,
    // Standalone components
    SpeciesHomeComponent
  ]
})
export class SpeciesModule { }
