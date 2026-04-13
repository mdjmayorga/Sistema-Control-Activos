import { Component } from '@angular/core';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';

@Component({
  selector: 'app-configuraciones-page',
  standalone: true,
  imports: [PageLayout],
  templateUrl: './configuraciones-page.html',
  styleUrl: './configuraciones-page.css',
})
export class ConfiguracionesPage {
  titulo = 'Configuraciones';
  descripcion = 'Aqui podra gestionar configuraciones globales del sistema.';
}
