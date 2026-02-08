import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BreedsListComponent } from './breeds-list/breeds-list.component';
import { BreedDetailComponent } from './breed-detail/breed-detail.component';

const routes: Routes = [
  {
    path: '',
    component: BreedsListComponent,
  },
  {
    path: ':id',
    component: BreedDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BreedsRoutingModule {}
