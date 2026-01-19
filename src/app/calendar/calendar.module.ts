import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarRoutingModule } from './calendar-routing.module';
import { CalendarMonthSelectorComponent } from './calendar-month-selector/calendar-month-selector.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';

@NgModule({
  imports: [
    CommonModule,
    CalendarRoutingModule,
    // Standalone components
    CalendarMonthSelectorComponent,
    CalendarViewComponent,
  ],
})
export class CalendarModule {}
