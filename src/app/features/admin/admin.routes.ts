import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../dashboard/admin-dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent)
  },
  {
    path: 'schools',
    loadComponent: () => import('../school-management/school-management.component')
      .then(m => m.SchoolManagementComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('../user-management/user-management.component')
      .then(m => m.UserManagementComponent)
  },
  {
    path: 'registrations',
    loadComponent: () => import('../registration-approval/registration-approval.component')
      .then(m => m.RegistrationApprovalComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('../category-management/category-management.component')
      .then(m => m.CategoryManagementComponent)
  }
];
