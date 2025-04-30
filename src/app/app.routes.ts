import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'schools',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/school/school-list/school-list.component')
          .then(m => m.SchoolListComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./features/school/school-search/school-search.component')
          .then(m => m.SchoolSearchComponent)
      },
      {
        path: 'compare',
        loadComponent: () => import('./features/school/school-comparison/school-comparison.component')
          .then(m => m.SchoolComparisonComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/school/school-details/school-details.component')
          .then(m => m.SchoolDetailsComponent)
      }
    ]
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/components/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/components/register/register.component')
          .then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/components/forgot-password/forgot-password.component')
          .then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/components/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent)
      },
      {
        path: 'verify',
        loadComponent: () => import('./features/auth/components/verification/verification.component')
          .then(m => m.VerificationComponent)
      }
    ]
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/profile/user-profile/user-profile.component')
          .then(m => m.UserProfileComponent)
      },
      {
        path: 'favorites',
        loadComponent: () => import('./features/school/favorites/favorites.component')
          .then(m => m.FavoritesComponent)
      }
    ]
  },
  {
    path: 'school-registration',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/school/registration-form/registration-form.component')
          .then(m => m.RegistrationFormComponent)
      },
      {
        path: 'my-requests',
        loadComponent: () => import('./features//school/my-requests/my-requests.component')
          .then(m => m.MyRequestsComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
