import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { AUTH_ROUTES } from './features/auth/routes';

export const routes: Routes = [
  // Routes d'authentification
  ...AUTH_ROUTES,
  {
    path: '',
    loadComponent: () => import('./features/home/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'schools',
    loadComponent: () => import('./features/school/school-list/school-list.component').then(m => m.SchoolListComponent)
  },
  {
    path: 'schools/:id',
    loadComponent: () => import('./features/school/school-details/school-details.component').then(m => m.SchoolDetailsComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/school/favorites/favorites.component').then(m => m.FavoritesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'register-school',
    loadComponent: () => import('./features/school/register-school/register-school.component').then(m => m.RegisterSchoolComponent)
  },
  {
    path: 'compare',
    loadComponent: () => import('./features/school/school-comparison/school-comparison.component').then(m => m.SchoolComparisonComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
