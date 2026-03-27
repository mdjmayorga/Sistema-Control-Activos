import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrestamosList } from '../../components/prestamos-list/prestamos-list';
import { Prestamo } from '../../models/prestamo';

@Component({
  selector: 'app-prestamos-activos-admin-page',
  standalone: true,
  imports: [CommonModule, PrestamosList],
  templateUrl: './prestamos-activos-admin-page.html',
  styleUrl: './prestamos-activos-admin-page.css',
})
export class PrestamosActivosAdminPage {
  titulo = 'Prestamos activos';
  descripcion = 'Consulte los prestamos actualmente registrados en el sistema';

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
}
