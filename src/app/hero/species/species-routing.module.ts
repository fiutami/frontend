import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpeciesHomeComponent } from './species-home/species-home.component';

const routes: Routes = [
  {
    path: '',
    component: SpeciesHomeComponent,
    runGuardsAndResolvers: 'always' // Force re-init on same-route navigation (tab bar)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpeciesRoutingModule { }
