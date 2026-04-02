import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prestamo } from '../../models/prestamo';
import { DevolverButton } from '../devolver-button/devolver-button';
import { DevolucionModal } from '../devolucion-modal/devolucion-modal';

export interface DevolucionPrestamoPayload {
  prestamoId: string;
  productoDanado: boolean;
}

@Component({
  selector: 'app-prestamo-item',
  standalone: true,
  imports: [CommonModule, DevolverButton, DevolucionModal],
  templateUrl: './prestamo-item.html',
  styleUrl: './prestamo-item.css',
})
export class PrestamoItem {
  @Input() prestamo!: Prestamo;
  @Input() mostrarBotonDevolver = false;
  @Output() devolver = new EventEmitter<DevolucionPrestamoPayload>();

  modalAbierto = false;

  abrirModal(): void {
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  confirmarDevolucion(payload?: { productoDanado: boolean }): void {
    this.devolver.emit({
      prestamoId: this.prestamo.id,
      productoDanado: payload?.productoDanado ?? false,
    });
    this.modalAbierto = false;
  }
}
