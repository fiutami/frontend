import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeroComponent } from './hero.component';

const routes: Routes = [
  {
    path: '',
    component: HeroComponent
  }
];

@NgModule({
  imports: [
    HeroComponent,  // Standalone component - no HeroModule = no conflicting routes
    RouterModule.forChild(routes)
  ]
})
export class HeroTestModule { }
