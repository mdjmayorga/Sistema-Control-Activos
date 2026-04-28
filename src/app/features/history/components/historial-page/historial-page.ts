import { Component, inject } from '@angular/core';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { LoansList } from '../../../../shared/components/loans-list/loans-list';
import { Loan } from '../../../../core/models/loan.model';
import { HistorialService } from '../../services/historial.service';

const PRESTAMOS_PLACEHOLDER: Loan[] = [
  {
    id: 'placeholder-1',
    grupoTopografia: 'G1',
    cuadrilla: 'C1',
    razonPrestamo: 'Proyecto final de topografía',
    activo: 'Estación Total Leica TS06',
    numeroSerie: 'TS06-2024-001',
    correoInstitucional: 'mamayorga@estudiantec.cr',
    estado: 'devuelto',
    fechaPrestamo: '2026-03-10T08:00:00.000Z',
    fechaDevolucion: '2026-03-12T16:00:00.000Z',
    usuarioId: 'placeholder-user-1',
    usuarioNombre: 'Mariano Mayorga',
  },
  {
    id: 'placeholder-2',
    grupoTopografia: 'G2',
    cuadrilla: 'C3',
    razonPrestamo: 'Levantamiento catastral TFG',
    activo: 'GPS Trimble R8',
    numeroSerie: 'GPS-2024-042',
    correoInstitucional: 'mamayorga@estudiantec.cr',
    estado: 'devuelto',
    fechaPrestamo: '2026-02-20T08:00:00.000Z',
    fechaDevolucion: '2026-02-22T14:00:00.000Z',
    usuarioId: 'placeholder-user-1',
    usuarioNombre: 'Mariano Mayorga',
  },
];

@Component({
  selector: 'app-historial-page',
  standalone: true,
  imports: [PageLayout, LoansList],
  templateUrl: './historial-page.html',
  styleUrl: './historial-page.css',
})
export class HistorialPage {
  private readonly historialService = inject(HistorialService);

  readonly titulo = 'Historial';
  readonly descripcion = 'Consulte el historial completo de préstamos de todos los usuarios.';
  readonly prestamos: Loan[] = PRESTAMOS_PLACEHOLDER;

  descargarCSV(): void {
    const fecha = new Date().toISOString().slice(0, 10);
    this.historialService.descargarCSV(this.prestamos, `historial-completo-${fecha}.csv`);
  }
}
