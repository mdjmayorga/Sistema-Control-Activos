import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loan } from '../../../core/models/loan.model';
import { ReturnButton } from '../../../features/returns/components/return-button/return-button';
import { ReturnModal } from '../../../features/returns/components/return-modal/return-modal';

export interface LoanReturnPayload {
  loanId: string;
  isDamaged: boolean;
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
  @Input() showReturnButton = false;
  @Input() showReturnDate = false;
  @Output() returnLoan = new EventEmitter<LoanReturnPayload>();

  modalOpen = false;

  openModal(): void {
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  confirmReturn(payload?: { isDamaged: boolean }): void {
    this.returnLoan.emit({
      loanId: this.loan.id ?? '',
      isDamaged: payload?.isDamaged ?? false,
    });
    this.modalOpen = false;
  }
}
