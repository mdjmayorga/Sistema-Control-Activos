import { Component } from '@angular/core';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';

@Component({
  selector: 'app-damaged-loans',
  standalone: true,
  imports: [PageLayout],
  templateUrl: './damaged-loans.html',
  styleUrl: './damaged-loans.css',
})
export class DamagedLoansPage {
  titulo = 'Prestamos dañados';
  descripcion = 'Consulte los prestamos devueltos con daño reportado';
}
