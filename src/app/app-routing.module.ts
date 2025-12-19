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
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
