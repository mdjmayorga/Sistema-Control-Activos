import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { LoanHistoryService } from '../../services/loan-history.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Loan } from '../../../../core/models/loan.model';

@Component({
  selector: 'app-user-loan-history',
  imports: [PageLayout, DatePipe],
  templateUrl: './user-loan-history.html',
  styleUrl: './user-loan-history.css',
})
export class UserLoanHistoryPage implements OnInit {
  private readonly loanHistoryService = inject(LoanHistoryService);
  private readonly authService = inject(AuthService);

  title = 'Historial de prestamos';
  description = 'Consulte sus prestamos finalizados con fechas de prestamo y devolucion.';

  loans = signal<Loan[]>([]);
  loading = signal(true);
  pageSize = signal(10);
  currentPage = signal(1);

  readonly pageSizeOptions = [5, 10, 15, 20];

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.loans().length / this.pageSize()))
  );

  paginatedLoans = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.loans().slice(start, start + this.pageSize());
  });

  startIndex = computed(() =>
    this.loans().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  endIndex = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.loans().length)
  );

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.loading.set(false);
      return;
    }

    this.loanHistoryService
      .getLoansByUser(user.uid, 'devuelto')
      .subscribe({
        next: (data) => {
          this.loans.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error fetching loan history:', error);
          this.loading.set(false);
        },
      });
  }

  onPageSizeChange(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    this.pageSize.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
