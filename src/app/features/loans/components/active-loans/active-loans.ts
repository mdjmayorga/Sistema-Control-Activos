import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { loanReturnPayload } from '../../../../shared/components/loan-item/loan-item';
import { LoansList } from '../../../../shared/components/loans-list/loans-list';
import { Loan } from '../../../../core/models/loan.model';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';

@Component({
  selector: 'app-active-loans-page',
  standalone: true,
  imports: [CommonModule, LoansList, PageLayout],
  templateUrl: './active-loans.html',
  styleUrl: './active-loans.css',
})
export class ActiveLoansPage {
  private readonly route = inject(ActivatedRoute);

  titulo = 'Prestamos activos';
  descripcion = 'Consulte los prestamos actualmente registrados en el sistema';
  mostrarBotonDevolver = false;

  loans: Loan[] = [
    {
      id: '1',
      grupoTopografia: 'Grupo de Topografia',
      cuadrilla: 'Cuadrilla 1',
      razonPrestamo: 'Docencia',
      activo: 'Articulo prestado 1',
      estado: 'devuelto',
      fechaPrestamo: '2026-03-12T09:00:00',
      usuarioId: 'admin-demo',
      usuarioNombre: 'Nombre del usuario',
    },
    {
      id: '2',
      grupoTopografia: 'Grupo de Taller',
      cuadrilla: 'Cuadrilla 2',
      razonPrestamo: 'Curso',
      activo: 'Articulo prestado 2',
      estado: 'activo',
      fechaPrestamo: '2026-03-13T10:30:00',
      usuarioId: 'admin-demo',
      usuarioNombre: 'Nombre del usuario',
    },
    {
      id: '3',
      grupoTopografia: 'Grupo de Proyecto',
      cuadrilla: 'Cuadrilla 3',
      razonPrestamo: 'TFG',
      activo: 'Articulo prestado 3',
      estado: 'activo',
      fechaPrestamo: '2026-03-15T08:15:00',
      usuarioId: 'admin-demo',
      usuarioNombre: 'Nombre del usuario',
    },
  ];

  constructor() {
    this.route.data.subscribe((data) => {
      this.mostrarBotonDevolver = data['mostrarBotonDevolver'] === true;
    });
  }

  onDevolverPrestamo(payload: loanReturnPayload): void {
    this.loans = this.loans.map((loan) =>
      loan.id === payload.loanId
        ? { ...loan, estado: 'devuelto' }
        : loan
    );
  }
}
