import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prestamo } from '../../../core/models/prestamo';
import { loanReturnPayload, LoanItem } from '../loan-item/loan-item';

@Component({
  selector: 'app-prestamos-list',
  standalone: true,
  imports: [CommonModule, LoanItem],
  templateUrl: './loans-list.html',
  styleUrl: './loans-list.css',
})
export class LoansList {
  @Input() prestamos: Prestamo[] = [];
  @Input() mostrarBotonDevolver = false;
  @Input() mostrarFechaDevolucion = false;
  @Output() devolver = new EventEmitter<loanReturnPayload>();

  onDevolver(payload: loanReturnPayload): void {
    this.devolver.emit(payload);
  }

}
