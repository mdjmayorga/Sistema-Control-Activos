import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../../loans/services/loan.service';
import { Loan } from '../../../../core/models/loan.model';
import { LoansList } from '../../../../shared/components/loans-list/loans-list';
import { loanReturnPayload } from '../../../../shared/components/loan-item/loan-item';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [LoansList, PageLayout],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboardComponent implements OnInit {
  titulo = 'Mis prestamos';
  descripcion = 'Consulte y gestione los prestamos que tiene activos actualmente';
  loans: Loan[] = [];
  cargando = true;

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.loans = [];
      this.cargando = false;
      return;
    }

    this.loanService.obtenerPrestamosActivosByID(currentUser.uid).subscribe({
      next: (data) => {
        this.loans = data.sort((a, b) => b.fechaPrestamo.localeCompare(a.fechaPrestamo));
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener préstamos activos:', error);
        this.cargando = false;
      }
    });
  }

  async onDevolverPrestamo(payload: loanReturnPayload): Promise<void> {
    try {
      await this.loanService.marcarPrestamoComoDevuelto(payload.loanId);

      this.loans = this.loans.filter((loan) => loan.id !== payload.loanId);
    } catch (error) {
      console.error('Error al devolver el préstamo:', error);
    }
  }
}