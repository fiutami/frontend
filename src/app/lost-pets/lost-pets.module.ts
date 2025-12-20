import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LostPetsRoutingModule } from './lost-pets-routing.module';
import { LostPetsListComponent } from './lost-pets-list/lost-pets-list.component';
import { LostPetDetailComponent } from './lost-pet-detail/lost-pet-detail.component';
import { ReportLostComponent } from './report-lost/report-lost.component';
import { ReportSightingComponent } from './report-sighting/report-sighting.component';

@NgModule({
  imports: [
    CommonModule,
    LostPetsRoutingModule,
    // Standalone components
    LostPetsListComponent,
    LostPetDetailComponent,
    ReportLostComponent,
    ReportSightingComponent
  ]
})
export class LostPetsModule {}
