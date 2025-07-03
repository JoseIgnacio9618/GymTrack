import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full',
  },
  {
    path: 'folder/:id',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },
  {
    path: 'start',
    loadComponent: () =>
      import('./components/start/start.component').then((m) => m.StartComponent),
  },
  {
    path: 'create-routine',
    loadComponent: () => import('./components/create-routine/create-routine.page').then( m => m.CreateRoutinePage)
  },

];
