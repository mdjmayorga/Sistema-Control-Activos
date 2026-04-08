import { Routes } from '@angular/router';

import { LoanRequestComponent } from './features/loans/components/loan-request/loan-request';
import { UserDashboardComponent } from './features/dashboard/components/user-dashboard/user-dashboard';
import { HistorialPageUsuario } from './features/history/components/historial-page-usuario/historial-page-usuario';
import { ConfiguracionesPageUsuario } from './features/settings/components/configuraciones-page-usuario/configuraciones-page-usuario';

import { PrestamosActivosAdminPage } from './features/prestamos/pages/prestamos-activos-admin-page/prestamos-activos-admin-page';
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
      { path: 'solicitar-prestamo', component: LoanRequestComponent },
      { path: 'mis-prestamos', component: UserDashboardComponent },
      { path: 'historial', component: HistorialPageUsuario },
      { path: 'configuraciones', component: ConfiguracionesPageUsuario }
    ]
  },

  {
    path: 'admin',
    children: [
      { path: 'prestamos-activos', component: PrestamosActivosAdminPage },
      { path: 'historial', component: HistorialPage },
      { path: 'configuraciones', component: ConfiguracionesPage }
    ]
  }
];