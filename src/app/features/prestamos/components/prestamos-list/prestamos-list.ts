import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prestamo } from '../../models/prestamo';
import { DevolucionPrestamoPayload, PrestamoItem } from '../prestamo-item/prestamo-item';

@Component({
  selector: 'app-prestamos-list',
  standalone: true,
  imports: [CommonModule, PrestamoItem],
  templateUrl: './prestamos-list.html',
  styleUrl: './prestamos-list.css',
})
export class PrestamosList {
  @Input() prestamos: Prestamo[] = [];
  @Input() mostrarBotonDevolver = false;
  @Output() devolver = new EventEmitter<DevolucionPrestamoPayload>();

  onDevolver(payload: DevolucionPrestamoPayload): void {
    this.devolver.emit(payload);
  }

}
