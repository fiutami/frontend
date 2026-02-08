import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
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
import { NotificationsComponent } from './notifications/notifications.component';
import { ActivityComponent } from './activity/activity.component';
import { SavedComponent } from './saved/saved.component';
import { FriendsComponent } from './friends/friends.component';
import { InviteComponent } from './invite/invite.component';
import { BlockedComponent } from './blocked/blocked.component';

@NgModule({
  declarations: [
    UserLayoutComponent,
    UserDashboardComponent,
    ProfileComponent,
    SettingsComponent,
    SecurityComponent,
    AccountComponent,
    NotificationsComponent,
    ActivityComponent,
    SavedComponent,
    FriendsComponent,
    InviteComponent,
    BlockedComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    UserRoutingModule,
    SharedModule
  ]
})
export class UserModule { }
