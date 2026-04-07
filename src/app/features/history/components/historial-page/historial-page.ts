import { Component } from '@angular/core';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';

@Component({
  selector: 'app-historial-page',
  standalone: true,
  imports: [PageLayout],
  templateUrl: './historial-page.html',
  styleUrl: './historial-page.css',
})
export class HistorialPage {
  titulo = 'Historial';
  descripcion = 'Aqui podra ver el historial de acciones del administrador.';
}
