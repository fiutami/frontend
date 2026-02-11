import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapRoutingModule } from './map-routing.module';
import { MapViewComponent } from './map-view/map-view.component';

@NgModule({
  imports: [
    CommonModule,
    MapRoutingModule,
    // Standalone components
    MapViewComponent
  ]
})
export class MapModule { }
