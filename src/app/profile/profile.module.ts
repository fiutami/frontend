import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfilePrototypeComponent } from './prototype/profile-prototype.component';
import { PetProfileComponent } from './pet/pet-profile.component';

@NgModule({
  imports: [
    CommonModule,
    ProfileRoutingModule,
    // Standalone components
    ProfilePrototypeComponent,
    PetProfileComponent
  ],
})
export class ProfileModule {}
