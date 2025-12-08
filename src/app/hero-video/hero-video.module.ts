import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AuthSharedModule } from '../auth/auth-shared.module';
import { HeroVideoComponent } from './hero-video.component';

@NgModule({
  declarations: [HeroVideoComponent],
  imports: [
    CommonModule,
    SharedModule,
    AuthSharedModule,  // Use shared module without HomeStartComponent CSS
    RouterModule.forChild([
      { path: '', component: HeroVideoComponent }
    ])
  ],
  exports: [HeroVideoComponent]
})
export class HeroVideoModule {}
