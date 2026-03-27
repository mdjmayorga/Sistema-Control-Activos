import { Routes } from '@angular/router';

// COMPONENTES DE USUARIO
import { LoanRequestComponent } from './features/loans/components/loan-request/loan-request';
import { UserDashboardComponent } from './features/dashboard/components/user-dashboard/user-dashboard';

// COMPONENTES DE aADMIN
import { PrestamosActivosAdminPage } from './features/prestamos/pages/prestamos-activos-admin-page/prestamos-activos-admin-page';
import { HistorialPage } from './features/admin/pages/historial-page/historial-page';
import { ConfiguracionesPage } from './features/admin/pages/configuraciones-page/configuraciones-page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'prestamos-activos',
    pathMatch: 'full'
  },

  // usuario
  {
    path: 'solicitar-prestamo',
    component: LoanRequestComponent
  },
  {
    path: 'mis-prestamos',
    component: UserDashboardComponent
  },

  // admin
  {
    path: 'prestamos-activos',
    component: PrestamosActivosAdminPage
  },
  {
    path: 'historial',
    component: HistorialPage
  },
  {
    path: 'mi-historial',
    component: HistorialPage
  },
  {
    path: 'configuraciones',
    component: ConfiguracionesPage
  }
];