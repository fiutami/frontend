import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PremiumPageComponent } from './premium-page/premium-page.component';

const routes: Routes = [
  {
    path: '',
    component: PremiumPageComponent,
    title: 'Abbonamenti - FiutaMi'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PremiumRoutingModule {}
