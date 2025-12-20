import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdoptionListComponent } from './adoption-list/adoption-list.component';
import { AdoptionDetailComponent } from './adoption-detail/adoption-detail.component';
import { AdoptionCreateComponent } from './adoption-create/adoption-create.component';

const routes: Routes = [
  {
    path: '',
    component: AdoptionListComponent,
    title: 'Adozioni - FiutaMi'
  },
  {
    path: 'create',
    component: AdoptionCreateComponent,
    title: 'Crea annuncio - FiutaMi'
  },
  {
    path: ':id',
    component: AdoptionDetailComponent,
    title: 'Dettaglio adozione - FiutaMi'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdoptionRoutingModule {}
