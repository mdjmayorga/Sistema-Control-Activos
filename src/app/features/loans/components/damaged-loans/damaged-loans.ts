import { Component, OnInit, inject, signal } from '@angular/core';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { DamagedLoanCard, DamagedLoanCardData } from '../damaged-loan-card/damaged-loan-card';
import { DamagedLoansService } from '../../services/damaged-loans.service';

@Component({
  selector: 'app-damaged-loans',
  standalone: true,
  imports: [PageLayout, DamagedLoanCard],
  templateUrl: './damaged-loans.html',
  styleUrl: './damaged-loans.css',
})
export class DamagedLoansPage implements OnInit {
  private readonly damagedLoansService = inject(DamagedLoansService);

  titulo = 'Préstamos dañados';
  descripcion = 'Consulte los préstamos devueltos con daño reportado';

  damagedLoans = signal<DamagedLoanCardData[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

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
    console.log('Resolver reporte:', item.id);
  }
}
