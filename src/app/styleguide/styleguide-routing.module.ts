import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StyleguideComponent } from './styleguide.component';
import { DemoLayoutComponent } from './demo-layout/demo-layout.component';

const routes: Routes = [
  {
    path: '',
    component: StyleguideComponent
  },
  {
    path: 'demo-layout',
    component: DemoLayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StyleguideRoutingModule {}
