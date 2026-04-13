import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { ActiveLoansPage } from './features/loans/components/active-loans/active-loans';
import { UserDashboardComponent } from './features/dashboard/components/user-dashboard/user-dashboard';

import { LoanRequestComponent } from './features/loans/components/loan-request/loan-request';
import { HistorialPageUsuario } from './features/history/components/historial-page-usuario/historial-page-usuario';
import { ConfiguracionesPageUsuario } from './features/settings/components/configuraciones-page-usuario/configuraciones-page-usuario';

import { HistorialPage } from './features/history/components/historial-page/historial-page';
import { ConfiguracionesPage } from './features/settings/components/configuraciones-page/configuraciones-page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rutas públicas
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/auth/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
  },

  // AU004 - Ruta protegida: solo usuarios autenticados
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/user/dashboard/user-dashboard.component').then(
        (m) => m.UserDashboardComponent,
      ),
    canActivate: [authGuard],
  },

  // AU004 - Ruta protegida: solo administradores
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
    canActivate: [adminGuard],
  },

  { path: '**', redirectTo: 'login' },
];


  { path: '', redirectTo: 'usuario/solicitar-prestamo', pathMatch: 'full' },

  {
    path: 'usuario',
    children: [
      { path: '', redirectTo: 'solicitar-prestamo', pathMatch: 'full' },
      { path: 'solicitar-prestamo', component: LoanRequestComponent },
      { path: 'mis-prestamos', component: UserDashboardComponent },
      { path: 'mi-historial', component: HistorialPageUsuario },
      { path: 'configuraciones', component: ConfiguracionesPageUsuario },
    ],
  },
  {
    path: 'admin',
    children: [
      { path: '', redirectTo: 'historial', pathMatch: 'full' },
      {path: 'solicitar-prestamo', component: LoanRequestComponent },
      {path: 'mis-prestamos', component: UserDashboardComponent },
      {path: 'prestamos-activos', component: ActiveLoansPage },
      {path: 'mi-historial', component: HistorialPageUsuario },
      { path: 'historial', component: HistorialPage },
      { path: 'configuraciones', component: ConfiguracionesPage },
    ],
  },
  
  {
    path: '**',
    redirectTo: 'usuario/solicitar-prestamo',
  },
];