import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';

// Layout
import { UserLayoutComponent } from './layout/user-layout.component';

// Pages
import { UserDashboardComponent } from './user-dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { SecurityComponent } from './security/security.component';
import { AccountComponent } from './account/account.component';

@NgModule({
  declarations: [
    UserLayoutComponent,
    UserDashboardComponent,
    ProfileComponent,
    SettingsComponent,
    SecurityComponent,
    AccountComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoutingModule,
    SharedModule
  ]
})
export class UserModule { }
