import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/tasks.page').then((m) => m.TasksPage),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.page').then(
        (m) => m.DashboardPage,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.page').then(
        (m) => m.RegisterPage,
      ),
  },
  {
    path: 'grant-access',
    loadComponent: () =>
      import('./features/sharing/grant-access/grant-access.page').then(
        (m) => m.GrantAccessPage,
      ),
  },
  {
    path: 'edit-profile',
    loadComponent: () =>
      import('./features/profile/edit-profile/edit-profile.page').then(
        (m) => m.EditProfilePage,
      ),
  },
  {
    path: 'security',
    loadComponent: () =>
      import('./features/settings/security/security.page').then(
        (m) => m.SecurityPage,
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/settings/about/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./features/settings/privacy-policy/privacy-policy.page').then(
        (m) => m.PrivacyPolicyPage,
      ),
  },
  {
    path: 'terms-of-service',
    loadComponent: () =>
      import('./features/settings/terms-of-service/terms-of-service.page').then(
        (m) => m.TermsOfServicePage,
      ),
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./features/notifications/notifications.page').then(
        (m) => m.NotificationsPage,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.page').then(
        (m) => m.ForgotPasswordPage,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.page').then(
        (m) => m.ResetPasswordPage,
      ),
  },
];
