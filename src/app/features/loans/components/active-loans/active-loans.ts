import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { loanReturnPayload } from '../../../../shared/components/loan-item/loan-item';
import { LoansList } from '../../../../shared/components/loans-list/loans-list';
import { Prestamo } from '../../../../core/models/prestamo';

@Component({
  selector: 'app-active-loans-page',
  standalone: true,
  imports: [CommonModule, LoansList],
  templateUrl: './active-loans.html',
  styleUrl: './active-loans.css',
})
export class ActiveLoansPage {
  private readonly route = inject(ActivatedRoute);

  titulo = 'Prestamos activos';
  descripcion = 'Consulte los prestamos actualmente registrados en el sistema';
  mostrarBotonDevolver = false;

  prestamos: Prestamo[] = [
    {
      id: '1',
      nombre_articulo: 'Articulo prestado 1',
      nombre_persona: 'Nombre del usuario',
      fecha_prestamos: '2026-03-12T09:00:00',
      fecha_devolucion: '2026-03-19T09:00:00',
    },
    {
      id: '2',
      nombre_articulo: 'Articulo prestado 2',
      nombre_persona: 'Nombre del usuario',
      fecha_prestamos: '2026-03-13T10:30:00',
      fecha_devolucion: null,
    },
    {
      id: '3',
      nombre_articulo: 'Articulo prestado 3',
      nombre_persona: 'Nombre del usuario',
      fecha_prestamos: '2026-03-15T08:15:00',
      fecha_devolucion: null,
    },
  ];

  constructor() {
    this.route.data.subscribe((data) => {
      this.mostrarBotonDevolver = data['mostrarBotonDevolver'] === true;
    });
  }

  onDevolverPrestamo(payload: loanReturnPayload): void {
    const fechaActual = new Date().toISOString();

    this.prestamos = this.prestamos.map((prestamo) =>
      prestamo.id === payload.prestamoId
        ? { ...prestamo, fecha_devolucion: fechaActual }
        : prestamo
    );
  }
}
