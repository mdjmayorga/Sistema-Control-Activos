import { Routes } from '@angular/router';
import { ActiveLoansPage } from './features/loans/components/active-loans/active-loans';
import { UserDashboardComponent } from './features/dashboard/components/user-dashboard/user-dashboard';

import { LoanRequestComponent } from './features/loans/components/loan-request/loan-request';
import { HistorialPageUsuario } from './features/history/components/historial-page-usuario/historial-page-usuario';
import { ConfiguracionesPageUsuario } from './features/settings/components/configuraciones-page-usuario/configuraciones-page-usuario';

import { HistorialPage } from './features/history/components/historial-page/historial-page';
import { ConfiguracionesPage } from './features/settings/components/configuraciones-page/configuraciones-page';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },

  { path: '', redirectTo: 'usuario/solicitar-prestamo', pathMatch: 'full' },

  {
    path: 'usuario',
    children: [
      { path: '', redirectTo: 'solicitar-prestamo', pathMatch: 'full' },
      { path: 'solicitar-prestamo', component: LoanRequestComponent },
      { path: 'mis-prestamos', component: UserDashboardComponent },
      { path: 'historial', component: HistorialPageUsuario },
      { path: 'configuraciones', component: ConfiguracionesPageUsuario },
    ],
  },
  {
    path: 'admin',
    children: [
      { path: '', redirectTo: 'historial', pathMatch: 'full' },
      { path: 'historial', component: HistorialPage },
      { path: 'configuraciones', component: ConfiguracionesPage },
    ],
  },
  {
    path: 'prestamos-activos',
    component: ActiveLoansPage,
    data: { mostrarBotonDevolver: true },
  },
  {
    path: 'mis-prestamos',
    redirectTo: 'usuario/mis-prestamos',
    pathMatch: 'full',
  },
  {
    path: 'mi-historial',
    redirectTo: 'usuario/historial',
    pathMatch: 'full',
  },
  {
    path: 'historial',
    redirectTo: 'admin/historial',
    pathMatch: 'full',
  },
  {
    path: 'configuraciones',
    redirectTo: 'usuario/configuraciones',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'usuario/solicitar-prestamo',
  },
];