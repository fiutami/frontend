import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePrototypeComponent } from './prototype/profile-prototype.component';

const routes: Routes = [
  {
    path: 'prototype',
    component: ProfilePrototypeComponent,
    title: 'Profilo Prototipo - FiutaMi',
  },
  {
    path: '',
    redirectTo: 'prototype',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
