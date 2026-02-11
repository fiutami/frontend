import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { DevGuard } from './core/guards/dev.guard';

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

  // Test route - Hero with video instead of image (dev only)
  {
    path: 'test-video',
    loadChildren: () => import('./hero-video/hero-video.module').then(m => m.HeroVideoModule),
    canActivate: [DevGuard]
  },

  // Test route - Hero component for visual regression testing (dev only)
  {
    path: 'test-hero',
    loadChildren: () => import('./hero/hero-test.module').then(m => m.HeroTestModule),
    canActivate: [DevGuard]
  },

  // Styleguide - Component showcase (dev only)
  {
    path: 'styleguide',
    loadChildren: () => import('./styleguide/styleguide.module').then(m => m.StyleguideModule),
    canActivate: [DevGuard]
  },

  // TEST: Shell Pages - DEV ONLY (protected with DevGuard)
  {
    path: 'test/shell-default',
    loadComponent: () => import('./shared/pages/test-shell-default/test-shell-default.component').then(m => m.TestShellDefaultComponent),
    canActivate: [DevGuard]
  },
  {
    path: 'test/shell-yellow',
    loadComponent: () => import('./shared/pages/test-shell-yellow/test-shell-yellow.component').then(m => m.TestShellYellowComponent),
    canActivate: [DevGuard]
  },
  {
    path: 'test/shell-blue',
    loadComponent: () => import('./shared/pages/test-shell-blue/test-shell-blue.component').then(m => m.TestShellBlueComponent),
    canActivate: [DevGuard]
  },
  {
    path: 'test/shell-fiuto',
    loadComponent: () => import('./shared/pages/test-shell-fiuto/test-shell-fiuto.component').then(m => m.TestShellFiutoComponent),
    canActivate: [DevGuard]
  },
  {
    path: 'test/shell-pet-profile',
    loadComponent: () => import('./shared/pages/test-shell-pet-profile/test-shell-pet-profile.component').then(m => m.TestShellPetProfileComponent),
    canActivate: [DevGuard]
  },
  {
    path: 'test/bg-removal',
    loadComponent: () => import('./shared/pages/test-bg-removal/test-bg-removal.component').then(m => m.TestBgRemovalComponent),
    canActivate: [DevGuard]
  },
  {
    path: 'test/mascot-chat',
    loadComponent: () => import('./shared/pages/test-mascot-chat/test-mascot-chat.component').then(m => m.TestMascotChatComponent),
    canActivate: [DevGuard]
  },
  {
    path: 'test/pet-profile',
    loadComponent: () => import('./profile/pet/pet-profile.component').then(m => m.PetProfileComponent),
    canActivate: [DevGuard, AuthGuard]
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
