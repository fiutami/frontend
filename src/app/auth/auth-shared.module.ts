import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

// Social Login dependencies
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider,
  GoogleSigninButtonModule
} from '@abacritt/angularx-social-login';
import { environment } from '../../environments/environment';

// Reusable auth UI components (without HomeStartComponent)
import { AuthCardComponent } from './auth-card/auth-card.component';
import { SocialLoginComponent } from './social-login/social-login.component';
import { LanguageSwitcherComponent } from './language-switcher/language-switcher.component';

/**
 * AuthSharedModule - Exports reusable auth UI components
 * Use this module when you need auth components without the HomeStartComponent
 * (which has global CSS styles that can conflict)
 */
@NgModule({
  declarations: [
    AuthCardComponent,
    SocialLoginComponent,
    LanguageSwitcherComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SocialLoginModule,
    GoogleSigninButtonModule
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.oauth.google.clientId, {
              oneTapEnabled: false,
              scopes: 'openid email profile'
            })
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(environment.oauth.facebook.appId, {
              scope: 'email,public_profile',
              return_scopes: true,
              enable_profile_selector: true,
              version: 'v18.0'
            })
          }
        ],
        onError: (err) => console.error('Social login error:', err)
      } as SocialAuthServiceConfig
    }
  ],
  exports: [
    AuthCardComponent,
    SocialLoginComponent,
    LanguageSwitcherComponent
  ]
})
export class AuthSharedModule { }
