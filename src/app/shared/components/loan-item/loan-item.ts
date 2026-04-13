import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loan } from '../../../core/models/loan.model';
import { ReturnButton } from '../../../features/returns/components/return-button/return-button';
import { ReturnModal } from '../../../features/returns/components/return-modal/return-modal';

export interface loanReturnPayload {
  loanId: string;
  productoDanado: boolean;
}

@Component({
  selector: 'app-loan-item',
  standalone: true,
  imports: [CommonModule, ReturnButton, ReturnModal],
  templateUrl: './loan-item.html',
  styleUrl: './loan-item.css',
})
export class LoanItem {
  @Input() loan!: Loan;
  @Input() mostrarBotonDevolver = false;
  @Input() mostrarFechaDevolucion = false;
  @Output() devolver = new EventEmitter<loanReturnPayload>();

  modalAbierto = false;

  abrirModal(): void {
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  confirmarDevolucion(payload?: { productoDanado: boolean }): void {
    this.devolver.emit({
      loanId: this.loan.id ?? '',
      productoDanado: payload?.productoDanado ?? false,
    });
    this.modalAbierto = false;
  }
}
