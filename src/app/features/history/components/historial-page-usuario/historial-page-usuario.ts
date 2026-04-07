import { Component } from '@angular/core';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';

@Component({
  selector: 'app-historial-page-usuario',
  imports: [PageLayout],
  templateUrl: './historial-page-usuario.html',
  styleUrl: './historial-page-usuario.css',
})
export class HistorialPageUsuario {
  titulo = 'Historial de prestamos';
  descripcion = 'Aqui el usuario podra consultar su historial de prestamos.';
}
