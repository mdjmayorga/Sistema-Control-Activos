import { Routes } from '@angular/router';
import { UserDashboardComponent } from './features/dashboard/components/user-dashboard/user-dashboard';
import { AdminDashboardComponent } from './features/admin/components/admin-dashboard/admin-dashboard';
import { LoanRequestComponent } from './features/loans/components/loan-request/loan-request';


export const routes: Routes = [
  { path: '', redirectTo: 'usuario', pathMatch: 'full' },
  { path: 'usuario', component: UserDashboardComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'solicitar-prestamo', component: LoanRequestComponent }
];