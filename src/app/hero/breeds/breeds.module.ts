import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreedsRoutingModule } from './breeds-routing.module';
import { BreedsHomeComponent } from './breeds-home/breeds-home.component';
import { BreedFinderComponent } from './breed-finder/breed-finder.component';
import { BreedResultComponent } from './breed-result/breed-result.component';

@NgModule({
  imports: [
    CommonModule,
    BreedsRoutingModule,
    // Standalone components
    BreedsHomeComponent,
    BreedFinderComponent,
    BreedResultComponent
  ]
})
export class BreedsModule { }
