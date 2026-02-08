import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreedsRoutingModule } from './breeds-routing.module';
import { BreedsListComponent } from './breeds-list/breeds-list.component';
import { BreedDetailComponent } from './breed-detail/breed-detail.component';

@NgModule({
  imports: [
    CommonModule,
    BreedsRoutingModule,
    // Standalone components
    BreedsListComponent,
    BreedDetailComponent,
  ],
})
export class BreedsModule {}
