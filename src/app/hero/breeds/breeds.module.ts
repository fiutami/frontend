import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreedsRoutingModule } from './breeds-routing.module';
import { BreedsListComponent } from './breeds-list/breeds-list.component';
import { BreedFinderComponent } from './breed-finder/breed-finder.component';
import { BreedResultComponent } from './breed-result/breed-result.component';
import { BreedDetailComponent } from './breed-detail/breed-detail.component';
import { BreedSectionDetailComponent } from './breed-section-detail/breed-section-detail.component';

@NgModule({
  imports: [
    CommonModule,
    BreedsRoutingModule,
    // Standalone components
    BreedsListComponent,
    BreedFinderComponent,
    BreedResultComponent,
    BreedDetailComponent,
    BreedSectionDetailComponent
  ]
})
export class BreedsModule { }
