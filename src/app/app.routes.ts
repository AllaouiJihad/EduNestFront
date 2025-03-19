import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AUTH_ROUTES } from './features/auth/routes';
import {SchoolSearchComponent} from "./features/school/school-search/school-search.component";
import {SchoolDetailsComponent} from "./features/school/school-details/school-details.component";
import {SchoolComparisonComponent} from "./features/school/school-comparison/school-comparison.component";
import {HomeComponent} from "./features/home/home/home.component";

function AuthGuard() {

}

export const routes: Routes = [
  // Routes d'authentification
  ...AUTH_ROUTES,
  {
    path: '',
    component: HomeComponent,
    // redirectTo: '/schools',
    pathMatch: 'full'
  },
  {
    path: 'schools',
    component: SchoolSearchComponent
  },
  {
    path: 'schools/:id',
    component: SchoolDetailsComponent
  },
  {
    path: 'comparison',
    component: SchoolComparisonComponent,
    canActivate: [AuthGuard] // Assurez-vous que l'utilisateur est connecté
  },

  // Routes protégées
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Tableau de bord - EduNest'
  },

  // Route 404
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page non trouvée - EduNest'
  }
];
