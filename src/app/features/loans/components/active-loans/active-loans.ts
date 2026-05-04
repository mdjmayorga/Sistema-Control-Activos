import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { ReturnModal } from '../../../returns/components/return-modal/return-modal';
import { Loan } from '../../../../core/models/loan.model';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-active-loans-page',
  standalone: true,
  imports: [PageLayout, DatePipe, ReturnModal],
  templateUrl: './active-loans.html',
  styleUrl: './active-loans.css',
})
export class ActiveLoansPage {
  private readonly loanService = inject(LoanService);

  title = 'Gestión de Préstamos Activos';
  description = 'Consulte y administre todos los préstamos actualmente activos en el sistema.';

  loans = signal<Loan[]>([]);
  loading = signal(true);

  filterName = signal('');
  filterActivo = signal('');
  filterCuadrilla = signal('');
  filterGrupo = signal('');
  filterDate = signal('');

  pageSize = signal(10);
  currentPage = signal(1);
  readonly pageSizeOptions = [5, 10, 15, 20];

  readonly activoOptions = [
    'Trípode de Aluminio', 'Nivel Automático', 'Estaciones Totales(Sokkia)',
    'Estadias', 'Bastón de Prisma', 'Prisma', 'Trípode',
    'Cinta métrica de topografía', 'Odómetro', 'Aplica',
  ];

  readonly cuadrillaOptions = [
    'Cuadrilla 1', 'Cuadrilla 2', 'Cuadrilla 3', 'Cuadrilla 4', 'Cuadrilla 5',
    'Cuadrilla 6', 'Cuadrilla 7', 'Cuadrilla 8', 'Cuadrilla 9', 'Cuadrilla 10',
    'Ninguna',
  ];

  readonly grupoOptions = [
    'Grupo de Topografía', 'Grupo de Taller', 'Grupo de Proyecto',
  ];

  modalOpen = signal(false);
  selectedLoanId = signal('');

  filteredLoans = computed(() => {
    let result = this.loans();
    const name = this.filterName().toLowerCase();
    const activo = this.filterActivo();
    const cuadrilla = this.filterCuadrilla();
    const grupo = this.filterGrupo();

    const date = this.filterDate();

    if (name) result = result.filter(l => l.usuarioNombre.toLowerCase().includes(name));
    if (activo) result = result.filter(l => l.activo === activo);
    if (cuadrilla) result = result.filter(l => l.cuadrilla === cuadrilla);
    if (grupo) result = result.filter(l => l.grupoTopografia === grupo);
    if (date) result = result.filter(l => l.fechaPrestamo.startsWith(date));

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
    this.loanService.obtenerPrestamosActivos().subscribe({
      next: (data) => {
        this.loans.set(data.sort((a, b) => b.fechaPrestamo.localeCompare(a.fechaPrestamo)));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching active loans:', error);
        this.loading.set(false);
      },
    });
  }

  onFilterChange(field: 'name' | 'activo' | 'cuadrilla' | 'grupo' | 'date', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'name') this.filterName.set(value);
    else if (field === 'activo') this.filterActivo.set(value);
    else if (field === 'cuadrilla') this.filterCuadrilla.set(value);
    else if (field === 'grupo') this.filterGrupo.set(value);
    else if (field === 'date') this.filterDate.set(value);
    this.currentPage.set(1);
  }

  onPageSizeChange(event: Event): void {
    this.pageSize.set(+(event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  openReturnModal(loanId: string): void {
    this.selectedLoanId.set(loanId);
    this.modalOpen.set(true);
  }

  closeReturnModal(): void {
    this.modalOpen.set(false);
    this.selectedLoanId.set('');
  }

  async confirmReturn(payload: { productoDanado: boolean }): Promise<void> {
    try {
      await this.loanService.marcarPrestamoComoDevuelto(this.selectedLoanId(), payload.productoDanado);
    } catch (error) {
      console.error('Error returning loan:', error);
    }
    this.modalOpen.set(false);
    this.selectedLoanId.set('');
  }
}
