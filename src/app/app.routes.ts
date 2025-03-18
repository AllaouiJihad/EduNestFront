import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AUTH_ROUTES } from './features/auth/routes';

export const routes: Routes = [
  // Routes d'authentification
  ...AUTH_ROUTES,

  // Routes protégées
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Tableau de bord - EduNest'
  },

  // Redirection par défaut
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Route 404
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page non trouvée - EduNest'
  }
];
