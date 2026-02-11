import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdoptionRoutingModule } from './adoption-routing.module';
import { AdoptionListComponent } from './adoption-list/adoption-list.component';
import { AdoptionDetailComponent } from './adoption-detail/adoption-detail.component';
import { AdoptionCreateComponent } from './adoption-create/adoption-create.component';

@NgModule({
  imports: [
    CommonModule,
    AdoptionRoutingModule,
    // Standalone components
    AdoptionListComponent,
    AdoptionDetailComponent,
    AdoptionCreateComponent
  ]
})
export class AdoptionModule {}
