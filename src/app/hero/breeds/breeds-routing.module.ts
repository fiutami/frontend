import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BreedsListComponent } from './breeds-list/breeds-list.component';
import { BreedFinderComponent } from './breed-finder/breed-finder.component';
import { BreedResultComponent } from './breed-result/breed-result.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home/species',
    pathMatch: 'full'
  },
  {
    path: 'list/:speciesId',
    component: BreedsListComponent
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
