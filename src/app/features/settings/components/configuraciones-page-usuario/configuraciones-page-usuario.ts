import { Component } from '@angular/core';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';

@Component({
  selector: 'app-configuraciones-page-usuario',
  imports: [PageLayout],
  templateUrl: './configuraciones-page-usuario.html',
  styleUrl: './configuraciones-page-usuario.css',
})
export class ConfiguracionesPageUsuario {
  titulo = 'Configuraciones';
  descripcion = 'Aqui el usuario podra gestionar sus configuraciones.';
}
