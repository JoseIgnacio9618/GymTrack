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
];
