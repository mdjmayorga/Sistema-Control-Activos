import { Routes } from '@angular/router';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { LoanRequestComponent } from './pages/loan-request/loan-request';

export const routes: Routes = [
  { path: '', redirectTo: 'usuario', pathMatch: 'full' },
  { path: 'usuario', component: UserDashboardComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'solicitar-prestamo', component: LoanRequestComponent }
];