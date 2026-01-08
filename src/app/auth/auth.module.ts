import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AuthSharedModule } from './auth-shared.module';

// Page Components (not shared)
import { HomeStartComponent } from './home-start/home-start.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { WaitlistComponent } from './waitlist/waitlist.component';
import { Setup2FAComponent } from './setup-2fa/setup-2fa.component';

@NgModule({
  declarations: [
    HomeStartComponent,
    LoginComponent,
    SignupComponent,
    WaitlistComponent,
    Setup2FAComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,  // For ngModel in 2FA and login
    TranslateModule,
    AuthRoutingModule,
    SharedModule,
    AuthSharedModule  // Import shared auth components
  ],
  exports: [
    HomeStartComponent,
    LoginComponent,
    SignupComponent,
    WaitlistComponent,
    Setup2FAComponent,
    AuthSharedModule  // Re-export for convenience
  ]
})
export class AuthModule { }
