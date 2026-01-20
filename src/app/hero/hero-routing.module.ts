import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { WelcomeAiComponent } from './welcome-ai/welcome-ai.component';
import { WelcomeAi1Component } from './welcome-ai/welcome-ai-1/welcome-ai-1.component';
import { WelcomeAi2aComponent } from './welcome-ai/welcome-ai-2a/welcome-ai-2a.component';
import { WelcomeAi2bComponent } from './welcome-ai/welcome-ai-2b/welcome-ai-2b.component';
import { PetRegisterComponent } from './pet-register/pet-register.component';
import { SpecieComponent } from './pet-register/specie/specie.component';
import { PetDetailsComponent } from './pet-register/details/pet-details.component';
import { PetDocsComponent } from './pet-register/docs/pet-docs.component';
import { PetWellnessComponent } from './pet-register/wellness/pet-wellness.component';
import { SpeciesQ1Component } from './species-questionnaire/species-q1/species-q1.component';
import { SpeciesQ2Component } from './species-questionnaire/species-q2/species-q2.component';
import { SpeciesQ3Component } from './species-questionnaire/species-q3/species-q3.component';
import { SpeciesQ4Component } from './species-questionnaire/species-q4/species-q4.component';
import { SpeciesQ5Component } from './species-questionnaire/species-q5/species-q5.component';
import { SpeciesQ6Component } from './species-questionnaire/species-q6/species-q6.component';
import { SpeciesResultComponent } from './species-questionnaire/species-result/species-result.component';
import { HomeComponent } from './home/home.component';
import { PetProfileComponent } from './pet-profile/pet-profile.component';
import { PetGalleryComponent } from './pet-profile/gallery/pet-gallery.component';
import { PetMemoriesComponent } from './pet-profile/memories/pet-memories.component';
import { PetFriendsComponent } from './pet-profile/friends/pet-friends.component';
import { FattiBestialiComponent } from './pet-profile/fatti-bestiali/fatti-bestiali.component';
// Old hero calendar (now replaced by month selector)
// import { CalendarComponent } from './calendar/calendar.component';
import { CalendarMonthSelectorComponent } from '../calendar/calendar-month-selector/calendar-month-selector.component';
import { MapComponent } from './map/map.component';
import { ChatListComponent } from './chat/chat-list/chat-list.component';
import { ChatScreenComponent } from './chat/chat-screen/chat-screen.component';

// Account Drawer Component (direct import)
import { AccountDrawerComponent } from './drawer-sections/account/account.component';

// Drawer Sections
import {
  ActivityComponent,
  NotificationsComponent,
  SavedComponent,
  AdoptComponent,
  PetFriendsComponent as DrawerPetFriendsComponent,
  InviteComponent,
  LostPetsComponent,
  BlockedUsersComponent,
  TermsComponent,
  SubscriptionsComponent,
  ContactComponent,
  PrivacyComponent,
} from './drawer-sections';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  // Tab Bar Routes - runGuardsAndResolvers: 'always' forces component re-init on same-route navigation
  {
    path: 'main',
    component: HomeComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'pet-profile',
    component: PetProfileComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'pet-profile/:id',
    component: PetProfileComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'pet-profile/:id/gallery',
    component: PetGalleryComponent
  },
  {
    path: 'pet-profile/:id/memories',
    component: PetMemoriesComponent
  },
  {
    path: 'pet-profile/:id/friends',
    component: PetFriendsComponent
  },
  {
    path: 'pet-profile/:id/fatti-bestiali',
    component: FattiBestialiComponent
  },
  {
    path: 'calendar',
    component: CalendarMonthSelectorComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'map',
    component: MapComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'chat',
    component: ChatListComponent
  },
  {
    path: 'chat/:conversationId',
    component: ChatScreenComponent
  },
  {
    path: 'welcome',
    component: WelcomeComponent
  },
  {
    path: 'welcome-ai',
    component: WelcomeAiComponent
  },
  {
    path: 'welcome-ai/1',
    component: WelcomeAi1Component
  },
  {
    path: 'welcome-ai/2a',
    component: WelcomeAi2aComponent
  },
  {
    path: 'welcome-ai/2b',
    component: WelcomeAi2bComponent
  },
  {
    path: 'pet-register',
    component: PetRegisterComponent
  },
  {
    path: 'pet-register/specie',
    component: SpecieComponent
  },
  {
    path: 'pet-register/details',
    component: PetDetailsComponent
  },
  {
    path: 'pet-register/docs',
    component: PetDocsComponent
  },
  {
    path: 'pet-register/wellness',
    component: PetWellnessComponent
  },
  {
    path: 'species-questionnaire',
    children: [
      { path: '', redirectTo: 'q1', pathMatch: 'full' },
      { path: 'q1', component: SpeciesQ1Component },
      { path: 'q2', component: SpeciesQ2Component },
      { path: 'q3', component: SpeciesQ3Component },
      { path: 'q4', component: SpeciesQ4Component },
      { path: 'q5', component: SpeciesQ5Component },
      { path: 'q6', component: SpeciesQ6Component },
      { path: 'result', component: SpeciesResultComponent },
    ]
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'breeds',
    loadChildren: () => import('./breeds/breeds.module').then(m => m.BreedsModule)
  },
  {
    path: 'species',
    loadChildren: () => import('./species/species.module').then(m => m.SpeciesModule)
  },
  // Drawer Sections Routes
  {
    path: 'account',
    component: AccountDrawerComponent
  },
  {
    path: 'activity',
    component: ActivityComponent
  },
  {
    path: 'notifications',
    component: NotificationsComponent
  },
  {
    path: 'favorites',
    component: SavedComponent
  },
  {
    path: 'adopt',
    component: AdoptComponent
  },
  {
    path: 'friends',
    component: DrawerPetFriendsComponent
  },
  {
    path: 'invite',
    component: InviteComponent
  },
  {
    path: 'lost-pets',
    component: LostPetsComponent
  },
  {
    path: 'blocked',
    component: BlockedUsersComponent
  },
  {
    path: 'terms',
    component: TermsComponent
  },
  {
    path: 'subscriptions',
    component: SubscriptionsComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'privacy',
    component: PrivacyComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HeroRoutingModule { }
