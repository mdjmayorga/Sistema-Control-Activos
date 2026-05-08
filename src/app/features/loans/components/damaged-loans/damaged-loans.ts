import { Component } from '@angular/core';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { DamagedLoanCard, DamagedLoanCardData } from '../damaged-loan-card/damaged-loan-card';

@Component({
  selector: 'app-damaged-loans',
  standalone: true,
  imports: [PageLayout, DamagedLoanCard],
  templateUrl: './damaged-loans.html',
  styleUrl: './damaged-loans.css',
})
export class DamagedLoansPage {
  titulo = 'Prestamos dañados';
  descripcion = 'Consulte los prestamos devueltos con daño reportado';

  damagedLoans: DamagedLoanCardData[] = [
    {
      id: '1',
      activo: 'Trípode de Aluminio',
      usuarioNombre: 'Mario Rojas',
      fechaReporte: '2026-02-05',
      descripcionDanio: 'Pata izquierda doblada, no soporta peso. Tornillo de ajuste roto.',
      severidad: 'severo',
      imagenUrl: '/background-image.png',
      imagenAlt: 'Fotografía del trípode de aluminio dañado',
    },
    {
      id: '2',
      activo: 'Estación Total Topcon',
      usuarioNombre: 'Ana Quirós',
      fechaReporte: '2026-04-28',
      descripcionDanio: 'Pantalla con rayones visibles. Funciona pero la lectura es difícil bajo el sol.',
      severidad: 'moderado',
      imagenUrl: '/background-image.png',
      imagenAlt: 'Fotografía de la estación total dañada',
    },
    {
      id: '2',
      activo: 'Estación Total Topcon',
      usuarioNombre: 'Ana Quirós',
      fechaReporte: '2026-04-28',
      descripcionDanio: 'Pantalla con rayones visibles. Funciona pero la lectura es difícil bajo el sol.',
      severidad: 'moderado',
      imagenUrl: '/background-image.png',
      imagenAlt: 'Fotografía de la estación total dañada',
    },
    {
      id: '2',
      activo: 'Estación Total Topcon',
      usuarioNombre: 'Ana Quirós',
      fechaReporte: '2026-04-28',
      descripcionDanio: 'Pantalla con rayones visibles. Funciona pero la lectura es difícil bajo el sol.',
      severidad: 'moderado',
      imagenUrl: '/background-image.png',
      imagenAlt: 'Fotografía de la estación total dañada',
    },
  ];

  onResolver(item: DamagedLoanCardData): void {
    console.log('Resolver reporte:', item.id);
  }

  onDescartar(item: DamagedLoanCardData): void {
    console.log('Descartar reporte:', item.id);
  }
}
