import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchRoutingModule } from './search-routing.module';
import { SearchPageComponent } from './search-page/search-page.component';

@NgModule({
  imports: [
    CommonModule,
    SearchRoutingModule,
    // Standalone component
    SearchPageComponent,
  ],
})
export class SearchModule {}
