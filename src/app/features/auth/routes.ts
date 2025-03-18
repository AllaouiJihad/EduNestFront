import { Routes } from '@angular/router';
import { publicGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
        title: 'Connexion - EduNest'
      },
      {
        path: 'register',
        loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
        title: 'Inscription - EduNest'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Mot de passe oublié - EduNest'
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: 'Réinitialisation du mot de passe - EduNest'
      },
      {
        path: 'verify',
        loadComponent: () => import('./components/verification/verification.component').then(m => m.VerificationComponent),
        title: 'Vérification du compte - EduNest'
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  }
];
