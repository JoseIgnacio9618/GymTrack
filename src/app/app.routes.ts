import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./components/auth/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'start',
    loadComponent: () =>
      import('./components/start/start.component').then((m) => m.StartComponent),
    canActivate: [authGuard],
  },
  {
    path: 'folder/:id',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
    canActivate: [authGuard],
  },
  {
    path: 'create-routine',
    loadComponent: () =>
      import('./components/create-routine/create-routine.page').then((m) => m.CreateRoutinePage),
    canActivate: [authGuard],
  },
  {
    path: 'create-routine/:id',
    loadComponent: () =>
      import('./components/create-routine/create-routine.page').then((m) => m.CreateRoutinePage),
    canActivate: [authGuard],
  },
  {
    path: 'my-routines',
    loadComponent: () =>
      import('./components/my-routines/my-routines.page').then((m) => m.MyRoutinesPage),
    canActivate: [authGuard],
  },
  {
    path: 'trainings',
    loadComponent: () =>
      import('./components/trainings/trainings.page').then((m) => m.TrainingsPage),
    canActivate: [authGuard],
  },
  {
    path: 'training-history',
    loadComponent: () =>
      import('./components/training-history/training-history.page').then((m) => m.TrainingHistoryPage),
    canActivate: [authGuard],
  },
];
