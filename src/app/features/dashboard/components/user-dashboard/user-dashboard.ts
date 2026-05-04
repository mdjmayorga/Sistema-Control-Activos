import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../../loans/services/loan.service';
import { Loan } from '../../../../core/models/loan.model';
import { LoansList } from '../../../../shared/components/loans-list/loans-list';
import { LoanReturnPayload } from '../../../../shared/components/loan-item/loan-item';
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
  title = 'Mis prestamos';
  description = 'Consulte y gestione los prestamos que tiene activos actualmente';
  loans: Loan[] = [];
  loading = true;

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.loans = [];
      this.loading = false;
      return;
    }

    this.loanService.obtenerPrestamosActivosByID(currentUser.uid).subscribe({
      next: (data) => {
        this.loans = data.sort((a, b) => b.fechaPrestamo.localeCompare(a.fechaPrestamo));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching active loans:', error);
        this.loading = false;
      }
    });
  }

  async onReturnLoan(payload: LoanReturnPayload): Promise<void> {
    try {
      await this.loanService.marcarPrestamoComoDevuelto(payload.loanId, payload.isDamaged);
      this.loans = this.loans.filter((loan) => loan.id !== payload.loanId);
    } catch (error) {
      console.error('Error returning loan:', error);
    }
  }
}
