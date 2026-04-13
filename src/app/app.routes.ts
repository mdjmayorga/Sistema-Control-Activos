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
  { path: '', redirectTo: 'register', pathMatch: 'full' },
];
