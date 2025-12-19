import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarRoutingModule } from './calendar-routing.module';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';

@NgModule({
  imports: [
    CommonModule,
    CalendarRoutingModule,
    // Standalone component
    CalendarViewComponent,
  ],
})
export class CalendarModule {}
