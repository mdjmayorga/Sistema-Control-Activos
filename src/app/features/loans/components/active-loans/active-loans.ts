import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { loanReturnPayload } from '../../../../shared/components/loan-item/loan-item';
import { LoansList } from '../../../../shared/components/loans-list/loans-list';
import { Loan } from '../../../../core/models/loan.model';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-active-loans-page',
  standalone: true,
  imports: [CommonModule, LoansList, PageLayout],
  templateUrl: './active-loans.html',
  styleUrl: './active-loans.css',
})
export class ActiveLoansPage {
  private readonly route = inject(ActivatedRoute);
  private readonly loanService = inject(LoanService);

  titulo = 'Prestamos activos';
  descripcion = 'Consulte los prestamos actualmente registrados en el sistema';
  mostrarBotonDevolver = false;

  loans: Loan[] = [];

  constructor() {
    this.route.data.subscribe((data) => {
      this.mostrarBotonDevolver = data['mostrarBotonDevolver'] === true;
    });
  }

  ngOnInit(): void {
    this.loanService.obtenerPrestamosActivos().subscribe({
      next: (data) => {
        this.loans = data.sort((a, b) => b.fechaPrestamo.localeCompare(a.fechaPrestamo));
      },
      error: (error) => {
        console.error('Error al obtener préstamos activos del sistema:', error);
      }
    });
  }

  async onDevolverPrestamo(payload: loanReturnPayload): Promise<void> {
    try {
      await this.loanService.marcarPrestamoComoDevuelto(payload.loanId);
    } catch (error) {
      console.error('Error al devolver el préstamo:', error);
    }
  }
}
