import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { LoanHistoryService, LoanStatus } from '../../services/loan-history.service';
import { Loan } from '../../../../core/models/loan.model';

@Component({
  selector: 'app-historial-page',
  standalone: true,
  imports: [PageLayout, DatePipe],
  templateUrl: './historial-page.html',
  styleUrls: ['../../../../shared/styles/data-table.css', './historial-page.css'],
})
export class HistorialPage implements OnInit {
  private readonly loanHistoryService = inject(LoanHistoryService);

  title = 'Historial General';
  description = 'Historial completo de préstamos de todos los usuarios del sistema.';

  loans = signal<Loan[]>([]);
  loading = signal(true);

  filterName = signal('');
  filterStatus = signal<LoanStatus | ''>('');
  filterLoanDate = signal('');
  filterReturnDate = signal('');

  pageSize = signal(10);
  currentPage = signal(1);
  readonly pageSizeOptions = [5, 10, 15, 20];
  readonly statusOptions: { value: LoanStatus | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'activo', label: 'Activo' },
    { value: 'devuelto', label: 'Devuelto' },
  ];

  filteredLoans = computed(() => {
    let result = this.loans();
    const name = this.filterName().toLowerCase();
    const status = this.filterStatus();

    const loanDate = this.filterLoanDate();
    const returnDate = this.filterReturnDate();

    if (name) result = result.filter(l => l.usuarioNombre.toLowerCase().includes(name));
    if (status) result = result.filter(l => l.estado === status);
    if (loanDate) result = result.filter(l => l.fechaPrestamo.startsWith(loanDate));
    if (returnDate) result = result.filter(l => l.fechaDevolucion?.startsWith(returnDate));

    return result;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredLoans().length / this.pageSize())));

  paginatedLoans = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredLoans().slice(start, start + this.pageSize());
  });

  startIndex = computed(() => this.filteredLoans().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.pageSize(), this.filteredLoans().length));

  ngOnInit(): void {
    this.loanHistoryService.getAllLoans().subscribe({
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

  onNameFilterChange(event: Event): void {
    this.filterName.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onStatusFilterChange(event: Event): void {
    this.filterStatus.set((event.target as HTMLSelectElement).value as LoanStatus | '');
    this.currentPage.set(1);
  }

  onLoanDateChange(event: Event): void {
    this.filterLoanDate.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onReturnDateChange(event: Event): void {
    this.filterReturnDate.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onPageSizeChange(event: Event): void {
    this.pageSize.set(+(event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }
}
