import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LostPetsListComponent } from './lost-pets-list/lost-pets-list.component';
import { LostPetDetailComponent } from './lost-pet-detail/lost-pet-detail.component';
import { ReportLostComponent } from './report-lost/report-lost.component';
import { ReportSightingComponent } from './report-sighting/report-sighting.component';

const routes: Routes = [
  {
    path: '',
    component: LostPetsListComponent
  },
  {
    path: 'report',
    component: ReportLostComponent
  },
  {
    path: ':id',
    component: LostPetDetailComponent
  },
  {
    path: ':id/sighting',
    component: ReportSightingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LostPetsRoutingModule {}
