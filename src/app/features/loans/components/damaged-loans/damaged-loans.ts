import { Component, OnInit, inject, signal } from '@angular/core';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { DamagedLoanCard, DamagedLoanCardData } from '../damaged-loan-card/damaged-loan-card';
import { DamagedLoansService } from '../../services/damaged-loans.service';
import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-damaged-loans',
  standalone: true,
  imports: [PageLayout, DamagedLoanCard, ConfirmModal],
  templateUrl: './damaged-loans.html',
  styleUrls: ['../../../../shared/styles/data-table.css', './damaged-loans.css'],
})
export class DamagedLoansPage implements OnInit {
  private readonly damagedLoansService = inject(DamagedLoansService);

  titulo = 'Préstamos dañados';
  descripcion = 'Consulte los préstamos devueltos con daño reportado';

  damagedLoans = signal<DamagedLoanCardData[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  modalAbierto = signal(false);
  modalCargando = signal(false);
  private prestamoSeleccionado: DamagedLoanCardData | null = null;

  ngOnInit(): void {
    this.damagedLoansService.obtenerPrestamosDanados().subscribe({
      next: (data: DamagedLoanCardData[]) => {
        this.damagedLoans.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los préstamos dañados.');
        this.loading.set(false);
      },
    });
  }

  onResolver(item: DamagedLoanCardData): void {
    this.prestamoSeleccionado = item;
    this.modalAbierto.set(true);
  }

  onConfirmarResolucion(): void {
    if (!this.prestamoSeleccionado) return;
    this.modalCargando.set(true);
    this.damagedLoansService.resolverPrestamoDanado(this.prestamoSeleccionado.id).subscribe({
      complete: () => {
        this.modalCargando.set(false);
        this.modalAbierto.set(false);
        this.prestamoSeleccionado = null;
      },
    });
  }

  onCerrarModal(): void {
    if (this.modalCargando()) return;
    this.modalAbierto.set(false);
    this.prestamoSeleccionado = null;
  }
}
