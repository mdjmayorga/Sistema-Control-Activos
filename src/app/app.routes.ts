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
        path: '',
        redirectTo: 'prestamos-activos',
        pathMatch: 'full',
    },
    {
        path: 'prestamos-activos',
        component: ActiveLoansPage,
        data: { mostrarBotonDevolver: true },
    },
    {
        path: 'mis-prestamos',
        component: ActiveLoansPage,
        data: { mostrarBotonDevolver: true },
    },
    {
        path: 'historial',
        component: HistorialPage,
    },
    {
        path: 'mi-historial',
        component: HistorialPage,
    },
    {
        path: 'configuraciones',
        component: ConfiguracionesPage,
    },
    {
        path: '**',
        redirectTo: 'prestamos-activos',
    },
    { path: '', redirectTo: 'usuario', pathMatch: 'full' },
    { path: 'usuario', component: UserDashboardComponent },
    { path: 'solicitar-prestamo', component: LoanRequestComponent },

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
      { path: 'historial', component: HistorialPage },
      { path: 'configuraciones', component: ConfiguracionesPage }
    ]
  }
];