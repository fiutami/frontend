import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { HomeStartComponent } from './home-start/home-start.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { WaitlistComponent } from './waitlist/waitlist.component';
import { Setup2FAComponent } from './setup-2fa/setup-2fa.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: HomeStartComponent
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'signup',
        component: SignupComponent
      },
      {
        path: 'waitlist',
        component: WaitlistComponent
      },
      {
        path: 'setup-2fa',
        component: Setup2FAComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
