import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

const routes: Routes = [
  // Auth routes - accessible only to guests (includes /, /login, /signup)
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [GuestGuard]
  },

  // Protected routes - require authentication
  {
    path: 'home',
    loadChildren: () => import('./hero/hero.module').then(m => m.HeroModule),
    canActivate: [AuthGuard]
  },


  // User area - requires authentication
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuard]
  },

  // Onboarding flow - requires authentication
  {
    path: 'onboarding',
    loadChildren: () => import('./onboarding/onboarding.module').then(m => m.OnboardingModule),
    canActivate: [AuthGuard]
  },

  // Profile - requires authentication
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },

  // Breeds catalog - requires authentication
  {
    path: 'breeds',
    loadChildren: () => import('./breeds/breeds.module').then(m => m.BreedsModule),
    canActivate: [AuthGuard]
  },

  // Calendar - requires authentication
  {
    path: 'calendar',
    loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarModule),
    canActivate: [AuthGuard]
  },

  // Map - dog-friendly POI map
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then(m => m.MapModule),
    canActivate: [AuthGuard]
  },

  // Search - global search with filters
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then(m => m.SearchModule),
    canActivate: [AuthGuard]
  },

  // Premium subscriptions
  {
    path: 'premium',
    loadChildren: () => import('./premium/premium.module').then(m => m.PremiumModule),
    canActivate: [AuthGuard]
  },

  // Chat - messaging between users
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule),
    canActivate: [AuthGuard]
  },

  // Adoption - pet adoption listings
  {
    path: 'adoption',
    loadChildren: () => import('./adoption/adoption.module').then(m => m.AdoptionModule),
    canActivate: [AuthGuard]
  },

  // Lost Pets - missing animals reports and sightings
  {
    path: 'lost-pets',
    loadChildren: () => import('./lost-pets/lost-pets.module').then(m => m.LostPetsModule),
    canActivate: [AuthGuard]
  },

  // Test route - Hero with video instead of image (no auth required for testing)
  {
    path: 'test-video',
    loadChildren: () => import('./hero-video/hero-video.module').then(m => m.HeroVideoModule)
  },

  // Test route - Hero component for visual regression testing (no auth required)
  {
    path: 'test-hero',
    loadChildren: () => import('./hero/hero-test.module').then(m => m.HeroTestModule)
  },

  // Styleguide - Component showcase (public, hidden route)
  {
    path: 'styleguide',
    loadChildren: () => import('./styleguide/styleguide.module').then(m => m.StyleguideModule)
  },

  // TEST: TabPageShellDefault - TEMPORANEO
  {
    path: 'test/shell-default',
    loadComponent: () => import('./shared/pages/test-shell-default/test-shell-default.component').then(m => m.TestShellDefaultComponent)
  },

  // Future: Dashboard route (lazy loaded)
  // {
  //   path: 'dashboard',
  //   loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
  //   canActivate: [AuthGuard]
  // },

  // Redirect unknown routes to landing
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Set to true for debugging
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload' // Force reload when navigating to same URL (tab bar behavior)
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
