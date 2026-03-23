import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  // TODO: descomentar cuando se integre la rama de registro (AU001)
  // {
  //   path: 'register',
  //   loadComponent: () =>
  //     import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  // },
];
