import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../../loans/services/loan.service';
import { Loan } from '../../../../core/models/loan.model';
import { Prestamo } from '../../../../core/models/prestamo';
import { LoansList } from '../../../../shared/components/loans-list/loans-list';
import { loanReturnPayload } from '../../../../shared/components/loan-item/loan-item';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';

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
  prestamosActivos: Loan[] = [];
  prestamosUsuario: Prestamo[] = [];
  cargando = true;

  constructor(private loanService: LoanService) {}

  ngOnInit(): void {
    this.loanService.obtenerPrestamosActivos().subscribe({
      next: (data) => {
        this.prestamosActivos = data;
        this.prestamosUsuario = this.mapLoansToPrestamos(data);
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
      await this.loanService.marcarPrestamoComoDevuelto(payload.prestamoId);

      this.prestamosActivos = this.prestamosActivos.filter(
        (prestamo) => prestamo.id !== payload.prestamoId
      );
      this.prestamosUsuario = this.prestamosUsuario.filter(
        (prestamo) => prestamo.id !== payload.prestamoId
      );
    } catch (error) {
      console.error('Error al devolver el préstamo:', error);
    }
  }

  private mapLoansToPrestamos(loans: Loan[]): Prestamo[] {
    return loans.map((loan, index) => ({
      id: loan.id ?? `loan-${index}`,
      nombre_articulo: loan.activo,
      nombre_persona: loan.usuarioNombre,
      fecha_prestamos: loan.fechaPrestamo,
      fecha_devolucion: loan.estado === 'devuelto' ? loan.fechaPrestamo : null,
    }));
  }
}