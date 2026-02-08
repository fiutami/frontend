import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StyleguideRoutingModule } from './styleguide-routing.module';
import { StyleguideComponent } from './styleguide.component';
import { StyleguideSidebarComponent } from './components/styleguide-sidebar/styleguide-sidebar.component';
import { PropControlsComponent } from './components/prop-controls/prop-controls.component';
import { ComponentDemoComponent } from './components/component-demo/component-demo.component';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    StyleguideComponent,
    StyleguideSidebarComponent,
    PropControlsComponent,
    ComponentDemoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    StyleguideRoutingModule,
    SharedModule
  ]
})
export class StyleguideModule {}
