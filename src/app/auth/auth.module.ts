import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AuthSharedModule } from './auth-shared.module';

// Page Components (not shared)
import { HomeStartComponent } from './home-start/home-start.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

@NgModule({
  declarations: [
    HomeStartComponent,
    LoginComponent,
    SignupComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    AuthRoutingModule,
    SharedModule,
    AuthSharedModule  // Import shared auth components
  ],
  exports: [
    HomeStartComponent,
    LoginComponent,
    SignupComponent,
    AuthSharedModule  // Re-export for convenience
  ]
})
export class AuthModule { }
