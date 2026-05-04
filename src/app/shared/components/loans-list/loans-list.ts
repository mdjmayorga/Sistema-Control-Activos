import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loan } from '../../../core/models/loan.model';
import { LoanReturnPayload, LoanItem } from '../loan-item/loan-item';

@Component({
  selector: 'app-prestamos-list',
  standalone: true,
  imports: [CommonModule, LoanItem],
  templateUrl: './loans-list.html',
  styleUrl: './loans-list.css',
})
export class LoansList {
  @Input() loans: Loan[] = [];
  @Input() showReturnButton = false;
  @Input() showReturnDate = false;
  @Output() returnLoan = new EventEmitter<LoanReturnPayload>();

  onReturn(payload: LoanReturnPayload): void {
    this.returnLoan.emit(payload);
  }
}
