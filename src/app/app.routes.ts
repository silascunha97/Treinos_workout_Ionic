import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { activeWorkoutGuard } from './core/guards/active-workout.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () =>
      import('./pages/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/onboarding/onboarding.page').then((m) => m.OnboardingPage),
  },
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () =>
      import('./pages/auth/login/login.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/tabs/tabs.routes').then((m) => m.TABS_ROUTES),
  },
  {
    path: 'workout',
    canActivate: [authGuard],
    children: [
      {
        path: 'execution/:id',
        canDeactivate: [activeWorkoutGuard],
        loadComponent: () =>
          import('./pages/workout/execution/workout-execution.page').then(
            (m) => m.WorkoutExecutionPage
          ),
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import('./pages/workout/detail/workout-detail.page').then(
            (m) => m.WorkoutDetailPage
          ),
      },
      {
        path: 'summary',
        loadComponent: () =>
          import('./pages/workout/workout-summary/workout-summary.page').then(
            (m) => m.WorkoutSummaryPage
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/workout/workout-history/workout-history.page').then(
            (m) => m.WorkoutHistoryPage
          ),
      },
    ],
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
