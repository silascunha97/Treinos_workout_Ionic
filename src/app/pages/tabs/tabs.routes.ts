import { Routes } from '@angular/router';

export const TABS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'workout',
        loadComponent: () =>
          import('../workout/workout-active/workout-active.page').then((m) => m.WorkoutPage),
      },
      {
        path: 'exercises',
        loadComponent: () =>
          import('../exercises/exercise-list/exercise-list.page').then((m) => m.ExerciseListPage),
      },
      {
        path: 'exercises/:exerciseId',
        loadComponent: () =>
          import('../exercises/exercise-detail/exercise-detail.page').then((m) => m.ExerciseDetailPage),
      },
      {
        path: 'metrics',
        loadComponent: () =>
          import('../metrics/metrics.page').then((m) => m.MetricsPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];