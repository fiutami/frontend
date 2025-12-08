import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BreedsHomeComponent } from './breeds-home/breeds-home.component';
import { BreedFinderComponent } from './breed-finder/breed-finder.component';
import { BreedResultComponent } from './breed-result/breed-result.component';

const routes: Routes = [
  {
    path: '',
    component: BreedsHomeComponent
  },
  {
    path: 'finder',
    component: BreedFinderComponent
  },
  {
    path: 'result/:id',
    component: BreedResultComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BreedsRoutingModule { }
