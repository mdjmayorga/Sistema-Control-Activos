import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal {
  readonly abierto = input(false);
  readonly titulo = input('Confirmar accion');
  readonly mensaje = input('¿Desea continuar con esta accion?');
  readonly textoConfirmar = input('Confirmar');
  readonly textoCancelar = input('Cancelar');

  readonly cerrar = output<void>();
  readonly confirmar = output<void>();

  onCerrar(): void {
    this.cerrar.emit();
  }

  onConfirmar(): void {
    this.confirmar.emit();
  }
}
